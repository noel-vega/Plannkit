package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

var (
	tokenStore   = make(map[string]*oauth2.Token)
	tokenStoreMu sync.RWMutex
	oauthConfig  *oauth2.Config
)

func InitGoogleOAuth() {
	oauthConfig = &oauth2.Config{
		ClientID:     "",
		ClientSecret: "",
		RedirectURL:  "http://localhost:8080/auth/google/callback",
		Scopes: []string{
			gmail.GmailReadonlyScope,
			gmail.GmailSendScope,
		},
		Endpoint: google.Endpoint,
	}
}

func HandleLogin(c *gin.Context) {
	fmt.Println("Handle login")
	state := generateRandomString(16)
	url := oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
	fmt.Printf("Redirect: %v\n", url)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func HandleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.AbortWithError(http.StatusBadRequest, fmt.Errorf("missing code"))
		return
	}

	token, err := oauthConfig.Exchange(c, code)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to exchange token: %v", err.Error()))
		return
	}

	sessionID := generateRandomString(32)

	tokenStoreMu.Lock()
	tokenStore[sessionID] = token
	tokenStoreMu.Unlock()

	c.SetCookieData(&http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   86400 * 7,
	})

	// Redirect to frontend
	c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173")
}

func HandleListEmails(c *gin.Context) {
	token, err := getTokenFromRequest(c)
	if err != nil {
		c.AbortWithError(http.StatusUnauthorized, fmt.Errorf("unauthorized: %v", err.Error()))
		return
	}

	client := oauthConfig.Client(c, token)
	svc, err := gmail.NewService(c, option.WithHTTPClient(client))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to create gmail service"))
		return
	}

	resp, err := svc.Users.Messages.List("me").MaxResults(10).Do()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("failed to list messages: %v", err.Error()))
		return
	}

	var emails []Email
	for _, msg := range resp.Messages {
		full, err := svc.Users.Messages.Get("me", msg.Id).Format("full").Do()
		if err != nil {
			continue
		}
		emails = append(emails, parseEmail(full))
	}

	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, emails)
}

func getTokenFromRequest(c *gin.Context) (*oauth2.Token, error) {
	cookie, err := c.Cookie("session_id")
	if err != nil {
		return nil, fmt.Errorf("no session cookie")
	}

	tokenStoreMu.RLock()
	token, ok := tokenStore[cookie]
	tokenStoreMu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("session not found")
	}

	return token, nil
}

func generateRandomString(length int) string {
	bytes := make([]byte, length)
	rand.Read(bytes)
	return base64.URLEncoding.EncodeToString(bytes)[:length]
}

type Email struct {
	ID      string `json:"id"`
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Date    string `json:"date"`
	Snippet string `json:"snippet"`
	Body    string `json:"body"`
}

func parseEmail(msg *gmail.Message) Email {
	email := Email{
		ID:      msg.Id,
		Snippet: msg.Snippet,
	}

	// Extract headers
	for _, header := range msg.Payload.Headers {
		switch header.Name {
		case "From":
			email.From = header.Value
		case "To":
			email.To = header.Value
		case "Subject":
			email.Subject = header.Value
		case "Date":
			email.Date = header.Value
		}
	}

	// Extract body
	email.Body = getBody(msg.Payload)

	return email
}

func getBody(payload *gmail.MessagePart) string {
	// Check if body is directly in payload
	if payload.Body != nil && payload.Body.Data != "" {
		data, err := base64.URLEncoding.DecodeString(payload.Body.Data)
		if err == nil {
			return string(data)
		}
	}

	// Check parts (for multipart messages)
	for _, part := range payload.Parts {
		if part.MimeType == "text/plain" || part.MimeType == "text/html" {
			if part.Body != nil && part.Body.Data != "" {
				data, err := base64.URLEncoding.DecodeString(part.Body.Data)
				if err == nil {
					return string(data)
				}
			}
		}
		// Recursively check nested parts
		if len(part.Parts) > 0 {
			if body := getBody(part); body != "" {
				return body
			}
		}
	}

	return ""
}

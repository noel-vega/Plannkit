package todos

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/httputil"
)

type Handler struct {
	service *Service
}

func NewHandler(todoService *Service) *Handler {
	return &Handler{
		service: todoService,
	}
}

func (h *Handler) CreateTodo(c *gin.Context) {
	userID := httputil.UserID(c)

	body := &CreateTodoBody{}
	err := c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateTodoParams{
		UserID:      userID,
		Name:        body.Name,
		Description: body.Description,
		Status:      body.Status,
		Position:    body.Position,
	}
	err = h.service.CreateTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func (h *Handler) ListTodos(c *gin.Context) {
	todos, err := h.service.ListTodos(httputil.UserID(c))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (h *Handler) GetTodosBoard(c *gin.Context) {
	t, err := h.service.ListTodos(httputil.UserID(c))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	board := map[string][]Todo{}

	for _, todo := range t {
		statusTodos, exists := board[todo.Status]
		if !exists {
			board[todo.Status] = []Todo{todo}
		} else {
			board[todo.Status] = append(statusTodos, todo)
		}
	}
	c.JSON(http.StatusOK, board)
}

func (h *Handler) UpdateTodoPosition(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdatePositionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &UpdatePositionParams{
		ID:             id,
		UserID:         httputil.UserID(c),
		Status:         body.Status,
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
	}
	err = h.service.UpdateTodoPosition(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) DeleteTodo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteTodoParams{
		ID:     id,
		UserID: httputil.UserID(c),
	}
	err = h.service.DeleteTodo(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrTodoNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) GetTodo(c *gin.Context) {
	todoID, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &GetTodoParams{
		ID:     todoID,
		UserID: httputil.UserID(c),
	}
	todo, err := h.service.GetTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, todo)
}

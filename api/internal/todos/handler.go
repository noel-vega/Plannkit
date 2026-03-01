package todos

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	todosService *Service
}

func NewHandler(todoService *Service) *Handler {
	return &Handler{
		todosService: todoService,
	}
}

func (h *Handler) CreateTodo(c *gin.Context) {
	userID := c.MustGet("userID").(int)

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
	err = h.todosService.CreateTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func (h *Handler) ListTodos(c *gin.Context) {
	todos, err := h.todosService.ListTodos(c.MustGet("userID").(int))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (h *Handler) GetTodosBoard(c *gin.Context) {
	t, err := h.todosService.ListTodos(c.MustGet("userID").(int))
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
		UserID:         c.MustGet("userID").(int),
		Status:         body.Status,
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
	}
	err = h.todosService.UpdateTodoPosition(params)
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
		UserID: c.MustGet("userID").(int),
	}
	err = h.todosService.DeleteTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
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
		UserID: c.MustGet("userID").(int),
	}
	todo, err := h.todosService.GetTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, todo)
}

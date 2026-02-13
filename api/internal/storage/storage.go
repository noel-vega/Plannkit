// Package storage
package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

type Service interface {
	Put(folder, fileExt string, r io.Reader) (string, error)
	Get(folder, fileName string) (io.ReadCloser, error)
	Delete(folder, fileName string) error
}

type localStorage struct {
	basePath string
}

func NewLocalStorage(basePath string) Service {
	return &localStorage{
		basePath: basePath,
	}
}

func (l *localStorage) Put(folder, ext string, r io.Reader) (string, error) {
	dir := filepath.Join(l.basePath, folder)

	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}

	fileName := fmt.Sprintf("%s%s", uuid.NewString(), ext)

	file, err := os.Create(filepath.Join(dir, fileName))
	if err != nil {
		return "", err
	}

	if _, err := io.Copy(file, r); err != nil {
		return "", err
	}

	return fileName, err
}

func (l *localStorage) Get(folder, fileName string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(l.basePath, folder, fileName))
}

func (l *localStorage) Delete(folder, fileName string) error {
	return os.Remove(filepath.Join(l.basePath, folder, fileName))
}

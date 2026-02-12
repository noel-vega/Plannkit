.PHONY: help setup install dev api web db-up db-down clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup     - Set up the entire project (install dependencies)"
	@echo "  make install   - Install all dependencies (API + Web)"
	@echo "  make dev       - Run API and Web in parallel"
	@echo "  make api       - Run API server"
	@echo "  make web       - Run Web dev server"
	@echo "  make db-up     - Start database"
	@echo "  make db-down   - Stop database"
	@echo "  make clean     - Clean dependencies and build artifacts"

# Setup the project
setup: install db-up
	@echo "✓ Setup complete!"

# Install all dependencies
install:
	@echo "Installing API dependencies..."
	cd api && go mod download
	@echo "Installing Web dependencies..."
	cd web && npm install
	@echo "✓ Dependencies installed!"

# Run everything in development
dev:
	@echo "Starting development servers..."
	@make -j2 db-up api web

# Run API server
api:
	@echo "Starting API server..."
	cd api && air 

# Run Web dev server
web:
	@echo "Starting Web dev server..."
	cd web && npm run dev

# Start database
db-up:
	@echo "Starting database..."
	docker compose up db -d

# Stop database
db-down:
	@echo "Stopping database..."
	docker compose down

# Clean up
clean:
	@echo "Cleaning up..."
	cd api && go clean
	cd web && rm -rf node_modules dist
	@echo "✓ Cleaned!"

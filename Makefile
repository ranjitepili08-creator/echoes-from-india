.PHONY: dev build test start clean

dev:
	./start.sh

dev-backend:
	backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

build: build-frontend

build-frontend:
	cd frontend && npm run build

test: test-backend

test-backend:
	backend/venv/bin/pytest backend/tests/

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	rm -rf frontend/dist frontend/node_modules backend/__pycache__ backend/app/__pycache__

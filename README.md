# PM Helper - AI-Powered Product Management Assistant

An intelligent system for automating product management document creation, engineering specification generation, and cross-document synchronization.

## Features

- **PMD Generation**: AI-assisted creation of Product Management Documents
- **Spec Building**: Transform PMDs into technical specifications with engineering input  
- **Document Sync**: Automatic updates across related documents
- **Voice Interface**: Optional speech-to-text for hands-free operation

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pmhelper.git
cd pmhelper
```

2. Set up backend:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
createdb pmhelper
python -m alembic upgrade head
```

4. Set up frontend:
```bash
cd ../frontend
npm install
```

### Running the Application

Backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm start
```

Access the application at http://localhost:3000

## Documentation

See [DESIGN.md](DESIGN.md) for detailed system design and architecture.

## API Documentation

When running, API docs are available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Configuration

Key environment variables:
- `OPENAI_API_KEY`: OpenAI API key for LLM integration
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Application secret key

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## License

MIT
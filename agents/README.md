# PM Helper AI Agents

AI agents for PRD creation using OpenAI SDK, integrated with the PM Helper application.

## Overview

This module provides intelligent AI agents that help users create comprehensive Product Requirements Documents (PRDs) through conversational interfaces. The agents are template-aware and follow established PM best practices.

## Features

- **Template-Aware PRD Generation**: Supports 6 different PRD templates (lean, agile, startup, amazon, technical, enterprise)
- **Intelligent Validation**: Validates user input and asks clarifying questions when information is insufficient
- **Conversational Interface**: Natural chat-based interaction for iterative PRD development
- **Integration Ready**: FastAPI server with REST endpoints for frontend integration

## Architecture

```
agents/
├── agents/           # Core agent implementations
├── tools/           # Template loading and validation utilities
├── prompts/         # System prompts and prompt engineering
├── config/          # Configuration management
├── main.py          # FastAPI server
└── requirements.txt # Python dependencies
```

## Setup

### 1. Install Dependencies

```bash
cd agents
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
AGENT_NAME=PRD_Assistant
AGENT_DESCRIPTION=AI Product Manager Assistant for PRD Creation
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Agents Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

## API Endpoints

### Chat with Agent

```http
POST /agents/chat
Content-Type: application/json

{
  "message": "I want to build a fitness tracking app",
  "template_type": "lean",
  "project_id": 123
}
```

### Get Available Templates

```http
GET /agents/templates
```

### Get Template Information

```http
GET /agents/templates/lean
```

### Validate Input

```http
POST /agents/validate
Content-Type: application/json

{
  "input": "Build an app",
  "template_type": "lean"
}
```

### Health Check

```http
GET /health
```

## Usage Examples

### Basic PRD Creation

```python
from pmagents import PRDAgent

agent = PRDAgent()

# Chat with the agent
response = await agent.chat(
    user_message="I want to build a fitness tracking mobile app for beginners",
    template_type="lean"
)

print(response["content"])
```

### Template Information

```python
# Get available templates
templates = agent.get_available_templates()
print(templates)  # ['lean', 'agile', 'startup', 'amazon', 'technical', 'enterprise']

# Get template details
template_info = agent.get_template_info("lean")
print(template_info["sections"])  # ['problem', 'solution', 'metrics', 'mvp', 'risks']
```

## Templates

### Lean PRD

- **Focus**: Minimal viable documentation
- **Sections**: Problem, Solution, Metrics, MVP, Risks
- **Best for**: Startups, rapid prototyping

### Agile PRD

- **Focus**: User stories and acceptance criteria
- **Sections**: User stories, acceptance criteria, sprint planning
- **Best for**: Agile development teams

### Startup PRD

- **Focus**: Hypothesis-driven development
- **Sections**: Hypothesis, experiments, pivot criteria
- **Best for**: Early-stage startups

### Amazon PRD

- **Focus**: Working backwards from press release
- **Sections**: Press release, FAQ, customer experience
- **Best for**: Customer-centric products

### Technical PRD

- **Focus**: Detailed technical specifications
- **Sections**: Architecture, technical requirements, implementation
- **Best for**: Technical products, platform features

### Enterprise PRD

- **Focus**: Comprehensive documentation
- **Sections**: Stakeholder analysis, compliance, risk management
- **Best for**: Enterprise products, regulated industries

## Integration with Frontend

The agents are integrated with the PM Helper frontend through the `agentsApi.ts` client:

```typescript
import { agentsApi } from "@/lib/agentsApi";

// Chat with agent
const response = await agentsApi.chat({
  message: "Build a todo app",
  template_type: "lean",
  project_id: 123,
});

// Get templates
const { templates } = await agentsApi.getTemplates();
```

## Development

### Adding New Templates

1. Create template JSON in `../backend/templates/`
2. Add template-specific prompts in `prompts/system_prompts.py`
3. Update validation rules in `tools/prd_validator.py` if needed

### Extending Agent Capabilities

1. Add new tools in `tools/` directory
2. Update agent initialization in `agents/prd_agent.py`
3. Add corresponding API endpoints in `main.py`

## Testing

```bash
# Run basic health check
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/agents/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Build a fitness app", "template_type": "lean"}'

# Get available templates
curl http://localhost:8000/agents/templates
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**

   - Ensure `OPENAI_API_KEY` is set in `.env`
   - Verify API key is valid and has sufficient credits

2. **Template Not Found**

   - Check that template files exist in `../backend/templates/`
   - Verify template file naming convention: `{type}-prd.json`

3. **Agent Offline in Frontend**
   - Ensure agents server is running on port 8000
   - Check CORS configuration in `main.py`
   - Verify frontend is pointing to correct agent URL

### Logs

The FastAPI server provides detailed logging. Check console output for:

- Startup messages
- Request/response logs
- Error details

## Contributing

1. Follow existing code structure and patterns
2. Add type hints for all functions
3. Update documentation for new features
4. Test integration with frontend components

## License

MIT License - see main project LICENSE file.

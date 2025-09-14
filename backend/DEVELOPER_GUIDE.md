# PM Helper Backend Developer Guide

## Overview

The PM Helper backend is a Node.js/Express.js server that provides API endpoints for PRD (Product Requirements Document) management, template serving, and AI integration via Ollama. The backend acts as a proxy between the React frontend and the local Ollama LLM service.

## Architecture

```
backend/
├── server-simple.js      # Main Express server
├── server.js            # Advanced server with Inkeep integration
├── templates/           # PRD template JSON files
├── tests/              # Test suites
├── package.json        # Dependencies and scripts
└── DEVELOPER_GUIDE.md  # This file
```

## Core Technologies

- **Express.js**: Web framework for Node.js
- **CORS**: Cross-Origin Resource Sharing middleware
- **Axios**: HTTP client for Ollama proxy requests
- **Jest & Supertest**: Testing framework
- **Ollama**: Local LLM integration (external service)

## API Endpoints

### Health Check
```
GET /health
Response: { status: 'healthy', timestamp: ISO-8601 }
```

### PRD Templates
```
GET /api/templates/:type
Parameters:
  - type: lean | agile | startup | amazon | technical | enterprise
Response: Template JSON object
```

### Ollama Proxy Endpoints
```
POST /api/ollama/generate
Body: {
  model: string,
  prompt: string,
  stream: boolean,
  options: { num_predict: number }
}
Response: Ollama generation response

POST /api/ollama/chat
Body: {
  model: string,
  messages: Array<{ role: string, content: string }>,
  stream: boolean
}
Response: Ollama chat response

GET /api/ollama/tags
Response: { models: Array<{ name: string, size: number }> }
```

### Inkeep Integration (server.js only)
```
POST /api/v1/inkeep/search
POST /api/v1/inkeep/chat
```

## Template Structure

Each PRD template (`backend/templates/*-prd.json`) follows this structure:

```json
{
  "name": "Template Name",
  "description": "Template description",
  "sections": {
    "sectionKey": {
      "title": "Section Title",
      "description": "What this section covers",
      "content": "Default content (usually empty)",
      "required": true/false,
      "prompts": [
        "Guiding question 1",
        "Guiding question 2"
      ]
    }
  }
}
```

### Available Templates

1. **lean-prd.json**: Minimal viable documentation
   - Focus on problem, solution, and metrics
   - Best for MVPs and rapid prototyping

2. **agile-prd.json**: Sprint-based development
   - User stories and acceptance criteria
   - Iteration planning

3. **startup-prd.json**: Product-market fit focus
   - Market validation and growth metrics
   - Resource constraints

4. **amazon-prd.json**: Working backwards approach
   - Press release format
   - Customer obsession

5. **technical-prd.json**: Engineering-focused
   - Technical architecture
   - Implementation details

6. **enterprise-prd.json**: Comprehensive documentation
   - Governance and compliance
   - Risk management

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Ollama installed locally (for AI features)
- Port 3001 available (backend)
- Port 11434 available (Ollama)

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start

# Custom port
PORT=3002 npm start
```

### Environment Variables
```bash
PORT=3001           # Server port (default: 3001)
OLLAMA_HOST=http://localhost:11434  # Ollama URL (default: localhost)
```

## Code Walkthrough

### Main Server (server-simple.js)

#### CORS Configuration
```javascript
app.use(cors({
  origin: 'http://localhost:3000',  // React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```

#### Template Serving
```javascript
app.get('/api/templates/:type', (req, res) => {
  const templatePath = path.join(__dirname, 'templates', 
    `${req.params.type}-prd.json`);
  
  if (fs.existsSync(templatePath)) {
    const template = JSON.parse(
      fs.readFileSync(templatePath, 'utf8')
    );
    res.json(template);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});
```

#### Ollama Proxy
The backend proxies requests to Ollama to avoid CORS issues:

```javascript
app.post('/api/ollama/generate', async (req, res) => {
  try {
    const response = await axios.post(
      `${OLLAMA_HOST}/api/generate`,
      req.body,
      { 
        timeout: 300000,  // 5 minutes
        responseType: req.body.stream ? 'stream' : 'json'
      }
    );
    
    if (req.body.stream) {
      response.data.pipe(res);
    } else {
      res.json(response.data);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Ollama request failed',
      details: error.message 
    });
  }
});
```

## Testing

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage  # Coverage report
```

### Test Structure
```javascript
describe('PM Helper Backend Tests', () => {
  describe('Template Endpoints', () => {
    test('GET /api/templates/lean should return lean template', 
      async () => {
        const response = await request(app)
          .get('/api/templates/lean')
          .expect(200);
        
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('sections');
      });
  });
});
```

### Test Coverage Areas
- Health check endpoint
- Template retrieval for all types
- Template validation (structure, required fields)
- Ollama proxy endpoints
- Error handling

## Common Development Tasks

### Adding a New Template
1. Create `backend/templates/new-template-prd.json`
2. Follow the template structure
3. Add test case in `backend/tests/server.test.js`
4. Update this guide's template list

### Modifying Ollama Integration
1. Update proxy endpoints in `server-simple.js`
2. Adjust timeout values if needed
3. Test with actual Ollama instance
4. Update error handling

### Adding New API Endpoints
1. Define route in `server-simple.js`
2. Add input validation
3. Implement business logic
4. Add error handling
5. Write tests
6. Document in this guide

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Optional detailed information"
}
```

### Common Error Scenarios
- 404: Template not found
- 500: Ollama connection failed
- 500: Ollama timeout (>5 minutes)
- 400: Invalid request body

## Performance Considerations

1. **Timeouts**: 5-minute timeout for Ollama requests
2. **Streaming**: Support for streaming responses from Ollama
3. **File Caching**: Templates are read from disk on each request (consider caching)
4. **CORS**: Configured for local development

## Security Notes

1. **CORS**: Currently configured for localhost only
2. **Input Validation**: Minimal validation on template types
3. **Proxy Security**: No authentication on Ollama proxy
4. **Production**: Additional security measures needed:
   - Rate limiting
   - Input sanitization
   - Authentication/authorization
   - HTTPS enforcement

## Debugging Tips

### Check Ollama Connection
```bash
curl http://localhost:11434/api/tags
```

### Test Template Endpoint
```bash
curl http://localhost:3001/api/templates/lean
```

### Monitor Server Logs
```bash
npm run dev  # Shows all console.log output
```

### Common Issues
1. **Port conflicts**: Check if 3001 is in use
2. **Ollama not running**: Start Ollama service
3. **CORS errors**: Verify frontend URL in CORS config
4. **Template not found**: Check file exists and JSON is valid

## Deployment Considerations

### Production Checklist
- [ ] Set appropriate CORS origins
- [ ] Configure environment variables
- [ ] Add rate limiting
- [ ] Implement logging (Winston/Morgan)
- [ ] Add monitoring/health checks
- [ ] Set up error tracking (Sentry)
- [ ] Configure HTTPS
- [ ] Add authentication if needed

### Docker Support
Consider containerizing with:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server-simple.js"]
```

## Contributing

### Code Style
- Use ES6+ features
- Async/await for asynchronous code
- Meaningful variable names
- Comment complex logic
- Handle errors gracefully

### Pull Request Process
1. Write tests for new features
2. Ensure all tests pass
3. Update documentation
4. Follow existing code patterns
5. Test with frontend integration

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Jest Testing](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review test files for usage examples
3. Consult frontend integration in `frontend/src/services/`
4. Test endpoints with curl or Postman
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { generatePRD, prdPrompts } = require('./templates/prd-template');
const { prdTemplates } = require('./templates/prd-templates');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware with proper CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic routes
app.get('/api', (req, res) => {
  res.json({
    message: 'PM Helper API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock Inkeep endpoints
app.post('/api/v1/inkeep/search', (req, res) => {
  res.json({
    query: req.body.query,
    results: [
      {
        id: '1',
        title: 'Sample PRD Document',
        content: 'This is a sample PRD document with relevant content.',
        relevance: 0.95
      },
      {
        id: '2', 
        title: 'User Story Template',
        content: 'Template for creating user stories with acceptance criteria.',
        relevance: 0.87
      }
    ],
    total: 2
  });
});

app.post('/api/v1/inkeep/chat', (req, res) => {
  res.json({
    response: 'This is a mock response from the Inkeep AI assistant. In production, this would provide context-aware assistance based on your product documentation.',
    status: 'success'
  });
});

app.post('/api/v1/inkeep/suggestions', (req, res) => {
  res.json({
    section: req.body.section,
    suggestions: [
      'Consider adding more specific acceptance criteria',
      'Include user personas in your PRD',
      'Add success metrics to measure feature impact'
    ]
  });
});

// PRD Template endpoints
app.get('/api/v1/templates/prd', (req, res) => {
  const { type = 'lean' } = req.query;
  
  // Return new template styles if requested
  if (prdTemplates[type]) {
    res.json({
      ...prdTemplates[type],
      generatedAt: new Date().toISOString()
    });
  } else {
    // Fallback to old template
    const template = generatePRD(type);
    res.json(template);
  }
});

app.get('/api/v1/templates/prd/list', (req, res) => {
  // List all available templates
  const templates = Object.keys(prdTemplates).map(key => ({
    id: key,
    name: prdTemplates[key].name,
    description: prdTemplates[key].description
  }));
  res.json(templates);
});

app.get('/api/v1/templates/prd/prompts', (req, res) => {
  res.json(prdPrompts);
});

app.post('/api/v1/generate/prd', (req, res) => {
  const { title, type = 'lean', data } = req.body;
  const prd = generatePRD(type, {
    title: title || 'New Product Requirements Document',
    ...data
  });
  
  // Simulate AI enhancement with Inkeep
  prd.aiSuggestions = [
    'Consider adding user journey mapping to better understand user flow',
    'Include competitive analysis section for market positioning',
    'Define clear success metrics and KPIs for each feature'
  ];
  
  res.json({
    document: prd,
    message: 'PRD generated successfully',
    inkeepAnalysis: {
      completeness: 75,
      suggestions: prd.aiSuggestions
    }
  });
});

// Proxy endpoint for Ollama to avoid CORS issues
app.post('/api/ollama/generate', async (req, res) => {
  try {
    console.log('Ollama generate request received:', {
      model: req.body.model,
      promptLength: req.body.prompt?.length,
      stream: req.body.stream
    });
    
    const response = await axios.post('http://127.0.0.1:11434/api/generate', req.body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 300000 // 5 minute timeout for complex PRD generation
    });
    
    console.log('Ollama response received, length:', response.data.response?.length || 0);
    res.json(response.data);
  } catch (error) {
    console.error('Ollama proxy error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ 
        error: 'Request timeout',
        message: 'Ollama is taking too long to respond. Try a simpler prompt or check if Ollama is running properly.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to Ollama',
        message: error.message 
      });
    }
  }
});

app.get('/api/ollama/tags', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:11434/api/tags');
    res.json(response.data);
  } catch (error) {
    console.error('Ollama tags error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get Ollama models',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`UI available at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
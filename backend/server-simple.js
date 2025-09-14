const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { generatePRD, prdPrompts } = require('./templates/prd-template');
const { prdTemplates } = require('./templates/prd-templates');
const { specTemplates } = require('./templates/spec-templates');
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

// Specification Template endpoints
app.get('/api/v1/templates/spec', (req, res) => {
  const { type = 'implementation' } = req.query;

  if (specTemplates[type]) {
    res.json({
      ...specTemplates[type],
      generatedAt: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      error: 'Specification template not found',
      availableTypes: Object.keys(specTemplates)
    });
  }
});

app.get('/api/v1/templates/spec/list', (req, res) => {
  const templates = Object.entries(specTemplates).map(([key, template]) => ({
    id: key,
    name: template.name,
    description: template.description
  }));
  res.json(templates);
});

// Specification assessment endpoint - checks if enough info exists
app.post('/api/v1/specs/assess', async (req, res) => {
  const { prd, engineeringNotes, templateType = 'implementation' } = req.body;

  try {
    // Use Ollama to assess if we have enough information
    const assessmentPrompt = `You are a Senior Technical Architect evaluating if you have enough information to create a comprehensive technical specification.

PRD Content:
${JSON.stringify(prd, null, 2)}

Engineering Notes:
${engineeringNotes || 'None provided'}

Required Specification Template: ${specTemplates[templateType]?.name || templateType}

Required sections that need content:
${specTemplates[templateType] ?
  Object.entries(specTemplates[templateType].sections)
    .filter(([_, section]) => section.required)
    .map(([_, section]) => `- ${section.title}`)
    .join('\n') :
  'Template not found'}

Evaluate if you can meaningfully fill each required section.
Consider:
1. Is the technology stack specified or clearly inferrable?
2. Are performance requirements clear?
3. Are integration points identified?
4. Is team capacity/expertise mentioned?
5. Are security requirements addressed?

Respond with ONLY one word: "SUFFICIENT" or "NEEDS_INFO"`;

    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: 'mistral:7b-instruct',
      messages: [{ role: 'user', content: assessmentPrompt }],
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 10
      }
    }, {
      timeout: 120000  // Increased to 2 minutes
    });

    const assessment = response.data.message?.content || '';
    const isSufficient = assessment.toUpperCase().includes('SUFFICIENT');

    res.json({
      sufficient: isSufficient,
      assessment: assessment.trim(),
      missingAreas: isSufficient ? [] : [
        'Technology stack details',
        'Performance requirements',
        'Security constraints',
        'Team expertise',
        'Timeline and milestones'
      ]
    });
  } catch (error) {
    console.error('Specification assessment error:', error);
    res.status(500).json({
      error: 'Failed to assess specification readiness',
      message: error.message
    });
  }
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

// Background job endpoints for long-running operations
const jobManager = require('./services/backgroundJobs');

// Start a background job for specification generation
app.post('/api/jobs/generate-specification', (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const jobId = jobManager.createJob('generate-specification', {
    prompt,
    model: model || 'mistral:7b-instruct'
  });

  console.log(`Created background job ${jobId} for specification generation`);

  res.json({
    jobId,
    message: 'Specification generation started in background',
    checkStatusUrl: `/api/jobs/${jobId}/status`,
    getResultUrl: `/api/jobs/${jobId}/result`
  });
});

// Check job status
app.get('/api/jobs/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  const status = jobManager.getJobStatus(jobId);

  if (!status) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(status);
});

// Get job result
app.get('/api/jobs/:jobId/result', (req, res) => {
  const { jobId } = req.params;
  const result = jobManager.getJobResult(jobId);

  if (!result) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(result);
});

// List all jobs
app.get('/api/jobs', (req, res) => {
  const jobs = jobManager.getAllJobs();
  res.json(jobs);
});

// Cancel a job
app.delete('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const cancelled = jobManager.cancelJob(jobId);

  if (cancelled) {
    res.json({ message: 'Job cancelled successfully' });
  } else {
    res.status(400).json({ error: 'Job cannot be cancelled or not found' });
  }
});

// Start server
// Only start server if not being imported for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`UI available at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
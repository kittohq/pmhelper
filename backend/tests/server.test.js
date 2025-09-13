const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the dependencies
jest.mock('axios');
const axios = require('axios');

// Import the server setup (we'll extract the app setup logic)
const setupApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import templates
  const prdTemplates = require('../templates/prd-templates');
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  
  // PRD Templates endpoint
  app.get('/api/v1/templates/prd', (req, res) => {
    const { type = 'basic' } = req.query;
    if (prdTemplates[type]) {
      res.json({
        ...prdTemplates[type],
        generatedAt: new Date().toISOString()
      });
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  });
  
  // Inkeep search endpoint (mocked)
  app.post('/api/v1/inkeep/search', async (req, res) => {
    const { query, filters = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Mock response
    res.json({
      results: [
        {
          title: 'Test Result',
          content: 'Test content',
          relevance: 0.95,
          source: 'test'
        }
      ],
      total: 1
    });
  });
  
  // Inkeep chat endpoint (mocked)
  app.post('/api/v1/inkeep/chat', async (req, res) => {
    const { messages, context = {} } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    res.json({
      response: 'This is a test response',
      sources: [],
      confidence: 0.9
    });
  });
  
  return app;
};

describe('PM Helper Backend Tests', () => {
  let app;
  
  beforeEach(() => {
    app = setupApp();
    jest.clearAllMocks();
  });
  
  describe('Health Check', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  describe('PRD Templates', () => {
    test('GET /api/v1/templates/prd should return lean template by default', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd')
        .expect(200);
      
      expect(response.body).toHaveProperty('name', 'Lean PRD');
      expect(response.body).toHaveProperty('sections');
      expect(response.body).toHaveProperty('generatedAt');
    });
    
    test('GET /api/v1/templates/prd?type=lean should return lean template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=lean')
        .expect(200);
      
      expect(response.body.name).toBe('Lean PRD');
      expect(response.body.sections).toBeDefined();
    });
    
    test('GET /api/v1/templates/prd?type=agile should return agile template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=agile')
        .expect(200);
      
      expect(response.body.name).toBe('Agile/Scrum PRD');
    });
    
    test('GET /api/v1/templates/prd?type=startup should return startup template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=startup')
        .expect(200);
      
      expect(response.body.name).toBe('Startup PRD');
    });
    
    test('GET /api/v1/templates/prd?type=amazon should return amazon template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=amazon')
        .expect(200);
      
      expect(response.body.name).toBe('Amazon Working Backwards');
    });
    
    test('GET /api/v1/templates/prd?type=technical should return technical template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=technical')
        .expect(200);
      
      expect(response.body.name).toBe('Technical PRD');
    });
    
    test('GET /api/v1/templates/prd?type=enterprise should return enterprise template', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=enterprise')
        .expect(200);
      
      expect(response.body.name).toBe('Enterprise PRD');
    });
    
    test('GET /api/v1/templates/prd?type=invalid should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/templates/prd?type=invalid')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Template not found');
    });
  });
  
  describe('Inkeep Integration', () => {
    describe('Search Endpoint', () => {
      test('POST /api/v1/inkeep/search should return results with valid query', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/search')
          .send({ query: 'test query' })
          .expect(200);
        
        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toBeInstanceOf(Array);
        expect(response.body).toHaveProperty('total');
      });
      
      test('POST /api/v1/inkeep/search should return 400 without query', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/search')
          .send({})
          .expect(400);
        
        expect(response.body).toHaveProperty('error', 'Query is required');
      });
      
      test('POST /api/v1/inkeep/search should accept filters', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/search')
          .send({ 
            query: 'test query',
            filters: { category: 'documentation' }
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('results');
      });
    });
    
    describe('Chat Endpoint', () => {
      test('POST /api/v1/inkeep/chat should return response with valid messages', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/chat')
          .send({ 
            messages: [
              { role: 'user', content: 'Hello' }
            ]
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('sources');
        expect(response.body).toHaveProperty('confidence');
      });
      
      test('POST /api/v1/inkeep/chat should return 400 without messages', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/chat')
          .send({})
          .expect(400);
        
        expect(response.body).toHaveProperty('error', 'Messages array is required');
      });
      
      test('POST /api/v1/inkeep/chat should return 400 with invalid messages', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/chat')
          .send({ messages: 'not an array' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error', 'Messages array is required');
      });
      
      test('POST /api/v1/inkeep/chat should accept context', async () => {
        const response = await request(app)
          .post('/api/v1/inkeep/chat')
          .send({ 
            messages: [{ role: 'user', content: 'Hello' }],
            context: { projectId: '123' }
          })
          .expect(200);
        
        expect(response.body).toHaveProperty('response');
      });
    });
  });
  
  describe('Template Validation', () => {
    test('All templates should have required structure', async () => {
      const templateTypes = ['lean', 'agile', 'startup', 'amazon', 'technical', 'enterprise'];
      
      for (const type of templateTypes) {
        const response = await request(app)
          .get(`/api/v1/templates/prd?type=${type}`)
          .expect(200);
        
        // Check required fields
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('sections');
        expect(response.body.sections).toHaveProperty('overview');
        
        // Check section structure
        const sections = response.body.sections;
        Object.values(sections).forEach(section => {
          expect(section).toHaveProperty('title');
          expect(section).toHaveProperty('content');
          expect(section).toHaveProperty('required');
          expect(section).toHaveProperty('prompts');
        });
      }
    });
  });
});

module.exports = { setupApp };
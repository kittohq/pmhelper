const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock axios for Ollama calls
jest.mock('axios');
const axios = require('axios');

describe('PM Helper Backend Tests', () => {
  let app;
  
  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(require('cors')());
    
    // Templates endpoint
    app.get('/api/templates/:type', (req, res) => {
      const templatePath = path.join(__dirname, '..', 'templates', `${req.params.type}-prd.json`);
      
      if (fs.existsSync(templatePath)) {
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        res.json(template);
      } else {
        res.status(404).json({ error: 'Template not found' });
      }
    });
    
    // Ollama proxy endpoint
    app.post('/api/ollama/generate', async (req, res) => {
      // Mock Ollama response
      axios.post.mockResolvedValue({
        data: {
          model: 'mistral:7b-instruct',
          response: 'Mocked AI response for testing',
          done: true
        }
      });
      
      try {
        const response = await axios.post('http://localhost:11434/api/generate', req.body);
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Ollama request failed' });
      }
    });
    
    // Ollama tags endpoint
    app.get('/api/ollama/tags', async (req, res) => {
      axios.get.mockResolvedValue({
        data: {
          models: [
            { name: 'mistral:7b-instruct', size: 4109865159 }
          ]
        }
      });
      
      try {
        const response = await axios.get('http://localhost:11434/api/tags');
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get models' });
      }
    });
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  });
  
  beforeEach(() => {
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
  
  describe('Template Endpoints', () => {
    const templateTypes = ['lean', 'agile', 'startup', 'amazon', 'technical', 'enterprise'];
    
    templateTypes.forEach(type => {
      test(`GET /api/templates/${type} should return ${type} template`, async () => {
        const response = await request(app)
          .get(`/api/templates/${type}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('sections');
        
        // Validate section structure
        const sections = response.body.sections;
        expect(sections).toBeDefined();
        
        Object.values(sections).forEach(section => {
          expect(section).toHaveProperty('title');
          expect(section).toHaveProperty('content');
          expect(section).toHaveProperty('required');
          expect(section).toHaveProperty('prompts');
          expect(Array.isArray(section.prompts)).toBe(true);
        });
      });
    });
    
    test('GET /api/templates/invalid should return 404', async () => {
      const response = await request(app)
        .get('/api/templates/invalid')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Template not found');
    });
  });
  
  describe('Ollama Proxy Endpoints', () => {
    test('POST /api/ollama/generate should proxy to Ollama', async () => {
      const requestBody = {
        model: 'mistral:7b-instruct',
        prompt: 'Test prompt',
        stream: false
      };
      
      const response = await request(app)
        .post('/api/ollama/generate')
        .send(requestBody)
        .expect(200);
      
      expect(response.body).toHaveProperty('model', 'mistral:7b-instruct');
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('done', true);
      
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        requestBody
      );
    });
    
    test('GET /api/ollama/tags should return available models', async () => {
      const response = await request(app)
        .get('/api/ollama/tags')
        .expect(200);
      
      expect(response.body).toHaveProperty('models');
      expect(Array.isArray(response.body.models)).toBe(true);
      expect(response.body.models[0]).toHaveProperty('name', 'mistral:7b-instruct');
      
      // Verify axios was called
      expect(axios.get).toHaveBeenCalledWith('http://localhost:11434/api/tags');
    });
    
    test('POST /api/ollama/generate should handle errors', async () => {
      axios.post.mockRejectedValue(new Error('Connection failed'));
      
      const response = await request(app)
        .post('/api/ollama/generate')
        .send({ model: 'test', prompt: 'test' })
        .expect(500);
      
      expect(response.body).toHaveProperty('error', 'Ollama request failed');
    });
  });
  
  describe('Template Validation', () => {
    test('Lean template should have minimal sections', async () => {
      const response = await request(app)
        .get('/api/templates/lean')
        .expect(200);
      
      const sections = Object.keys(response.body.sections);
      expect(sections).toContain('problem');
      expect(sections).toContain('solution');
      expect(sections).toContain('metrics');
    });
    
    test('Enterprise template should have comprehensive sections', async () => {
      const response = await request(app)
        .get('/api/templates/enterprise')
        .expect(200);
      
      const sections = Object.keys(response.body.sections);
      expect(sections).toContain('executiveSummary');
      expect(sections).toContain('businessContext');
      expect(sections).toContain('requirements');
      expect(sections).toContain('governance');
      expect(sections).toContain('riskManagement');
    });
    
    test('All templates should have valid JSON structure', async () => {
      const templateTypes = ['lean', 'agile', 'startup', 'amazon', 'technical', 'enterprise'];
      
      for (const type of templateTypes) {
        const response = await request(app)
          .get(`/api/templates/${type}`)
          .expect(200);
        
        // Should be valid JSON (no parsing errors)
        expect(() => JSON.stringify(response.body)).not.toThrow();
        
        // Required top-level fields
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('sections');
        expect(typeof response.body.name).toBe('string');
        expect(typeof response.body.description).toBe('string');
        expect(typeof response.body.sections).toBe('object');
      }
    });
  });
});
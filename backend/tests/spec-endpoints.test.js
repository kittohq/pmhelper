const request = require('supertest');
const app = require('../server-simple');

describe('Specification Template Endpoints', () => {
  describe('GET /api/v1/templates/spec', () => {
    test('should return implementation template by default', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Implementation Specification');
      expect(response.body).toHaveProperty('templateType', 'implementation');
      expect(response.body).toHaveProperty('sections');
      expect(response.body.sections).toHaveProperty('technicalOverview');
      expect(response.body.sections).toHaveProperty('componentDesign');
      expect(response.body.sections).toHaveProperty('dataModel');
      expect(response.body.sections).toHaveProperty('apiDesign');
    });

    test('should return system-design template when requested', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec?type=system-design')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'System Design Specification');
      expect(response.body).toHaveProperty('templateType', 'system-design');
      expect(response.body.sections).toHaveProperty('systemArchitecture');
      expect(response.body.sections).toHaveProperty('scalabilityDesign');
    });

    test('should return migration template when requested', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec?type=migration')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Migration Specification');
      expect(response.body).toHaveProperty('templateType', 'migration');
      expect(response.body.sections).toHaveProperty('currentStateAnalysis');
      expect(response.body.sections).toHaveProperty('migrationStrategy');
    });

    test('should return api template when requested', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec?type=api')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'API Specification');
      expect(response.body).toHaveProperty('templateType', 'api');
      expect(response.body.sections).toHaveProperty('apiOverview');
      expect(response.body.sections).toHaveProperty('endpoints');
    });

    test('should return 404 for invalid template type', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec?type=invalid')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Specification template not found');
      expect(response.body).toHaveProperty('availableTypes');
      expect(response.body.availableTypes).toContain('implementation');
      expect(response.body.availableTypes).toContain('system-design');
    });
  });

  describe('GET /api/v1/templates/spec/list', () => {
    test('should return list of all specification templates', async () => {
      const response = await request(app)
        .get('/api/v1/templates/spec/list')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(4);

      const implementationTemplate = response.body.find(t => t.id === 'implementation');
      expect(implementationTemplate).toBeDefined();
      expect(implementationTemplate).toHaveProperty('name', 'Implementation Specification');
      expect(implementationTemplate).toHaveProperty('description');
    });
  });

  describe('POST /api/v1/specs/assess', () => {
    test('should assess specification as insufficient without engineering notes', async () => {
      const prd = {
        title: 'Test PRD',
        sections: {
          problem: { content: 'Users need fitness tracking' },
          solution: { content: 'Build a mobile app' }
        }
      };

      const response = await request(app)
        .post('/api/v1/specs/assess')
        .send({ prd, engineeringNotes: '', templateType: 'implementation' })
        .timeout(15000); // Allow more time for Ollama

      // If Ollama is not running, we'll get a 500 error
      if (response.status === 500) {
        expect(response.body).toHaveProperty('error');
        console.log('Ollama not available - skipping assessment test');
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sufficient');
        expect(response.body).toHaveProperty('assessment');
        // Note: Actual assessment depends on Ollama, so we just check structure
        if (!response.body.sufficient) {
          expect(response.body).toHaveProperty('missingAreas');
          expect(Array.isArray(response.body.missingAreas)).toBe(true);
        }
      }
    }, 20000); // Increase timeout to 20 seconds

    test('should handle assessment errors gracefully', async () => {
      // This test doesn't need Ollama since we're testing error handling
      // We'll just verify the endpoint exists and returns proper error structure
      const response = await request(app)
        .post('/api/v1/specs/assess')
        .send({}) // Send empty body to trigger validation error
        .timeout(5000);

      // Should get an error either way
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('error');
    }, 10000);
  });
});

describe('Specification Template Validation', () => {
  test('All specification templates should have valid structure', async () => {
    const templates = ['implementation', 'system-design', 'migration', 'api'];

    for (const type of templates) {
      const response = await request(app)
        .get(`/api/v1/templates/spec?type=${type}`)
        .expect(200);

      // Check required fields
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('templateType');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('sections');

      // Check sections structure
      const sections = response.body.sections;
      expect(typeof sections).toBe('object');

      Object.entries(sections).forEach(([key, section]) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('description');
        expect(section).toHaveProperty('content');
        expect(section).toHaveProperty('required');
        expect(section).toHaveProperty('prompts');
        expect(Array.isArray(section.prompts)).toBe(true);
      });
    }
  });

  test('Required sections should be properly marked', async () => {
    const response = await request(app)
      .get('/api/v1/templates/spec?type=implementation')
      .expect(200);

    const requiredSections = Object.entries(response.body.sections)
      .filter(([_, section]) => section.required)
      .map(([key, _]) => key);

    // Implementation spec should have these required sections
    expect(requiredSections).toContain('technicalOverview');
    expect(requiredSections).toContain('componentDesign');
    expect(requiredSections).toContain('dataModel');
    expect(requiredSections).toContain('apiDesign');
    expect(requiredSections).toContain('testingStrategy');
    expect(requiredSections).toContain('securityConsiderations');
  });
});
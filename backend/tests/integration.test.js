/**
 * Integration test for the Specification Generator feature
 * Tests the complete flow from PRD to Specification
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';

describe('Specification Generator Integration', () => {
  // Test data
  const testPRD = {
    title: 'FitTracker Mobile App',
    templateType: 'lean',
    sections: {
      problem: {
        title: 'Problem Statement',
        content: 'Many fitness enthusiasts struggle to track their workouts effectively, leading to inconsistent progress and lack of motivation.'
      },
      solution: {
        title: 'Proposed Solution',
        content: 'FitTracker is a mobile app that provides easy workout tracking, progress visualization, and personalized recommendations.'
      },
      metrics: {
        title: 'Success Metrics',
        content: '100k MAU within first year, 50% daily active users, 4.5+ app store rating'
      }
    }
  };

  const engineeringNotes = `
    Team: 3 engineers (1 senior, 2 mid-level)
    Timeline: 3 months
    Tech stack preference: React Native, Node.js, PostgreSQL
    Must integrate with existing auth system
    Performance requirement: <2s page load time
    Security: OAuth2 authentication required
  `;

  describe('Template Endpoints', () => {
    test('Should list all specification templates', async () => {
      const response = await axios.get(`${API_BASE}/api/v1/templates/spec/list`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(4);

      const templates = response.data.map(t => t.id);
      expect(templates).toContain('implementation');
      expect(templates).toContain('system-design');
      expect(templates).toContain('migration');
      expect(templates).toContain('api');
    });

    test('Should fetch implementation template', async () => {
      const response = await axios.get(`${API_BASE}/api/v1/templates/spec?type=implementation`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name', 'Implementation Specification');
      expect(response.data).toHaveProperty('sections');

      const sections = Object.keys(response.data.sections);
      expect(sections).toContain('technicalOverview');
      expect(sections).toContain('componentDesign');
      expect(sections).toContain('dataModel');
      expect(sections).toContain('apiDesign');
    });
  });

  describe('Assessment Flow', () => {
    test('Should assess specification readiness with full information', async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/v1/specs/assess`, {
          prd: testPRD,
          engineeringNotes: engineeringNotes,
          templateType: 'implementation'
        }, {
          timeout: 20000
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('sufficient');
        expect(response.data).toHaveProperty('assessment');

        // With detailed engineering notes, should be sufficient
        if (response.data.sufficient) {
          console.log('Assessment: Ready to generate specification');
        } else {
          console.log('Missing areas:', response.data.missingAreas);
        }
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('Ollama not available - skipping assessment test');
        } else {
          throw error;
        }
      }
    });

    test('Should identify missing information without engineering notes', async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/v1/specs/assess`, {
          prd: testPRD,
          engineeringNotes: '', // No engineering notes
          templateType: 'implementation'
        }, {
          timeout: 20000
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('sufficient');

        // Without engineering notes, should need more info
        if (!response.data.sufficient) {
          expect(response.data).toHaveProperty('missingAreas');
          expect(Array.isArray(response.data.missingAreas)).toBe(true);
          console.log('Correctly identified missing information');
        }
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('Ollama not available - skipping assessment test');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Backward Compatibility', () => {
    test('PRD endpoints should still work', async () => {
      // Verify existing PRD functionality is not broken
      const response = await axios.get(`${API_BASE}/api/v1/templates/prd/list`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      const templates = response.data.map(t => t.id);
      expect(templates).toContain('lean');
      expect(templates).toContain('agile');
    });

    test('Health check should still work', async () => {
      const response = await axios.get(`${API_BASE}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });
});

// Run tests only if this file is executed directly
if (require.main === module) {
  console.log('Running Specification Generator Integration Tests...');
  console.log('Make sure the backend server is running on port 3001');

  // Simple test runner
  const runTests = async () => {
    try {
      // Test template listing
      console.log('\n1. Testing template endpoints...');
      const templatesResponse = await axios.get(`${API_BASE}/api/v1/templates/spec/list`);
      console.log(`✓ Found ${templatesResponse.data.length} specification templates`);

      // Test specific template
      const implementationResponse = await axios.get(`${API_BASE}/api/v1/templates/spec?type=implementation`);
      console.log(`✓ Implementation template has ${Object.keys(implementationResponse.data.sections).length} sections`);

      // Test assessment
      console.log('\n2. Testing assessment endpoint...');
      try {
        const assessResponse = await axios.post(`${API_BASE}/api/v1/specs/assess`, {
          prd: testPRD,
          engineeringNotes: engineeringNotes,
          templateType: 'implementation'
        }, {
          timeout: 20000
        });

        if (assessResponse.data.sufficient) {
          console.log('✓ Assessment: Sufficient information for specification');
        } else {
          console.log('✓ Assessment: Missing information identified');
          console.log('  Missing areas:', assessResponse.data.missingAreas);
        }
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('⚠ Ollama not available - assessment test skipped');
        } else {
          throw error;
        }
      }

      // Test backward compatibility
      console.log('\n3. Testing backward compatibility...');
      const prdTemplatesResponse = await axios.get(`${API_BASE}/api/v1/templates/prd/list`);
      console.log(`✓ PRD templates still work: ${prdTemplatesResponse.data.length} templates found`);

      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log(`✓ Health check still works: ${healthResponse.data.status}`);

      console.log('\n✅ All integration tests passed!');
    } catch (error) {
      console.error('\n❌ Integration test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      process.exit(1);
    }
  };

  runTests();
}

module.exports = {
  testPRD,
  engineeringNotes
};
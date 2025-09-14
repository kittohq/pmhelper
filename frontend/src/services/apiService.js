import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3003/api';
  }

  async getPRDTemplate(type = 'basic') {
    try {
      const response = await axios.get(`${this.baseURL}/v1/templates/prd?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get PRD template:', error);
      throw error;
    }
  }

  async generatePRD(data) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/generate/prd`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate PRD:', error);
      throw error;
    }
  }

  async searchWithInkeep(query) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/inkeep/search`, {
        query,
        limit: 10
      });
      return response.data;
    } catch (error) {
      console.error('Inkeep search failed:', error);
      throw error;
    }
  }

  async getInkeepSuggestions(section, content) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/inkeep/suggestions`, {
        section,
        currentContent: content
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Failed to get Inkeep suggestions:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
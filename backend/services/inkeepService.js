const axios = require('axios');
const { getRedis } = require('../config/redis');

class InkeepService {
  constructor() {
    this.apiKey = process.env.INKEEP_API_KEY;
    this.apiUrl = process.env.INKEEP_API_URL || 'https://api.inkeep.com/v1';
    this.integrationId = process.env.INKEEP_INTEGRATION_ID;
    this.redis = getRedis();
  }

  async search(query, filters = {}, limit = 10) {
    try {
      const cacheKey = `inkeep:search:${JSON.stringify({ query, filters, limit })}`;
      
      if (this.redis) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const response = await axios.post(
        `${this.apiUrl}/search`,
        {
          query,
          filters,
          limit,
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const results = response.data.results || [];
      
      if (this.redis) {
        await this.redis.setex(cacheKey, 300, JSON.stringify(results));
      }

      return results;
    } catch (error) {
      console.error('Inkeep search error:', error);
      throw new Error('Failed to search documents');
    }
  }

  async chat(messages, context = {}, stream = false) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat`,
        {
          messages,
          context,
          stream,
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        response: response.data.response,
        metadata: response.data.metadata || {},
        status: 'success'
      };
    } catch (error) {
      console.error('Inkeep chat error:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  async getSuggestions(documentType, section, currentContent, context = {}) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/suggestions`,
        {
          document_type: documentType,
          section,
          current_content: currentContent,
          context,
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.suggestions || [];
    } catch (error) {
      console.error('Inkeep suggestions error:', error);
      return [];
    }
  }

  async validateDocument(document) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/validate`,
        {
          document: {
            id: document._id,
            type: document.type,
            content: document.content,
            title: document.title
          },
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: response.data.status || 'unknown',
        issues: response.data.issues || [],
        suggestions: response.data.suggestions || [],
        score: response.data.score
      };
    } catch (error) {
      console.error('Inkeep validation error:', error);
      return {
        status: 'error',
        issues: ['Validation failed'],
        suggestions: []
      };
    }
  }

  async findSimilarDocuments(document, limit = 5) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/similar`,
        {
          document: {
            id: document._id,
            content: document.content,
            title: document.title,
            type: document.type
          },
          limit,
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.similar || [];
    } catch (error) {
      console.error('Inkeep similar documents error:', error);
      return [];
    }
  }

  async generateCrossReferences(document) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/references`,
        {
          document: {
            id: document._id,
            content: document.content,
            title: document.title,
            type: document.type
          },
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.references || [];
    } catch (error) {
      console.error('Inkeep cross-references error:', error);
      return [];
    }
  }

  async indexDocument(document, forceUpdate = false) {
    try {
      const inkeepId = this.generateInkeepId(document._id);
      
      if (!forceUpdate && document.metadata?.inkeepIndexed) {
        return {
          status: 'already_indexed',
          inkeep_id: inkeepId
        };
      }

      const response = await axios.post(
        `${this.apiUrl}/index`,
        {
          document: {
            id: inkeepId,
            title: document.title,
            content: document.content,
            type: document.type,
            metadata: {
              owner: document.owner,
              tags: document.tags,
              status: document.status,
              created_at: document.createdAt,
              updated_at: document.updatedAt
            }
          },
          integration_id: this.integrationId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      document.metadata = document.metadata || {};
      document.metadata.inkeepIndexed = true;
      document.metadata.inkeepId = inkeepId;
      await document.save();

      return {
        status: 'success',
        inkeep_id: inkeepId,
        message: 'Document indexed successfully'
      };
    } catch (error) {
      console.error('Inkeep indexing error:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  generateInkeepId(documentId) {
    return `${this.integrationId}_${documentId}`;
  }
}

module.exports = InkeepService;
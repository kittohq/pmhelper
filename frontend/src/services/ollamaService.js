import axios from 'axios';

class OllamaService {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.model = 'mistral:7b-instruct'; // Using your Mistral model
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection check failed:', error);
      return false;
    }
  }

  async getModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }

  async chat(prompt, context = '') {
    try {
      // Enhanced logging
      const logData = {
        timestamp: new Date().toISOString(),
        model: this.model,
        promptLength: prompt.length,
        contextLength: context.length,
        prompt: prompt,
        context: context
      };
      
      console.log('===== OLLAMA REQUEST START =====');
      console.log('Timestamp:', logData.timestamp);
      console.log('Model:', logData.model);
      console.log('Prompt Length:', logData.promptLength);
      console.log('Context Length:', logData.contextLength);
      console.log('Full Prompt:', prompt);
      if (context) {
        console.log('Context:', context);
      }
      console.log('===== OLLAMA REQUEST END =====');
      
      // Add timeout and simplified prompt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        context: context,
        options: {
          temperature: 0.7,
          top_k: 40,
          top_p: 0.9,
          num_predict: 500 // Increased for better responses
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        timeout: 15000
      });

      clearTimeout(timeoutId);
      
      console.log('===== OLLAMA RESPONSE START =====');
      console.log('Response received at:', new Date().toISOString());
      console.log('Response length:', response.data.response?.length || 0);
      console.log('Response:', response.data.response || response.data);
      console.log('===== OLLAMA RESPONSE END =====');
      
      return response.data.response || response.data;
    } catch (error) {
      console.error('===== OLLAMA ERROR =====');
      console.error('Error at:', new Date().toISOString());
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timeout - Ollama is taking too long to respond');
      }
      
      throw new Error('Ollama is not responding. Using fallback responses.');
    }
  }

  async streamChat(prompt, context = '', onChunk) {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          context: context,
          stream: true
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullResponse += json.response;
              onChunk(json.response);
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Ollama stream chat error:', error);
      throw new Error('Failed to stream response from Ollama');
    }
  }

  setModel(modelName) {
    this.model = modelName;
  }

  async generatePRDSuggestions(prdSection, currentContent) {
    const prompt = `
      As a Product Manager, provide specific suggestions to improve this section of a Product Requirements Document.
      
      Section: ${prdSection.title}
      Current Content: ${currentContent || 'Empty'}
      
      Provide 3-5 specific, actionable suggestions to improve this section.
      Format your response as a numbered list.
    `;

    return await this.chat(prompt);
  }

  async analyzePRD(prd) {
    const prompt = `
      Analyze this Product Requirements Document and provide feedback.
      
      PRD: ${JSON.stringify(prd, null, 2)}
      
      Provide:
      1. Completeness score (0-100%)
      2. Missing critical sections
      3. Areas that need more detail
      4. Strengths of the current PRD
      5. Top 3 recommendations for improvement
      
      Format your response in a clear, structured way.
    `;

    return await this.chat(prompt);
  }
}

export const ollamaService = new OllamaService();
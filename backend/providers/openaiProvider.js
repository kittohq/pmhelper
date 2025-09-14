const axios = require('axios');

class OpenAIProvider {
  constructor() {
    this.baseURL = 'https://api.openai.com/v1';
  }

  async checkConnection(apiKey) {
    if (!apiKey) {
      return { connected: false, error: 'API key is required' };
    }

    try {
      // Test the API key by listing models
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        connected: true,
        models: response.data.data.filter(m => m.id.includes('gpt'))
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return { connected: false, error: 'Invalid API key' };
      }
      return { connected: false, error: error.message };
    }
  }

  async chat(params) {
    const { model, prompt, context, apiKey, options = {} } = params;

    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    try {
      // Build messages array for chat completion
      const messages = [];

      // Add system message if context provided
      if (context) {
        messages.push({
          role: 'system',
          content: context
        });
      }

      // Add user message
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model || 'gpt-3.5-turbo',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4096,
          top_p: options.top_p || 1,
          frequency_penalty: options.frequency_penalty || 0,
          presence_penalty: options.presence_penalty || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        response: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
      }

      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateLong(params) {
    // For long generation, we can use the same chat endpoint
    // but with higher max_tokens
    return this.chat({
      ...params,
      options: {
        ...params.options,
        maxTokens: 8192 // Higher limit for specifications
      }
    });
  }

  // Estimate cost for a request
  estimateCost(model, promptTokens, completionTokens) {
    // Pricing as of 2024 (per 1K tokens)
    const pricing = {
      'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },  // Cheapest!
      'gpt-4o': { prompt: 0.005, completion: 0.015 },
      'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;

    return {
      promptCost,
      completionCost,
      totalCost: promptCost + completionCost,
      formattedCost: `$${(promptCost + completionCost).toFixed(4)}`
    };
  }
}

module.exports = new OpenAIProvider();
const axios = require('axios');

class AnthropicProvider {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async checkConnection(apiKey) {
    if (!apiKey) {
      return { connected: false, error: 'API key is required' };
    }

    try {
      // Test the API key with a minimal request
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        connected: true,
        testResponse: response.data
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
      throw new Error('Anthropic API key is required');
    }

    try {
      // Build messages array for Claude
      const messages = [];

      // Claude doesn't use system messages in the same way
      // We'll prepend context to the user message if provided
      let fullPrompt = prompt;
      if (context) {
        fullPrompt = `Context: ${context}\n\n${prompt}`;
      }

      messages.push({
        role: 'user',
        content: fullPrompt
      });

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: model || 'claude-3-sonnet-20240229',
          messages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 1,
          top_k: options.top_k || undefined,
          stop_sequences: options.stopSequences || undefined
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract the text content from Claude's response
      const content = response.data.content[0].text;

      return {
        response: content,
        usage: {
          input_tokens: response.data.usage.input_tokens,
          output_tokens: response.data.usage.output_tokens
        },
        model: response.data.model,
        stop_reason: response.data.stop_reason
      };
    } catch (error) {
      console.error('Anthropic API error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Invalid Anthropic API key');
      } else if (error.response?.status === 429) {
        throw new Error('Anthropic rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.error?.message || 'Bad request';
        throw new Error(`Anthropic API error: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        throw new Error('Model not found. Please check the model name.');
      }

      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  async generateLong(params) {
    // Claude can handle long content well
    // Opus model supports up to 200k context window
    return this.chat({
      ...params,
      options: {
        ...params.options,
        maxTokens: 8192 // Higher limit for specifications
      }
    });
  }

  // Estimate cost for a request
  estimateCost(model, inputTokens, outputTokens) {
    // Pricing as of 2024 (per million tokens)
    const pricing = {
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'claude-2.1': { input: 8, output: 24 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-sonnet-20240229'];
    const inputCost = (inputTokens / 1000000) * modelPricing.input;
    const outputCost = (outputTokens / 1000000) * modelPricing.output;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      formattedCost: `$${(inputCost + outputCost).toFixed(4)}`
    };
  }

  // Claude-specific system prompt formatting
  formatSystemPrompt(systemPrompt) {
    // Claude doesn't have a separate system role, but we can format it clearly
    return `System Instructions: ${systemPrompt}\n\n`;
  }
}

module.exports = new AnthropicProvider();
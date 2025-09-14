import axios from 'axios';

class AIProviderService {
  constructor() {
    this.providers = {
      ollama: {
        name: 'Ollama (Local)',
        requiresApiKey: false,
        models: [],
        defaultModel: 'mistral:7b-instruct'
      },
      openai: {
        name: 'OpenAI',
        requiresApiKey: true,
        models: [
          { id: 'gpt-4o-mini', name: 'GPT-4o mini', description: 'Cheapest & fastest, good quality' },
          { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest model, best balance' },
          { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Most capable, best for complex tasks' },
          { id: 'gpt-4', name: 'GPT-4', description: 'High quality, slower' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Legacy, cost-effective' }
        ],
        defaultModel: 'gpt-4o-mini'
      },
      anthropic: {
        name: 'Claude (Anthropic)',
        requiresApiKey: true,
        models: [
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable Claude model' },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and efficient' },
          { id: 'claude-2.1', name: 'Claude 2.1', description: 'Previous generation' }
        ],
        defaultModel: 'claude-3-sonnet-20240229'
      }
    };

    // Load saved configuration
    this.loadConfig();
  }

  loadConfig() {
    const savedProvider = localStorage.getItem('aiProvider') || 'ollama';
    const savedModel = localStorage.getItem('aiModel') || this.providers[savedProvider].defaultModel;
    const savedApiKeys = JSON.parse(localStorage.getItem('aiApiKeys') || '{}');

    this.currentProvider = savedProvider;
    this.currentModel = savedModel;
    this.apiKeys = savedApiKeys;
  }

  saveConfig() {
    localStorage.setItem('aiProvider', this.currentProvider);
    localStorage.setItem('aiModel', this.currentModel);
    // Store API keys encrypted in production - for demo we'll use simple storage
    localStorage.setItem('aiApiKeys', JSON.stringify(this.apiKeys));
  }

  setProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    this.currentProvider = provider;
    this.currentModel = this.providers[provider].defaultModel;
    this.saveConfig();
  }

  setModel(model) {
    this.currentModel = model;
    this.saveConfig();
  }

  setApiKey(provider, apiKey) {
    this.apiKeys[provider] = apiKey;
    this.saveConfig();
  }

  getApiKey(provider) {
    return this.apiKeys[provider] || '';
  }

  getCurrentProvider() {
    return this.currentProvider;
  }

  getCurrentModel() {
    return this.currentModel;
  }

  getProviderInfo() {
    return this.providers[this.currentProvider];
  }

  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  async checkConnection() {
    switch (this.currentProvider) {
      case 'ollama':
        return this.checkOllamaConnection();
      case 'openai':
        return this.checkOpenAIConnection();
      case 'anthropic':
        return this.checkClaudeConnection();
      default:
        return { connected: false, error: 'Unknown provider' };
    }
  }

  async checkOllamaConnection() {
    try {
      const response = await axios.get('http://localhost:3001/api/ollama/tags');
      const models = response.data.models || [];
      this.providers.ollama.models = models.map(m => ({
        id: m.name,
        name: m.name,
        description: `Size: ${(m.size / 1e9).toFixed(1)}GB`
      }));
      return { connected: true, models };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkOpenAIConnection() {
    const apiKey = this.getApiKey('openai');
    if (!apiKey) {
      return { connected: false, error: 'API key not set' };
    }

    try {
      const response = await axios.post('http://localhost:3001/api/providers/openai/check', {
        apiKey
      });
      return { connected: response.data.connected, models: this.providers.openai.models };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkClaudeConnection() {
    const apiKey = this.getApiKey('anthropic');
    if (!apiKey) {
      return { connected: false, error: 'API key not set' };
    }

    try {
      const response = await axios.post('http://localhost:3001/api/providers/anthropic/check', {
        apiKey
      });
      return { connected: response.data.connected, models: this.providers.anthropic.models };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async chat(prompt, context = '', options = {}) {
    const provider = this.currentProvider;
    const model = this.currentModel;
    const apiKey = this.getApiKey(provider);

    // Route to appropriate backend endpoint based on provider
    const endpoint = `http://localhost:3001/api/providers/${provider}/chat`;

    try {
      const response = await axios.post(endpoint, {
        model,
        prompt,
        context,
        apiKey,
        options: {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 4096,
          ...options
        }
      }, {
        timeout: 300000 // 5 minute timeout
      });

      return response.data.response || response.data.content;
    } catch (error) {
      console.error(`${provider} chat error:`, error);
      throw error;
    }
  }

  async generatePRD(message, context) {
    // Use higher temperature for creative PRD generation
    return this.chat(message, context, {
      temperature: 0.7,
      maxTokens: 4096
    });
  }

  async assessRequest(message) {
    // Use lower temperature for consistent assessment
    return this.chat(message, '', {
      temperature: 0.3,
      maxTokens: 50
    });
  }

  async generateSpecification(prompt, context) {
    // Use background job for long specification generation
    const provider = this.currentProvider;
    const model = this.currentModel;
    const apiKey = this.getApiKey(provider);

    const response = await axios.post('http://localhost:3001/api/jobs/generate-specification', {
      provider,
      model,
      prompt,
      context,
      apiKey
    });

    return response.data;
  }

  // Migration helper - convert existing Ollama calls
  async migrateFromOllama(ollamaService) {
    // This helps migrate existing code to use the new service
    this.setProvider('ollama');
    this.setModel(ollamaService.getCurrentModel());
    return this;
  }
}

// Singleton instance
const aiProviderService = new AIProviderService();

export { aiProviderService };
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { X, Check, AlertCircle, Loader, Eye, EyeOff, DollarSign } from 'lucide-react';
import { aiProviderService } from '../services/aiProviderService';
import toast from 'react-hot-toast';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ProviderCard = styled.div`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#f8f9ff' : 'white'};

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`;

const ProviderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProviderName = styled.div`
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.status === 'connected') return '#d4f4dd';
    if (props.status === 'error') return '#ffe0e0';
    return '#f0f0f0';
  }};
  color: ${props => {
    if (props.status === 'connected') return '#1e7e34';
    if (props.status === 'error') return '#dc3545';
    return '#666';
  }};
`;

const ProviderDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
`;

const ApiKeySection = styled.div`
  margin-top: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: ${props => props.type === 'password' ? 'monospace' : 'inherit'};

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.variant === 'primary' ? '#667eea' : '#f0f0f0'};
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#5a67d8' : '#e0e0e0'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModelSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const InfoBox = styled.div`
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #0066cc;

  a {
    color: #0052cc;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CostEstimate = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fffef0;
  border: 1px solid #ffd700;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

function AIProviderSettings({ isOpen, onClose }) {
  const [selectedProvider, setSelectedProvider] = useState(aiProviderService.getCurrentProvider());
  const [selectedModel, setSelectedModel] = useState(aiProviderService.getCurrentModel());
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [testing, setTesting] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      setSelectedProvider(aiProviderService.getCurrentProvider());
      setSelectedModel(aiProviderService.getCurrentModel());

      // Load API keys (masked)
      const keys = {};
      ['openai', 'anthropic'].forEach(provider => {
        const key = aiProviderService.getApiKey(provider);
        if (key) {
          keys[provider] = key;
        }
      });
      setApiKeys(keys);

      // Check connections
      checkAllConnections();
    }
  }, [isOpen]);

  const checkAllConnections = async () => {
    for (const provider of ['ollama', 'openai', 'anthropic']) {
      if (provider === 'ollama' || apiKeys[provider]) {
        setTesting(prev => ({ ...prev, [provider]: true }));
        const result = await aiProviderService.checkConnection();
        setConnectionStatus(prev => ({
          ...prev,
          [provider]: result.connected ? 'connected' : 'error'
        }));
        setTesting(prev => ({ ...prev, [provider]: false }));
      }
    }
  };

  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId);
    aiProviderService.setProvider(providerId);

    // Update model to default for this provider
    const providerInfo = aiProviderService.providers[providerId];
    const defaultModel = providerInfo.defaultModel;
    setSelectedModel(defaultModel);
    aiProviderService.setModel(defaultModel);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    aiProviderService.setModel(model);
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleSaveApiKey = async (provider) => {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    aiProviderService.setApiKey(provider, apiKey);

    // Test connection
    setTesting(prev => ({ ...prev, [provider]: true }));

    // Temporarily set this provider to test it
    const currentProvider = aiProviderService.getCurrentProvider();
    aiProviderService.setProvider(provider);

    const result = await aiProviderService.checkConnection();

    // Restore previous provider
    aiProviderService.setProvider(currentProvider);

    setTesting(prev => ({ ...prev, [provider]: false }));

    if (result.connected) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'connected' }));
      toast.success(`${provider} API key saved and verified!`);
    } else {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
      toast.error(`Failed to connect: ${result.error}`);
    }
  };

  const toggleShowApiKey = (provider) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getProviderInfo = (providerId) => {
    const info = {
      ollama: {
        name: 'Ollama (Local)',
        description: 'Free, runs locally on your machine. Requires Ollama to be installed and running.',
        requiresKey: false,
        setupUrl: 'https://ollama.ai'
      },
      openai: {
        name: 'OpenAI',
        description: 'Access to GPT-4, GPT-3.5 and other OpenAI models. Requires API key.',
        requiresKey: true,
        setupUrl: 'https://platform.openai.com/api-keys',
        pricing: '~$0.01 per 1K tokens (GPT-4)'
      },
      anthropic: {
        name: 'Claude (Anthropic)',
        description: 'Access to Claude 3 models including Opus, Sonnet, and Haiku. Requires API key.',
        requiresKey: true,
        setupUrl: 'https://console.anthropic.com/account/keys',
        pricing: '~$0.015 per 1K tokens (Claude 3 Opus)'
      }
    };
    return info[providerId];
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>AI Provider Settings</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionTitle>Select AI Provider</SectionTitle>

            {['ollama', 'openai', 'anthropic'].map(providerId => {
              const info = getProviderInfo(providerId);
              const status = connectionStatus[providerId];
              const isSelected = selectedProvider === providerId;

              return (
                <ProviderCard
                  key={providerId}
                  selected={isSelected}
                  onClick={() => handleProviderSelect(providerId)}
                >
                  <ProviderHeader>
                    <ProviderName>
                      {info.name}
                      {isSelected && <Check size={16} color="#667eea" />}
                    </ProviderName>
                    {testing[providerId] ? (
                      <Loader size={14} className="spin" />
                    ) : status ? (
                      <StatusBadge status={status}>
                        {status === 'connected' ? 'Connected' : 'Not Connected'}
                      </StatusBadge>
                    ) : null}
                  </ProviderHeader>

                  <ProviderDescription>{info.description}</ProviderDescription>

                  {info.requiresKey && (
                    <ApiKeySection>
                      <Label>API Key</Label>
                      <InputGroup>
                        <Input
                          type={showApiKeys[providerId] ? 'text' : 'password'}
                          placeholder="Enter your API key"
                          value={apiKeys[providerId] || ''}
                          onChange={(e) => handleApiKeyChange(providerId, e.target.value)}
                        />
                        <Button
                          variant="secondary"
                          onClick={() => toggleShowApiKey(providerId)}
                        >
                          {showApiKeys[providerId] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleSaveApiKey(providerId)}
                          disabled={testing[providerId]}
                        >
                          {testing[providerId] ? <Loader size={14} className="spin" /> : 'Save & Test'}
                        </Button>
                      </InputGroup>

                      <InfoBox>
                        <AlertCircle size={14} />
                        Get your API key from{' '}
                        <a href={info.setupUrl} target="_blank" rel="noopener noreferrer">
                          {info.setupUrl}
                        </a>
                      </InfoBox>

                      {info.pricing && (
                        <CostEstimate>
                          <DollarSign size={14} />
                          Estimated cost: {info.pricing}
                        </CostEstimate>
                      )}
                    </ApiKeySection>
                  )}

                  {!info.requiresKey && providerId === 'ollama' && (
                    <InfoBox>
                      <AlertCircle size={14} />
                      Make sure Ollama is running: <code>ollama serve</code>
                    </InfoBox>
                  )}
                </ProviderCard>
              );
            })}
          </Section>

          {selectedProvider && (
            <Section>
              <SectionTitle>
                Model Selection
                {selectedModel && (
                  <span style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'normal'
                  }}>
                    Current: {selectedModel.split('-')[0].replace('gpt', 'GPT-').replace('claude', 'Claude ')}
                  </span>
                )}
              </SectionTitle>
              <Label>Choose a model for {getProviderInfo(selectedProvider).name}:</Label>
              <ModelSelect
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                style={{
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: selectedModel ? '500' : 'normal'
                }}
              >
                {aiProviderService.providers[selectedProvider].models.length > 0 ? (
                  aiProviderService.providers[selectedProvider].models.map(model => (
                    <option key={model.id || model} value={model.id || model}>
                      {typeof model === 'string' ? model : `${model.name} - ${model.description}`}
                    </option>
                  ))
                ) : (
                  <option value="">No models available</option>
                )}
              </ModelSelect>
              {selectedProvider !== 'ollama' && (
                <InfoBox style={{ marginTop: '0.5rem' }}>
                  <AlertCircle size={14} />
                  {selectedProvider === 'openai' && (
                    <span>
                      <strong>Default: GPT-4o mini</strong> - Cheapest & fastest!<br/>
                      <small>• GPT-4o mini: $0.15/1M input tokens (3x cheaper than 3.5!)<br/>
                      • GPT-4o: Latest, best balance of quality & speed<br/>
                      • GPT-4 Turbo: Best for complex PRDs & specifications</small>
                    </span>
                  )}
                  {selectedProvider === 'anthropic' && (
                    <span>
                      <strong>Default: Claude 3 Sonnet</strong> - Balanced performance<br/>
                      <small>• Claude 3 Opus: Best quality, detailed analysis<br/>
                      • Claude 3 Haiku: Fastest responses, lower cost</small>
                    </span>
                  )}
                </InfoBox>
              )}
            </Section>
          )}
        </Content>
      </ModalContent>
    </Modal>
  );
}

export default AIProviderSettings;
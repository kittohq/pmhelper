import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { useStore } from './store/appStore';
import * as ollamaService from './services/ollamaService';
import * as apiService from './services/apiService';

// Mock the store
jest.mock('./store/appStore');

// Mock services
jest.mock('./services/ollamaService');
jest.mock('./services/apiService');

// Mock components to simplify testing
jest.mock('./components/ChatPane', () => {
  return function ChatPane({ onSendMessage }) {
    return (
      <div data-testid="chat-pane">
        <button onClick={() => onSendMessage('test message')}>Send Message</button>
      </div>
    );
  };
});

jest.mock('./components/PRDEditor', () => {
  return function PRDEditor() {
    return <div data-testid="prd-editor">PRD Editor</div>;
  };
});

jest.mock('./components/LeftPanel', () => {
  return function LeftPanel() {
    return <div data-testid="left-panel">Left Panel</div>;
  };
});

describe('App Component', () => {
  let mockStore;

  beforeEach(() => {
    // Setup mock store
    mockStore = {
      currentPRD: {
        title: 'Test PRD',
        templateType: 'lean',
        templateName: 'Lean PRD',
        sections: {
          problem: {
            title: 'Problem Statement',
            content: 'Test problem',
            required: true,
            prompts: []
          },
          solution: {
            title: 'Solution',
            content: '',
            required: true,
            prompts: []
          }
        }
      },
      setCurrentPRD: jest.fn(),
      updatePRDSection: jest.fn(),
      documents: [],
      addDocument: jest.fn(),
      messages: [],
      addMessage: jest.fn(),
      currentProject: {
        id: '1',
        name: 'Test Project',
        prd: null
      },
      activeView: 'chat'
    };

    useStore.mockReturnValue(mockStore);

    // Mock service methods
    ollamaService.checkConnection = jest.fn().mockResolvedValue(true);
    ollamaService.getAvailableModels = jest.fn().mockReturnValue([
      { name: 'mistral:7b-instruct', size: 4109865159 }
    ]);
    ollamaService.getCurrentModel = jest.fn().mockReturnValue('mistral:7b-instruct');
    ollamaService.generateContent = jest.fn().mockResolvedValue('AI generated response');

    apiService.getPRDTemplate = jest.fn().mockResolvedValue({
      name: 'Lean PRD',
      description: 'Minimal viable documentation',
      sections: {
        problem: {
          title: 'Problem Statement',
          description: 'What problem are we solving?',
          content: '',
          required: true,
          prompts: []
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders main application layout', () => {
    render(<App />);
    
    expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-pane')).toBeInTheDocument();
    expect(screen.getByTestId('prd-editor')).toBeInTheDocument();
  });

  test('displays project name in header', () => {
    render(<App />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  test('initializes PRD when no current PRD exists', async () => {
    mockStore.currentPRD = null;
    
    render(<App />);
    
    await waitFor(() => {
      expect(apiService.getPRDTemplate).toHaveBeenCalledWith('lean');
    });
  });

  test('checks Ollama connection on mount', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(ollamaService.checkConnection).toHaveBeenCalled();
    });
  });

  test('handles message sending', async () => {
    render(<App />);
    
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockStore.addMessage).toHaveBeenCalledWith({
        role: 'user',
        content: 'test message',
        timestamp: expect.any(Date)
      });
    });
  });

  test('displays loading state when PRD is initializing', () => {
    mockStore.currentProject = { id: '1', name: 'Test Project' };
    mockStore.currentPRD = null;
    
    render(<App />);
    
    expect(screen.getByText(/Loading PRD/)).toBeInTheDocument();
  });

  test('displays no project message when no project selected', () => {
    mockStore.currentProject = null;
    mockStore.currentPRD = null;
    
    render(<App />);
    
    expect(screen.getByText(/No Project Selected/)).toBeInTheDocument();
  });

  test('handles underspecified requests', async () => {
    render(<App />);
    
    // Send a short message that should trigger underspecified handling
    const sendButton = screen.getByText('Send Message');
    
    // Mock the message to be short
    jest.spyOn(React, 'useState').mockImplementationOnce(() => ['build app', jest.fn()]);
    
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(ollamaService.generateContent).toHaveBeenCalled();
      const call = ollamaService.generateContent.mock.calls[0];
      expect(call[0]).toContain('provide the following information');
    });
  });
});

describe('App PRD Generation', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      currentPRD: {
        title: 'Test PRD',
        sections: {
          problem: { title: 'Problem', content: 'Existing problem', required: true },
          solution: { title: 'Solution', content: '', required: true }
        }
      },
      setCurrentPRD: jest.fn(),
      updatePRDSection: jest.fn(),
      documents: [],
      messages: [],
      addMessage: jest.fn(),
      currentProject: { id: '1', name: 'Test' },
      activeView: 'chat'
    };

    useStore.mockReturnValue(mockStore);
    
    ollamaService.generateContent = jest.fn().mockImplementation((prompt) => {
      if (prompt.includes('**Problem Statement:**')) {
        return Promise.resolve('## Problem Statement\nThe generated problem content');
      }
      return Promise.resolve('Generic AI response');
    });
  });

  test('includes existing PRD content in prompts', async () => {
    render(<App />);
    
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(ollamaService.generateContent).toHaveBeenCalled();
      const prompt = ollamaService.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Existing problem');
    });
  });

  test('identifies missing required sections', async () => {
    render(<App />);
    
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      const prompt = ollamaService.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Solution');
    });
  });

  test('updates PRD section with generated content', async () => {
    ollamaService.generateContent.mockResolvedValue('## Solution\nThe generated solution');
    
    render(<App />);
    
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockStore.updatePRDSection).toHaveBeenCalledWith(
        'solution',
        'The generated solution'
      );
    });
  });
});
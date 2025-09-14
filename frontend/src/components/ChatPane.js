import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Send, Bot, User, Loader } from 'lucide-react';
import { useStore } from '../store/appStore';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #fafafa;
`;

const MessageBubble = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 1rem;
  align-items: flex-start;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#667eea' : '#764ba2'};
  color: white;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  p {
    margin: 0 0 0.5rem 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  min-height: 50px;
  max-height: 150px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #5a67d8;
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const SuggestedPrompts = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PromptChip = styled.button`
  padding: 6px 12px;
  background: #f0f4ff;
  border: 1px solid #667eea;
  border-radius: 20px;
  color: #667eea;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f4ff;
  border-radius: 8px;
  color: #667eea;
  animation: pulse 1.5s ease infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

function ChatPane({ onSendMessage }) {
  const { messages, currentPRD, currentProject } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    setIsLoading(true);
    console.log('Starting request, spinner ON');

    // Set a timeout to stop "AI is thinking" after 5 minutes (Ollama can be slow)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast.error('Request timed out. Please try again or use a smaller model.');
    }, 300000); // 5 minutes

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled in onSendMessage, just log it here
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      console.log('Request complete, spinner OFF');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Help me define the product overview',
    'What user stories should I include?',
    'Suggest success metrics for this PRD',
    'Review my current PRD for completeness',
    'What technical requirements am I missing?'
  ];

  return (
    <Container>
      <MessagesContainer>
        {messages.length === 0 && (
          <EmptyState>
            <Bot size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            {!currentProject ? (
              <>
                <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ No Project Selected</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Please create or select a project with a PRD template first
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#666' }}>
                  Click "New Project" in the left panel to get started
                </p>
              </>
            ) : (
              <>
                <p>Ready to create your PRD!</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                  Template: <strong>{currentProject.templateType || 'lean'}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  To start, provide these 5 essential details:
                </p>
                <div style={{ textAlign: 'left', marginTop: '1rem', fontSize: '0.85rem', color: '#555' }}>
                  <div>☐ Product/Feature Name</div>
                  <div>☐ Problem Statement</div>
                  <div>☐ Target Users</div>
                  <div>☐ Core Functionality (2-3 features)</div>
                  <div>☐ Success Metric</div>
                </div>
              </>
            )}
          </EmptyState>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id}>
            <Avatar isUser={message.role === 'user'}>
              {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </Avatar>
            <MessageContent>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </MessageContent>
          </MessageBubble>
        ))}

        {isLoading && (
          <MessageBubble>
            <Avatar>
              <Bot size={18} />
            </Avatar>
            <LoadingIndicator>
              <Loader size={16} className="spin" />
              AI is thinking...
            </LoadingIndicator>
          </MessageBubble>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {messages.length === 0 && (
        <SuggestedPrompts>
          {suggestedPrompts.map((prompt, index) => (
            <PromptChip key={index} onClick={() => setInput(prompt)}>
              {prompt}
            </PromptChip>
          ))}
        </SuggestedPrompts>
      )}

      <InputContainer>
        <InputWrapper>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your PRD or request suggestions..."
            disabled={isLoading}
          />
          <SendButton onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send size={18} />
            Send
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </Container>
  );
}

export default ChatPane;
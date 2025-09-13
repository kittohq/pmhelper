import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Toaster } from 'react-hot-toast';
import LeftPanel from './components/LeftPanel';
import DocumentsPane from './components/DocumentsPane';
import ChatPane from './components/ChatPane';
import PRDEditor from './components/PRDEditor';
import { useStore } from './store/appStore';
import { ollamaService } from './services/ollamaService';
import { apiService } from './services/apiService';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const LeftPaneContainer = styled.div`
  width: 280px;
  background: #1a1d23;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MiddlePane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e0e0e0;
  min-width: 400px;
`;

const RightPane = styled.div`
  width: 45%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
`;

function App() {
  const { 
    currentPRD, 
    setCurrentPRD, 
    documents,
    addDocument,
    messages,
    addMessage,
    currentProject,
    activeView 
  } = useStore();

  const [isOllamaConnected, setIsOllamaConnected] = useState(false);

  useEffect(() => {
    // Initialize with a PRD template
    initializePRD();
    // Check Ollama connection
    checkOllamaConnection();
  }, []);

  const initializePRD = async () => {
    try {
      const template = await apiService.getPRDTemplate('basic');
      setCurrentPRD({
        ...template,
        title: 'New Product Requirements Document',
        sections: {
          ...template.sections,
          overview: {
            ...template.sections.overview,
            content: 'This PRD outlines the requirements for our new product feature...'
          }
        }
      });
    } catch (error) {
      // Use default template if API fails
      setCurrentPRD(getDefaultPRDTemplate());
    }
  };

  const checkOllamaConnection = async () => {
    const connected = await ollamaService.checkConnection();
    setIsOllamaConnected(connected);
  };

  const getDefaultPRDTemplate = () => ({
    title: 'Product Requirements Document',
    sections: {
      overview: {
        title: 'Product Overview',
        content: '',
        required: true,
        prompts: [
          'What problem does this product solve?',
          'Who is the target audience?',
          'What is the product vision?',
          'What is the value proposition?'
        ]
      },
      goals: {
        title: 'Goals & Success Metrics',
        content: '',
        required: true,
        prompts: [
          'What are the primary goals?',
          'How will we measure success?',
          'What are the KPIs?',
          'What is the target adoption rate?'
        ]
      },
      businessObjectives: {
        title: 'Business Objectives',
        content: '',
        required: true,
        prompts: [
          'How does this align with business goals?',
          'What is the expected ROI?',
          'What is the revenue impact?',
          'What are the cost implications?'
        ]
      },
      strategicFit: {
        title: 'Strategic Fit',
        content: '',
        required: true,
        prompts: [
          'How does this fit into our product strategy?',
          'What are the competitive advantages?',
          'How does this differentiate us?',
          'What market opportunity does this address?'
        ]
      },
      userStories: {
        title: 'User Stories',
        content: '',
        required: true,
        template: 'As a [user type], I want to [action] so that [benefit]',
        prompts: [
          'List key user personas',
          'Define user journey maps',
          'What are the main user scenarios?',
          'What are the edge cases?'
        ]
      },
      userDesign: {
        title: 'User Design & Interactions',
        content: '',
        required: true,
        prompts: [
          'What are the key user flows?',
          'What are the UI/UX requirements?',
          'What are the accessibility requirements?',
          'What are the mobile/responsive requirements?'
        ]
      },
      scope: {
        title: 'Scope & Boundaries',
        content: '',
        required: true,
        prompts: [
          'What is in scope for MVP?',
          'What is out of scope?',
          'What are the dependencies?',
          'What are the constraints?'
        ]
      },
      questionsAndClarifications: {
        title: 'Open Questions & Clarifications',
        content: '',
        required: false,
        prompts: [
          'What needs stakeholder input?',
          'What technical questions remain?',
          'What assumptions are we making?',
          'What risks need mitigation?'
        ]
      },
      requirements: {
        title: 'Functional Requirements',
        content: '',
        required: true,
        prompts: [
          'List must-have features',
          'List nice-to-have features',
          'Define acceptance criteria',
          'What are the performance requirements?'
        ]
      },
      technicalSpecs: {
        title: 'Technical Specifications',
        content: '',
        required: false,
        prompts: [
          'What are the API requirements?',
          'What are the data model requirements?',
          'What are the integration points?',
          'What are the security requirements?'
        ]
      },
      timeline: {
        title: 'Timeline & Milestones',
        content: '',
        required: true,
        prompts: [
          'What is the target launch date?',
          'What are the key milestones?',
          'What are the sprint goals?',
          'What are the dependencies on timeline?'
        ]
      }
    },
    missingRequired: []  // Track missing required sections
  });

  const handleSendMessage = async (message) => {
    // Add user message
    addMessage({ role: 'user', content: message });

    // Get AI response with enhanced context
    const contextDocs = documents.map(d => d.content).join('\n\n');
    const prdSections = currentPRD?.sections || {};
    
    // Determine if user is asking for help with specific content
    const isAskingForContent = message.toLowerCase().includes('help me') || 
                               message.toLowerCase().includes('create') ||
                               message.toLowerCase().includes('write') ||
                               message.toLowerCase().includes('define') ||
                               message.toLowerCase().includes('my project') ||
                               message.toLowerCase().includes('my product');
    
    // Build comprehensive prompt
    let prompt = '';
    
    if (isAskingForContent) {
      // User wants help creating actual PRD content
      prompt = `You are an expert Product Manager helping to create a comprehensive Product Requirements Document (PRD).

IMPORTANT: The user is asking for help with THEIR specific project. They will provide a description of their product/project.
Your job is to:
1. Understand their project description
2. Ask clarifying questions if the description is vague
3. Help them create actual PRD content based on their project
4. Fill in specific sections of the PRD template with relevant content

Current PRD Template Structure:
${JSON.stringify(prdSections, null, 2)}

Project/Product Context from User:
${contextDocs || 'No additional context provided yet'}

User's Request: ${message}

Instructions:
- If the user provides a project description, help them create specific PRD content for that project
- If the description is vague, ask specific questions to gather more details
- Don't just explain what a PRD is - actually help create one
- Provide concrete, actionable content that can be directly used in their PRD
- Focus on the specific section they're asking about, but ensure it aligns with the overall product vision
- Format your response as actual PRD content, not as advice about PRD content
- Write in a professional, clear manner suitable for a PRD document`;
    } else {
      // General question or guidance
      prompt = `You are a Product Manager assistant helping with PRD creation.

Current PRD Template:
${JSON.stringify(Object.keys(prdSections), null, 2)}

User Question: ${message}

Provide helpful guidance about PRD best practices and answer their question.`;
    }

    try {
      const response = await ollamaService.chat(prompt, JSON.stringify(currentPRD));
      addMessage({ role: 'assistant', content: response });
      
      // Auto-update PRD if AI generated content for specific sections
      if (isAskingForContent && response) {
        updatePRDFromAIResponse(response, message);
      }
    } catch (error) {
      console.error('Ollama error:', error);
      
      // Provide helpful fallback response
      const fallbackResponse = getFallbackResponse(message);
      addMessage({ 
        role: 'assistant', 
        content: fallbackResponse 
      });
    }
  };

  const getFallbackResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('user stor')) {
      return `Here's how to write effective user stories:

**Format:** As a [user type], I want to [action] so that [benefit]

**Example:** As a product manager, I want to export PRDs as PDF so that I can share them with stakeholders offline.

**Best Practices:**
- Keep them focused on one capability
- Write from the user's perspective
- Include acceptance criteria
- Make them testable`;
    }
    
    if (lowerMsg.includes('metric') || lowerMsg.includes('kpi')) {
      return `Key metrics to include in your PRD:

**User Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- User retention rate
- User satisfaction (NPS)

**Business Metrics:**
- Revenue impact
- Cost reduction
- Time to market

**Technical Metrics:**
- Performance (load time, response time)
- Reliability (uptime, error rate)
- Scalability metrics`;
    }

    if (lowerMsg.includes('template')) {
      return `We have 6 PRD templates available:

1. **Lean PRD** - Quick, minimalist approach
2. **Agile/Scrum** - User story focused
3. **Startup** - Hypothesis-driven MVP
4. **Amazon** - Working backwards from press release
5. **Technical** - Engineering specifications
6. **Enterprise** - Comprehensive documentation

Click "Templates" in the left panel to use them.`;
    }
    
    return `I can help you improve your PRD. While Ollama is not currently connected, here are some suggestions:

1. **Structure your PRD** with clear sections
2. **Define the problem** you're solving
3. **Identify target users** and their needs
4. **Set measurable goals** and success metrics
5. **Define scope** (what's in vs out)
6. **Create user stories** with acceptance criteria
7. **Include technical requirements** if needed
8. **Add timeline** and milestones

Try asking about specific sections like "How do I write user stories?" or "What metrics should I include?"`;
  };

  const updatePRDFromAIResponse = (response, userMessage) => {
    // Try to detect which section the user is asking about
    const message = userMessage.toLowerCase();
    let targetSection = null;
    
    // Map keywords to PRD sections
    const sectionKeywords = {
      overview: ['overview', 'product overview', 'define the product', 'product description'],
      goals: ['goals', 'metrics', 'success', 'kpi', 'objectives'],
      businessObjectives: ['business', 'roi', 'revenue', 'cost'],
      strategicFit: ['strategy', 'strategic', 'competitive', 'market'],
      userStories: ['user stories', 'user story', 'stories', 'scenarios'],
      userDesign: ['design', 'ui', 'ux', 'interaction', 'user experience'],
      scope: ['scope', 'boundaries', 'mvp', 'out of scope'],
      requirements: ['requirements', 'functional', 'features'],
      technicalSpecs: ['technical', 'api', 'data', 'integration'],
      timeline: ['timeline', 'milestones', 'schedule', 'deadline']
    };
    
    // Find which section to update
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        targetSection = section;
        break;
      }
    }
    
    // If we identified a section, update it
    if (targetSection && currentPRD?.sections?.[targetSection]) {
      const updatedPRD = {
        ...currentPRD,
        sections: {
          ...currentPRD.sections,
          [targetSection]: {
            ...currentPRD.sections[targetSection],
            content: response,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'AI Assistant'
          }
        }
      };
      
      setCurrentPRD(updatedPRD);
      
      // Save to project if there's an active project
      if (currentProject) {
        useStore.getState().savePRDToProject();
      }
      
      console.log(`PRD section '${targetSection}' updated with AI-generated content`);
    } else if (message.includes('help me') && (message.includes('my project') || message.includes('my product'))) {
      // User is describing their project - update overview
      const updatedPRD = {
        ...currentPRD,
        sections: {
          ...currentPRD.sections,
          overview: {
            ...currentPRD.sections.overview,
            content: response,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'AI Assistant'
          }
        }
      };
      
      setCurrentPRD(updatedPRD);
      
      if (currentProject) {
        useStore.getState().savePRDToProject();
      }
      
      console.log('PRD overview updated with AI-generated content');
    }
  };

  return (
    <AppContainer>
      <Toaster position="top-right" />
      
      <LeftPaneContainer>
        <LeftPanel />
      </LeftPaneContainer>

      <MiddlePane>
        <Header>
          <Title>💬 AI Assistant</Title>
          <Subtitle>
            {isOllamaConnected ? 'Connected to Ollama' : 'Ollama not connected'}
          </Subtitle>
        </Header>
        <ChatPane onSendMessage={handleSendMessage} />
      </MiddlePane>

      <RightPane>
        <Header>
          <Title>📝 PRD Editor</Title>
          <Subtitle>
            {currentProject ? currentProject.title : 'Select a project to begin'}
          </Subtitle>
        </Header>
        {currentProject ? (
          <PRDEditor />
        ) : (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            color: '#999' 
          }}>
            <h3>No Project Selected</h3>
            <p>Select or create a project from the left panel to start working on a PRD</p>
          </div>
        )}
      </RightPane>
    </AppContainer>
  );
}

export default App;
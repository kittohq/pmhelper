import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Toaster } from 'react-hot-toast';
import LeftPanel from './components/LeftPanel';
import DocumentsPane from './components/DocumentsPane';
import ChatPane from './components/ChatPane';
import PRDEditor from './components/PRDEditor';
import SpecificationView from './components/SpecificationView';
import SystemPromptModal from './components/SystemPromptModal';
import { useStore } from './store/appStore';
import { ollamaService } from './services/ollamaService';
import { apiService } from './services/apiService';
import { buildSystemPrompt, getSystemPromptSections } from './config/systemPrompts';

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

const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid #667eea' : '2px solid transparent'};
  margin-bottom: -2px;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#667eea' : '#666'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : '#f0f0f0'};
  }
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
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(ollamaService.getCurrentModel());
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [rightPaneTab, setRightPaneTab] = useState('prd'); // 'prd' or 'specification'

  useEffect(() => {
    // Initialize with a PRD template if one doesn't exist
    if (!currentPRD) {
      initializePRD();
    }
    // Check Ollama connection
    checkOllamaConnection();
  }, []);

  const initializePRD = async () => {
    const defaultTemplate = 'lean'; // Default template type
    try {
      const template = await apiService.getPRDTemplate(defaultTemplate);
      setCurrentPRD({
        ...template,
        templateType: defaultTemplate,
        templateName: 'Lean PRD',
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
      setCurrentPRD({
        ...getDefaultPRDTemplate(),
        templateType: 'basic',
        templateName: 'Basic PRD'
      });
    }
  };

  const checkOllamaConnection = async () => {
    const connected = await ollamaService.checkConnection();
    setIsOllamaConnected(connected);
    if (connected) {
      const models = ollamaService.getAvailableModels();
      setAvailableModels(models);
      console.log('Ollama is connected with models:', models.map(m => m.name));
    }
  };

  const handleModelChange = (modelName) => {
    ollamaService.setModel(modelName);
    setSelectedModel(modelName);
    console.log('Changed Ollama model to:', modelName);
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
                               message.toLowerCase().includes('my product') ||
                               message.toLowerCase().includes('prd for me');
    
    // Check for missing required sections in current PRD
    const missingSections = currentPRD?.sections ? 
      Object.entries(currentPRD.sections)
        .filter(([key, section]) => section.required && (!section.content || section.content.length < 20))
        .map(([key, section]) => section.title) : [];
    
    // Build comprehensive prompt
    let prompt = '';
    
    if (isAskingForContent) {
      // User wants help creating actual PRD content
      const templateType = currentPRD?.templateType || 'lean';
      const templateName = currentPRD?.templateName || 'Lean PRD';
      
      // Let the LLM assess if the request is underspecified
      // Include conversation history for better context
      const conversationContext = messages.slice(-5).map(m => 
        `${m.role}: ${m.content.substring(0, 200)}`
      ).join('\n');
      
      const assessmentPrompt = `${buildSystemPrompt(templateType)}

Current PRD Template: ${templateName}
Required sections that need content:
${Object.entries(currentPRD?.sections || {})
        .filter(([_, section]) => section.required)
        .map(([key, section]) => `- ${section.title}: ${section.content ? 'Has content' : 'Empty'}`)
        .join('\n')}

Previous conversation:
${conversationContext}

User's current request: "${message}"

Based on the template requirements, existing PRD content, and conversation history, determine if you have enough information to generate meaningful PRD content.

Consider:
1. Can you create or enhance a problem statement from the provided context?
2. Are target users specified or reasonably inferable?
3. Is there enough detail to define concrete solution features?
4. Can success metrics be derived or suggested based on the context?

Respond with ONLY one word: "SUFFICIENT" if you can generate meaningful content, or "NEEDS_INFO" if critical details are missing.`;

      // Make assessment call
      let isUnderspecified = false;
      try {
        const assessmentResponse = await ollamaService.chat(assessmentPrompt, '');
        console.log('Assessment response:', assessmentResponse);
        
        isUnderspecified = assessmentResponse.trim().toUpperCase().includes('NEEDS_INFO');
      } catch (error) {
        console.error('Assessment failed, using fallback logic:', error);
        // Fallback to simple check if assessment fails
        isUnderspecified = message.length < 100 && 
                          !message.toLowerCase().includes('problem') &&
                          !message.toLowerCase().includes('users');
      }
      
      if (isUnderspecified) {
        // Include missing sections information
        const missingSectionsText = missingSections.length > 0 ? 
          `

⚠️ **Missing Required Sections in Your Current PRD:**
${missingSections.map(s => `• ${s}`).join('\n')}

These sections need to be completed for a comprehensive PRD.` : '';
        
        // Force the response to ask for more information
        prompt = `The user said: "${message}"

This is an underspecified request. You MUST respond EXACTLY with this message:

I'd be happy to help create your PRD! To get started, I need some essential information:

☐ **Product/Feature Name**: What should we call this product or feature?
   *Example: "Customer Analytics Dashboard" or "One-Click Checkout"*

☐ **Problem Statement**: What specific problem are you solving?
   *Example: "Sales teams spend 2+ hours daily manually compiling customer data from multiple sources"*

☐ **Target Users**: Who will use this? Be specific.
   *Example: "B2B sales managers at mid-market SaaS companies (50-500 employees)"*

☐ **Core Functionality**: What are the 2-3 main things this must do?
   *Example: "1) Aggregate data from CRM and email, 2) Generate weekly reports, 3) Alert on at-risk accounts"*

☐ **Success Metric**: How will you measure success?
   *Example: "Reduce time spent on reporting by 75% within 3 months"*

Please provide these details, and I'll create a comprehensive PRD using the ${templateType} template.${missingSectionsText}`;
      } else {
        // User provided some details, use normal prompt
        const systemPrompt = buildSystemPrompt(templateType);
        
        // Include validation feedback in the prompt
        const validationFeedback = missingSections.length > 0 ? 
          `

IMPORTANT: The current PRD has these missing required sections that need to be filled:
${missingSections.map(s => `- ${s}`).join('\n')}

Include a note about these missing sections in your response and offer to help complete them.` : '';
        
        // Include current PRD content to give AI context
        const currentPRDContent = currentPRD?.sections ? 
          Object.entries(currentPRD.sections)
            .filter(([key, section]) => section.content && section.content.length > 0)
            .map(([key, section]) => `### ${section.title}\n${section.content}`)
            .join('\n\n') : '';
        
        prompt = `${systemPrompt}

User's Request: ${message}

Current PRD Content (what has been written so far):
${currentPRDContent || 'No content written yet'}

Current PRD Template Structure:
${JSON.stringify(prdSections, null, 2)}

Context: ${contextDocs || 'No additional context'}${validationFeedback}

Based on the existing PRD content above and the user's request, continue building the PRD.
If the user has provided sufficient information (product name, problem, users, core functionality, and success metric), generate PRD content for the missing sections.
If information is missing, ask for the specific missing pieces.
Always mention any missing required sections that need to be completed.`;
      }
    } else {
      // General question or guidance - still include missing sections if relevant
      const validationNote = missingSections.length > 0 ? 
        `

Note: Your current PRD has missing required sections: ${missingSections.join(', ')}. Would you like help completing these?` : '';
      
      prompt = `You are a Product Manager assistant helping with PRD creation.

Current PRD Template:
${JSON.stringify(Object.keys(prdSections), null, 2)}

User Question: ${message}

Provide helpful guidance about PRD best practices and answer their question.${validationNote}`;
    }

    try {
      console.log('Attempting to send to Ollama...');
      console.log('Ollama connected status:', isOllamaConnected);
      console.log('Prompt length:', prompt.length);
      console.log('First 500 chars of prompt:', prompt.substring(0, 500));
      
      // Don't send the entire PRD as context, it might be too large or malformed
      const response = await ollamaService.chat(prompt);
      
      // Check if we got a valid response
      if (response && response !== '') {
        console.log('Got valid response from Ollama, length:', response.length);
        console.log('First 300 chars of response:', response.substring(0, 300));
        addMessage({ role: 'assistant', content: response });
        
        // Auto-update PRD if AI generated content for specific sections
        // But skip if AI is asking for more information
        const isAskingForInfo = response.includes('I need more information') || 
                                response.includes('To get started, I need') ||
                                response.includes('Please provide these details');
        
        if (isAskingForContent && response && !isAskingForInfo) {
          updatePRDFromAIResponse(response, message);
        }
      } else {
        console.log('Empty response from Ollama, using fallback');
        throw new Error('Empty response from Ollama');
      }
    } catch (error) {
      console.error('=== OLLAMA ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Is network error?', error.message.includes('Network') || error.message.includes('CORS'));
      console.error('Full error:', error);
      console.error('Error stack:', error.stack);
      console.error('===================');
      
      // Check if it's specifically a CORS/network error
      if (error.message.includes('Network') || error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
        addMessage({ 
          role: 'assistant', 
          content: `⚠️ Cannot connect to Ollama. Please ensure:
1. Ollama is running (check with: ollama list)
2. CORS is enabled for Ollama
3. The browser allows connections to localhost:11434

Error: ${error.message}

For now, here's what you should include in your PRD request:
- Product/Feature Name
- Problem Statement
- Target Users
- Core Functionality (2-3 features)
- Success Metric`
        });
      } else {
        // Other errors - use fallback
        const fallbackResponse = getFallbackResponse(message);
        addMessage({ 
          role: 'assistant', 
          content: fallbackResponse 
        });
      }
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
      <SystemPromptModal 
        isOpen={showSystemPrompt} 
        onClose={() => setShowSystemPrompt(false)} 
      />
      
      <LeftPaneContainer>
        <LeftPanel />
      </LeftPaneContainer>

      <MiddlePane>
        <Header>
          <Title>💬 AI Assistant</Title>
          <Subtitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {isOllamaConnected ? (
              <>
                <span style={{ color: '#10b981' }}>● Connected</span>
                <select 
                  value={selectedModel} 
                  onChange={(e) => handleModelChange(e.target.value)}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}
                >
                  {availableModels.map(model => (
                    <option key={model.name} value={model.name} style={{ background: '#1a1d23' }}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <span style={{ color: '#ef4444' }}>● Ollama not connected</span>
            )}
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              style={{
                marginLeft: '10px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {showSystemPrompt ? 'Hide' : 'Show'} System Prompt
            </button>
          </Subtitle>
        </Header>
        <ChatPane onSendMessage={handleSendMessage} />
      </MiddlePane>

      <RightPane>
        <TabContainer>
          <Tab
            active={rightPaneTab === 'prd'}
            onClick={() => setRightPaneTab('prd')}
          >
            📝 PRD Editor
          </Tab>
          <Tab
            active={rightPaneTab === 'specification'}
            onClick={() => setRightPaneTab('specification')}
          >
            🔧 Specification
          </Tab>
        </TabContainer>

        {rightPaneTab === 'prd' ? (
          <>
            <Header>
              <Title>📝 PRD Editor</Title>
              <Subtitle>
                {currentProject ? currentProject.name : 'Select a project to begin'}
              </Subtitle>
            </Header>
            {currentProject && currentPRD ? (
              <PRDEditor />
            ) : currentProject ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#999'
              }}>
                <h3>Loading PRD...</h3>
                <p>Initializing PRD template for {currentProject.name}</p>
              </div>
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
          </>
        ) : (
          <SpecificationView />
        )}
      </RightPane>
    </AppContainer>
  );
}

export default App;
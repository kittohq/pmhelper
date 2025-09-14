# PM Helper PRD Workflow Specification

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Workflow Components](#workflow-components)
4. [Template System](#template-system)
5. [AI Integration](#ai-integration)
6. [Interaction Flow](#interaction-flow)
7. [Examples](#examples)
8. [Technical Implementation](#technical-implementation)

## System Overview

PM Helper is an AI-powered Product Requirements Document (PRD) creation tool that combines structured templates with intelligent content generation using local LLM (Ollama with mistral:7b-instruct).

### Key Features
- **Multi-template Support**: 6 specialized PRD templates for different methodologies
- **AI-Assisted Writing**: Context-aware content generation and suggestions
- **Project Management**: Isolated PRDs per project with persistence
- **Real-time Validation**: Missing sections tracking and completion status
- **Interactive Refinement**: Iterative improvement through conversational AI

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Left      │  │   Middle    │  │   Right     │        │
│  │   Panel     │  │   Panel     │  │   Panel     │        │
│  │             │  │             │  │             │        │
│  │ - Projects  │  │ - AI Chat   │  │ - PRD Editor│        │
│  │ - Templates │  │ - Assistant │  │ - Sections  │        │
│  │ - Profile   │  │ - Context   │  │ - Validation│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │   Zustand    │                         │
│                    │    Store     │                         │
│                    └──────┬──────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Backend    │
                    │  (Express)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Ollama    │
                    │ (mistral:7b) │
                    └──────────────┘
```

## Workflow Components

### 1. Project Management
- **Creation**: User creates project → Selects template → PRD initialized
- **Selection**: Projects persist in localStorage → Switch between projects
- **Deletion**: Remove project and associated PRD data

### 2. Template Selection
- User selects from 6 templates:
  - **Lean**: Minimalist problem/solution/metrics
  - **Agile**: User stories with acceptance criteria
  - **Startup**: Hypothesis-driven MVP approach
  - **Amazon**: Working backwards from press release
  - **Technical**: Engineering specifications
  - **Enterprise**: Comprehensive documentation

### 3. Content Creation Flow
```
User Input → AI Processing → Content Generation → Section Update → Validation
     ↑                                                    │
     └────────────── Refinement Loop ←───────────────────┘
```

## Template System

Each template contains:
```json
{
  "name": "Template Name",
  "templateType": "identifier",
  "description": "Purpose and methodology",
  "sections": {
    "sectionKey": {
      "title": "Display Title",
      "content": "", // User-filled content
      "required": true/false,
      "prompts": [
        "Guiding question 1",
        "Guiding question 2"
      ],
      "template": "Optional format template"
    }
  }
}
```

### Template Loading Process
1. User selects template
2. Backend loads JSON from `/templates/[template-type]-prd.json`
3. Frontend initializes PRD with template structure
4. Sections marked as empty, ready for content

## AI Integration

### System Prompt Structure
The AI receives a comprehensive prompt containing:

```javascript
const systemPrompt = `
You are an experienced Product Manager assistant helping create PRDs.

Current Template: ${templateName}
User's Message: ${userMessage}

Current PRD Content:
${existingPRDContent}

Template Structure:
${templateSections}

Missing Required Sections:
${missingSections}

Context Documents:
${uploadedDocuments}

Instructions:
- Build upon existing content
- Generate content for missing sections
- Maintain consistency with template style
- Ask for clarification if information is insufficient
`;
```

### AI Response Processing

1. **Content Validation**
   - Check if user provided sufficient information
   - Identify which sections can be generated
   - Request missing critical details

2. **Content Generation**
   - Generate section-specific content
   - Reference existing PRD content for consistency
   - Apply template-specific formatting

3. **Progressive Enhancement**
   - First pass: Basic structure
   - Subsequent passes: Add detail and refinement
   - Context accumulation: Each interaction builds on previous

## Interaction Flow

### Complete Workflow Example

#### Step 1: Initial User Input
```
User: "I want to build a fitness tracking mobile app called FitTracker. 
Target users: fitness enthusiasts and beginners
Main features: workout tracking, nutrition logging, device integration
Platform: iOS first, then Android
Revenue: freemium with premium subscriptions
Goal: 100K downloads in 6 months"
```

#### Step 2: AI Processing
The AI receives:
- User's request
- Selected template (e.g., Lean PRD)
- Empty PRD sections
- Validation requirements

#### Step 3: AI Response
```
I'll help you create a PRD for FitTracker. Based on your requirements, 
I'm generating content for the Lean PRD template:

### Problem Statement
Fitness enthusiasts and beginners struggle to maintain consistent workout 
routines and track nutrition effectively. Current solutions are either too 
complex for beginners or too simple for serious athletes...

### Proposed Solution
FitTracker provides an intuitive mobile app that combines workout tracking, 
nutrition logging, and seamless device integration...

[Continues for all sections]

Missing information needed:
- Specific success metrics beyond downloads
- MVP feature prioritization
- Key risks and assumptions
```

#### Step 4: User Refinement
```
User: "Add that success metrics should include 70% retention after 30 days 
and 15% premium conversion. For MVP, focus on basic workout logging and 
weight tracking only."
```

#### Step 5: AI Updates
The AI now has:
- Original PRD content (context)
- New requirements
- Specific sections to update

Response:
```
I'll update the Success Metrics and MVP Scope sections:

### Success Metrics (Updated)
- 100K downloads within 6 months
- 70% user retention after 30 days
- 15% freemium to premium conversion rate
- Average session duration: 8+ minutes
- 4.5+ star rating on app stores

### MVP Scope (Updated)
Phase 1 (Weeks 1-4):
- User registration and basic profile
- Manual workout logging (sets, reps, weight)
- Weight tracking with progress charts
- iOS app release

Future phases will add nutrition tracking and device integration...
```

## Examples

### Example 1: Underspecified Request

**User Input:**
```
"Create a PRD"
```

**AI Response:**
```
I'd be happy to help create your PRD! To get started, I need some essential information:

☐ **Product/Feature Name**: What should we call this?
☐ **Problem Statement**: What specific problem are you solving?
☐ **Target Users**: Who will use this?
☐ **Core Functionality**: What are the 2-3 main things this must do?
☐ **Success Metric**: How will you measure success?
```

### Example 2: Template-Specific Generation

**User selects Amazon Working Backwards template and provides:**
```
"Building a one-click checkout feature for our e-commerce platform"
```

**AI Response (Amazon-specific):**
```
### Press Release

SEATTLE - [Company] today announced One-Click Checkout, a revolutionary 
feature that reduces purchase friction to a single tap. Customers can now 
complete purchases 75% faster, leading to a 30% reduction in cart abandonment...

### Internal FAQ

Q: Why are we building this?
A: Cart abandonment rates are at 68%, with checkout complexity being the #1 reason...

### Customer Experience

Day 1: Customer discovers one-click option during checkout...
Day 30: Customer has saved 15 minutes across multiple purchases...
```

### Example 3: Context-Aware Refinement

**Existing PRD Content:**
```
Problem: Sales teams waste 2+ hours daily on manual reporting
Solution: Automated dashboard with real-time metrics
```

**User Input:**
```
"Add technical requirements for the dashboard"
```

**AI Response:**
```
Based on your automated sales dashboard solution, here are the technical requirements:

### Technical Requirements

**Backend Infrastructure:**
- RESTful API with Node.js/Express
- PostgreSQL for transactional data
- Redis for caching real-time metrics
- Integration with Salesforce, HubSpot APIs

**Frontend Requirements:**
- React dashboard with responsive design
- Real-time updates via WebSocket
- Chart.js for data visualization
- Export functionality (PDF, CSV)

**Performance Requirements:**
- Dashboard load time < 3 seconds
- Real-time updates within 5 seconds
- Support 1000 concurrent users
- 99.9% uptime SLA
```

## Technical Implementation

### Frontend State Management (Zustand)
```javascript
const useStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentPRD: null,
      
      setCurrentProject: (project) => set({ 
        currentProject: project,
        currentPRD: project?.prd || null
      }),
      
      updatePRDSection: (sectionKey, content) => set((state) => ({
        currentPRD: {
          ...state.currentPRD,
          sections: {
            ...state.currentPRD.sections,
            [sectionKey]: {
              ...state.currentPRD.sections[sectionKey],
              content
            }
          }
        }
      }))
    })
  )
);
```

### Backend API Endpoints
```javascript
// Get PRD template
app.get('/api/templates/:type', (req, res) => {
  const template = require(`./templates/${req.params.type}-prd.json`);
  res.json(template);
});

// Proxy to Ollama for AI generation
app.post('/api/ollama/generate', async (req, res) => {
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'mistral:7b-instruct',
    prompt: req.body.prompt,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 4096
    }
  });
  res.json(response.data);
});
```

### Ollama Integration
```javascript
class OllamaService {
  async chat(prompt, context = '') {
    const requestBody = {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
        num_predict: 4096
      }
    };
    
    if (context) {
      requestBody.context = context;
    }
    
    return await axios.post(`${this.baseURL}/generate`, requestBody);
  }
}
```

## Best Practices

### For Users
1. **Start with clear requirements**: Provide product name, problem, users, and goals
2. **Use appropriate template**: Match template to your methodology
3. **Iterate progressively**: Build PRD through multiple refinements
4. **Leverage prompts**: Use template prompts as guidance
5. **Validate regularly**: Check missing sections indicator

### For AI Responses
1. **Context preservation**: Always consider existing PRD content
2. **Template adherence**: Follow template structure and style
3. **Progressive disclosure**: Ask for details when needed
4. **Actionable suggestions**: Provide specific, implementable content
5. **Validation feedback**: Highlight missing required sections

### For Development
1. **Timeout handling**: 5-minute timeout for complex PRD generation
2. **Error recovery**: Graceful fallback for Ollama disconnection
3. **State persistence**: localStorage for project continuity
4. **Context limits**: Manage prompt size for optimal performance
5. **Template extensibility**: JSON-based templates for easy addition

## Troubleshooting

### Common Issues

1. **"AI thinking" hangs**
   - Cause: Complex PRD generation exceeding timeout
   - Solution: Increased timeout to 5 minutes
   - Mitigation: Break requests into smaller sections

2. **Missing context in AI responses**
   - Cause: PRD content not included in prompt
   - Solution: Include currentPRD.sections in prompt
   - Verification: Check console logs for prompt content

3. **Template not loading**
   - Cause: Template file missing or malformed
   - Solution: Verify JSON structure in /templates/
   - Validation: Check backend logs for errors

## Future Enhancements

1. **Streaming responses**: Real-time token generation display
2. **Template builder**: UI for custom template creation
3. **Export formats**: Word, PDF, Confluence integration
4. **Collaboration**: Multi-user PRD editing
5. **Version control**: PRD change tracking and rollback
6. **AI model selection**: Support for different LLMs
7. **Smart suggestions**: Context-aware inline suggestions
8. **Analytics**: PRD quality scoring and recommendations
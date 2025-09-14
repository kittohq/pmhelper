# Prompts and Templates Documentation

This document catalogs all AI prompts and templates used in the PM Helper application, including their purpose, parameters, and expected outputs.

## Table of Contents
1. [PRD Generation Prompts](#prd-generation-prompts)
2. [Assessment Prompts](#assessment-prompts)
3. [Specification Generation Prompts](#specification-generation-prompts)
4. [Background Job System](#background-job-system)

## PRD Generation Prompts

### 1. Underspecification Assessment
**Location**: `frontend/src/App.js:330-364`
**Purpose**: Determines if user input has enough information to generate a meaningful PRD
**Temperature**: 0.3 (for consistency)

```javascript
const focusedAssessmentPrompt = `You are evaluating if a user's request has enough information to create a meaningful Product Requirements Document (PRD).

User's request: "${message}"

To create a meaningful PRD, we need:
1. A clear product/feature name or concept
2. Understanding of the problem being solved
3. Target users or audience
4. At least high-level functionality or features
5. Some notion of success or goals

Evaluate the request above. Does it contain enough information to draft initial PRD sections (even if details would need refinement)?

Examples:
- "I want to build a fitness app" → NEEDS_INFO (too vague, no problem/users/features specified)
- "I want to build FitTracker, a fitness app" → NEEDS_INFO (just a name, no problem/users/features)
- "I want to build a fitness app for busy professionals to track workouts" → SUFFICIENT (has users and purpose)
- "Build an app to help people track fitness goals with social features" → SUFFICIENT (has purpose and features)

Respond with ONLY one word: SUFFICIENT or NEEDS_INFO`;
```

**Response**: Single word - either "SUFFICIENT" or "NEEDS_INFO"

### 2. PRD Content Generation
**Location**: `frontend/src/App.js:405-444`
**Purpose**: Generates complete PRD content when user provides sufficient information
**Temperature**: 0.7 (for creativity)

```javascript
const fullPRDPrompt = `You are a Senior Product Manager creating a comprehensive Product Requirements Document (PRD).

User's Project Description:
"${message}"

Context Documents:
${contextDocs || 'None provided'}

Current PRD Sections (if any):
${JSON.stringify(prdSections, null, 2)}

Create a complete PRD with the following sections:

**Problem Statement**
Clearly define the problem this product/feature solves. Include:
- The specific pain points users face
- Why existing solutions fall short
- The impact of not solving this problem

**Proposed Solution**
Describe your solution approach:
- Core functionality and features
- How it addresses each pain point
- Key differentiators from alternatives

**Success Metrics**
Define measurable success criteria:
- User adoption metrics
- Engagement metrics
- Business impact metrics
- Technical performance metrics

**Risks & Assumptions**
Identify potential challenges:
- Technical risks
- Market risks
- Resource constraints
- Key assumptions being made

Format your response with clear section headers using **bold** markdown.`;
```

## Assessment Prompts

### 3. Specification Readiness Assessment
**Location**: `backend/server-simple.js:141-167`
**Purpose**: Evaluates if PRD + engineering notes are sufficient for technical specification
**Temperature**: 0.3 (for consistency)

```javascript
const assessmentPrompt = `You are a Senior Technical Architect evaluating if you have enough information to create a comprehensive technical specification.

PRD Content:
${JSON.stringify(prd, null, 2)}

Engineering Notes:
${engineeringNotes || 'None provided'}

Required Specification Template: ${specTemplates[templateType]?.name || templateType}

Required sections that need content:
${specTemplates[templateType] ?
  Object.entries(specTemplates[templateType].sections)
    .filter(([_, section]) => section.required)
    .map(([_, section]) => `- ${section.title}`)
    .join('\n') :
  'Template not found'}

Evaluate if you can meaningfully fill each required section.
Consider:
1. Is the technology stack specified or clearly inferrable?
2. Are performance requirements clear?
3. Are integration points identified?
4. Is team capacity/expertise mentioned?
5. Are security requirements addressed?

Respond with ONLY one word: "SUFFICIENT" or "NEEDS_INFO"`;
```

## Specification Generation Prompts

### 4. Technical Specification Generation
**Location**: `frontend/src/components/SpecificationView.js:generateSpecification`
**Purpose**: Creates detailed technical specification from PRD
**Temperature**: 0.7 (for detailed content)
**Execution**: Background job (no timeout)

```javascript
const specPrompt = `You are a Senior Software Architect creating a detailed technical specification.

Context:
${JSON.stringify(prd, null, 2)}

Engineering Manager Notes:
${engineeringNotes || 'None provided'}

Template Type: ${template.name}

Create a comprehensive technical specification covering ALL of these sections:
${Object.entries(template.sections).map(([key, section]) => {
  return `
## ${section.title}
${section.description}
${section.prompts ? '\nConsider: ' + section.prompts.join(', ') : ''}
${section.required ? '(REQUIRED - must have substantial content)' : '(Optional but recommended)'}`;
}).join('\n')}

Requirements:
1. Be specific and detailed - avoid vague statements
2. Include concrete examples, code samples, or diagrams where relevant
3. Address all REQUIRED sections with substantial content
4. Consider team expertise and available resources
5. Include specific technology choices with justification
6. Define clear interfaces and contracts
7. Specify error handling and edge cases
8. Include performance benchmarks and monitoring approach

Format your response with clear section headers matching the template sections above.`;
```

## Background Job System

### 5. Background Job Processing
**Location**: `backend/services/backgroundJobs.js`
**Purpose**: Handles long-running Ollama requests without timeout
**Configuration**:
- No timeout limit
- `num_predict`: 8192 tokens for specifications
- `temperature`: 0.7
- Automatic cleanup after 1 hour

```javascript
async generateSpecification(data) {
  const { prompt, model = 'mistral:7b-instruct' } = data;

  const response = await axios.post('http://127.0.0.1:11434/api/generate', {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 8192  // Allow longer responses for specifications
    }
  }, {
    // No timeout specified - will run until completion
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  return response.data.response;
}
```

## Template Structures

### PRD Template Sections
**Location**: `backend/templates/prd-templates.js`

Available templates:
- `lean`: Basic PRD for MVPs
- `detailed`: Comprehensive PRD with all sections
- `technical`: PRD with technical focus
- `business`: PRD with business metrics focus

### Specification Template Types
**Location**: `backend/templates/spec-templates.js`

Available templates:
1. **Implementation Specification**
   - Technical architecture
   - Component design
   - Data models
   - API contracts
   - Testing strategy

2. **API Specification**
   - Endpoint definitions
   - Request/response schemas
   - Authentication
   - Rate limiting
   - Error handling

3. **System Design Specification**
   - High-level architecture
   - Service boundaries
   - Data flow
   - Scalability approach
   - Deployment strategy

4. **Migration Specification**
   - Current state analysis
   - Target state design
   - Migration phases
   - Rollback procedures
   - Risk mitigation

## Temperature Settings Rationale

### Assessment Tasks (Temperature: 0.3)
- Binary decisions (SUFFICIENT/NEEDS_INFO)
- Consistency across evaluations
- Reduced randomness for reliability

### Content Generation (Temperature: 0.7)
- Creative problem-solving
- Varied language and examples
- Natural-sounding documentation

### Quick Responses (Temperature: 0.5)
- Balance between consistency and variety
- General Q&A and explanations

## Usage Examples

### PRD Generation Flow
1. User provides project description
2. System assesses sufficiency (0.3 temp)
3. If sufficient, generates PRD (0.7 temp)
4. Parses markdown response into sections
5. Updates UI with populated sections

### Specification Generation Flow
1. User completes PRD and adds engineering notes
2. System assesses readiness (0.3 temp)
3. If ready, creates background job
4. Job generates specification (0.7 temp, no timeout)
5. UI polls for status every 3 seconds
6. On completion, populates specification sections

## Error Handling

All prompts include fallback behavior:
- Assessment failures default to conservative (NEEDS_INFO)
- Generation failures trigger user notification
- Background jobs track error state
- Timeout protection for synchronous calls (5 minutes)

## Best Practices

1. **Keep assessment prompts simple** - Single word responses
2. **Use examples in prompts** - Helps model understand expectations
3. **Structure generation prompts clearly** - Use markdown headers
4. **Include context when available** - PRD sections, documents
5. **Monitor token usage** - Set appropriate num_predict limits
6. **Use background jobs for long tasks** - Avoid UI timeouts
7. **Provide user feedback** - Status indicators, progress tracking
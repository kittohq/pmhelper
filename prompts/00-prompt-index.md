# PM Helper - Complete Prompt Index

This directory contains all prompts used in the PM Helper application.

## Prompt Files

### Core System Prompts
1. **[01-main-system-prompt.md](01-main-system-prompt.md)**
   - The primary system prompt that defines the AI's role and behavior
   - Includes minimal requirements, core principles, and template contexts
   - Source: `/frontend/src/config/systemPrompts.js`

### Conditional Prompts
2. **[02-underspecified-request-prompt.md](02-underspecified-request-prompt.md)**
   - Used when user provides insufficient information
   - Forces structured response asking for 5 key pieces of information
   - Triggered when: message < 100 chars and missing key details
   - Source: `/frontend/src/App.js` lines 313-334

3. **[03-prd-generation-prompt.md](03-prd-generation-prompt.md)**
   - Main prompt for generating PRD content
   - Includes current PRD content, template structure, and validation feedback
   - Used when user has provided sufficient information
   - Source: `/frontend/src/App.js` lines 355-370

4. **[04-general-guidance-prompt.md](04-general-guidance-prompt.md)**
   - For answering general PRD questions and best practices
   - Doesn't generate PRD content, provides guidance
   - Triggered by "what is" or "how to" questions
   - Source: `/frontend/src/App.js` lines 379-386

## Prompt Flow Decision Tree

```
User Message
    │
    ├─> Is asking for content creation?
    │   │
    │   ├─> Yes → Is underspecified?
    │   │         │
    │   │         ├─> Yes → Use Prompt #2 (Underspecified)
    │   │         │
    │   │         └─> No → Use Prompt #3 (PRD Generation)
    │   │
    │   └─> No → Use Prompt #4 (General Guidance)
```

## Key Variables Used Across Prompts

- `[USER_MESSAGE]` - The user's input
- `[TEMPLATE_TYPE]` - Current template (lean, agile, startup, etc.)
- `[SYSTEM_PROMPT]` - Full system prompt from buildSystemPrompt()
- `[CURRENT_PRD_CONTENT]` - Existing PRD sections with content
- `[PRD_SECTIONS_JSON]` - Template structure with prompts
- `[MISSING_SECTIONS]` - List of required but empty sections
- `[CONTEXT_DOCUMENTS]` - Uploaded reference materials

## Template-Specific Contexts

Each template type modifies the system prompt with specific guidance:

- **Lean**: "Focus on minimal viable documentation - problem, solution, metrics"
- **Agile**: "Emphasize user stories with clear acceptance criteria"
- **Startup**: "Include hypothesis, experiments, and pivot criteria"
- **Amazon**: "Start with the press release and work backwards"
- **Technical**: "Include detailed technical specifications and architecture"
- **Enterprise**: "Comprehensive documentation with risk analysis and compliance"

## Usage Pattern

1. User sends message
2. App.js determines which prompt category applies
3. Builds complete prompt with:
   - System prompt (from systemPrompts.js)
   - Current context (PRD content, template, missing sections)
   - User's message
   - Specific instructions based on scenario
4. Sends to Ollama for processing
5. AI response follows prompt-specific pattern

## Related Documentation

- [PRD Template Files](/backend/templates/) - JSON template definitions
- [System Prompts Config](/frontend/src/config/systemPrompts.js) - Source code
- [Workflow Specification](/PRD_WORKFLOW_SPECIFICATION.md) - Complete system flow
- [System Prompt Template](/SYSTEM_PROMPT_TEMPLATE.md) - Conceptual documentation
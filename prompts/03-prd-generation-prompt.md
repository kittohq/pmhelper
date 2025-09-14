# PRD Generation Prompt

This is the main prompt used when the user has provided sufficient information to generate PRD content.

## Prompt Structure

```
[SYSTEM_PROMPT]

User's Request: [USER_MESSAGE]

Current PRD Content (what has been written so far):
[CURRENT_PRD_CONTENT or "No content written yet"]

Current PRD Template Structure:
[PRD_SECTIONS_JSON]

Context: [CONTEXT_DOCUMENTS or "No additional context"]

[VALIDATION_FEEDBACK if missing sections exist]

Based on the existing PRD content above and the user's request, continue building the PRD.
If the user has provided sufficient information (product name, problem, users, core functionality, and success metric), generate PRD content for the missing sections.
If information is missing, ask for the specific missing pieces.
Always mention any missing required sections that need to be completed.
```

## Variables

- `[SYSTEM_PROMPT]`: The full system prompt from buildSystemPrompt()
- `[USER_MESSAGE]`: The user's current request
- `[CURRENT_PRD_CONTENT]`: Existing PRD sections with content, formatted as:
  ```
  ### Section Title
  Section content...
  
  ### Another Section
  More content...
  ```
- `[PRD_SECTIONS_JSON]`: JSON structure of all template sections with prompts
- `[CONTEXT_DOCUMENTS]`: Any uploaded documents or additional context
- `[VALIDATION_FEEDBACK]`: If missing required sections:
  ```
  IMPORTANT: The current PRD has these missing required sections that need to be filled:
  - Section Name 1
  - Section Name 2
  
  Include a note about these missing sections in your response and offer to help complete them.
  ```

## Example Full Prompt

```
You are an expert Product Manager with 10+ years of experience creating successful products...
[full system prompt]

User's Request: Help me define the solution for the fitness tracking app

Current PRD Content (what has been written so far):
### Problem Statement
Fitness enthusiasts struggle to track workouts consistently across multiple devices and platforms, leading to incomplete data and reduced motivation.

### Target Users
- Primary: Fitness enthusiasts aged 25-45 who use multiple devices
- Secondary: Personal trainers managing multiple clients

Current PRD Template Structure:
{
  "problem": {
    "title": "Problem Statement",
    "content": "Fitness enthusiasts struggle...",
    "required": true,
    "prompts": [...]
  },
  "solution": {
    "title": "Proposed Solution",
    "content": "",
    "required": true,
    "prompts": [
      "What is our proposed solution?",
      "How does it solve the problem?",
      "What are the key features?"
    ]
  }
  ...
}

Context: No additional context

IMPORTANT: The current PRD has these missing required sections that need to be filled:
- Proposed Solution
- Success Metrics
- MVP Scope

Include a note about these missing sections in your response and offer to help complete them.

Based on the existing PRD content above and the user's request, continue building the PRD.
If the user has provided sufficient information (product name, problem, users, core functionality, and success metric), generate PRD content for the missing sections.
If information is missing, ask for the specific missing pieces.
Always mention any missing required sections that need to be completed.
```

## Expected AI Response Pattern

1. Generate content for the requested section
2. Reference existing PRD content for consistency
3. Note any missing required sections
4. Offer to help complete missing sections

## Usage Location
`/frontend/src/App.js` lines 355-370
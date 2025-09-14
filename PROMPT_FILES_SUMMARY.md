# PM Helper - Complete Prompt Documentation

## All Prompt Files Created

### 📁 `/prompts/` Directory
Contains all extracted prompts from the application:

1. **00-prompt-index.md** - Master index of all prompts
2. **01-main-system-prompt.md** - Core system prompt defining AI behavior
3. **02-underspecified-request-prompt.md** - Used when user provides insufficient info
4. **03-prd-generation-prompt.md** - Main prompt for generating PRD content
5. **04-general-guidance-prompt.md** - For answering general PRD questions

### 📁 `/backend/templates/` Directory
PRD template definitions in JSON:

1. **lean-prd.json** - Minimalist problem/solution/metrics
2. **agile-prd.json** - User stories with acceptance criteria
3. **startup-prd.json** - Hypothesis-driven MVP approach
4. **amazon-prd.json** - Working backwards from press release
5. **technical-prd.json** - Engineering specifications
6. **enterprise-prd.json** - Comprehensive enterprise documentation

### 📄 Root Documentation Files

1. **PRD_WORKFLOW_SPECIFICATION.md** - Complete system workflow documentation
2. **SYSTEM_PROMPT_TEMPLATE.md** - Conceptual prompt template documentation
3. **ACTUAL_SYSTEM_PROMPT.md** - Documentation of implemented system prompt
4. **PROMPT_FILES_SUMMARY.md** - This file

## Prompt Hierarchy

```
System Prompt (from systemPrompts.js)
    │
    ├─> Combined with Context
    │   ├─> Current PRD Content
    │   ├─> Template Structure
    │   ├─> Missing Sections
    │   └─> User Message
    │
    └─> Sent to Ollama based on scenario:
        ├─> Underspecified → Force structured questions
        ├─> Content Generation → Generate PRD sections
        └─> General Guidance → Provide best practices
```

## Key Implementation Files

- **Source Code**: `/frontend/src/config/systemPrompts.js`
- **Usage**: `/frontend/src/App.js` (handleSendMessage function)
- **Templates**: `/backend/templates/*.json`

## Prompt Decision Flow

1. **User sends message** → App.js analyzes intent
2. **Determines category**:
   - Is it about creating content? → Check if underspecified
   - Is it a general question? → Use guidance prompt
3. **Builds complete prompt** with:
   - System prompt (role, principles, requirements)
   - Current context (PRD content, template)
   - Specific instructions for scenario
4. **AI responds** following prompt pattern

## All Prompts Are Now:
✅ Extracted from code
✅ Documented with examples
✅ Saved as individual files
✅ Indexed for easy reference
✅ Include usage locations in source code
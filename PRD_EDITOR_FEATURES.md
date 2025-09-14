# PRD Editor Features Documentation

## Overview
This document explains the features available in the PRD Editor interface and how they interact with the LLM.

## LLM Response Format
- The LLM returns **markdown-formatted text**, not JSON
- The system parses markdown headers to identify sections:
  - `**Problem Statement**`
  - `**Proposed Solution**`
  - `**Success Metrics**`
  - `**Risks & Assumptions**`
- Parsed content is automatically saved to the corresponding PRD section fields

## Section Features

### 1. Helper Prompts ("Click a prompt to add it")
**Location**: Below each section's text area

**What they do**:
- These are **local helpers only** - they do NOT send anything to the LLM
- Clicking a prompt simply inserts that question/prompt into the section's textarea
- Designed to guide users in writing their own content
- Examples:
  - "What specific problem does this solve?"
  - "Who are the target users?"
  - "What are the main features?"

**How to use**:
1. Click on a prompt
2. The prompt text appears in the section
3. You manually write your answer below it
4. It's just a writing aid, not an AI feature

### 2. Suggest Button (Sparkles Icon)
**Location**: Top-right of each section header

**What it does**:
- Sends ONLY that specific section to the LLM
- Requests AI-generated suggestions to improve that section
- **Appends** suggestions to existing content (doesn't replace)

**How it works**:
1. Click "Suggest" button on a section
2. Current section content is sent to LLM with request for improvements
3. LLM generates suggestions based on:
   - The section type (problem, solution, metrics, etc.)
   - Current content in that section
   - PRD best practices
4. Response is appended with header: `### AI Suggestions:`
5. Original content remains, suggestions are added below

**Example Flow**:
```
Original Content: "Users need a better way to track tasks"
[Click Suggest]
Updated Content:
"Users need a better way to track tasks

### AI Suggestions:
- Consider specifying which users (developers, project managers, etc.)
- Quantify the problem (how much time is wasted?)
- Include current pain points with existing solutions"
```

## Section Interaction Modes

### Mode 1: Full PRD Generation
- User provides initial request in chat
- LLM generates complete PRD in markdown
- System parses and populates ALL sections automatically

### Mode 2: Section-by-Section Enhancement
- User writes initial content manually
- Uses "Suggest" button to get AI improvements per section
- Iteratively refines each section

### Mode 3: Guided Writing
- User clicks helper prompts to get questions
- Manually answers each question
- Builds PRD without AI assistance

## Data Flow

### From Chat to Editor
```
User Input → LLM → Markdown Response → Regex Parser → Section Fields
```

### From Editor Suggest Button
```
Section Content → LLM → Suggestions → Append to Section
```

### From Helper Prompts
```
Prompt Click → Insert into Textarea → User Types Answer
```

## Key Implementation Details

### Parsing Logic (App.js lines 594-615)
```javascript
// Parse Problem Statement
const problemMatch = response.match(/(?:\*\*Problem Statement\*\*|Problem Statement:|## Problem.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Proposed Solution|$)/i);
if (problemMatch) {
  sections.problem = problemMatch[1].trim();
}
```

### Suggest Function (PRDEditor.js lines 247-267)
```javascript
const generateSuggestions = async (sectionKey) => {
  const section = currentPRD.sections[sectionKey];
  const suggestions = await ollamaService.generatePRDSuggestions(
    section,
    section.content
  );
  // Append suggestions to existing content
  const updatedContent = section.content + '\n\n### AI Suggestions:\n' + suggestions;
  updatePRDSection(sectionKey, updatedContent);
};
```

### Helper Prompts (PRDEditor.js lines 269-276)
```javascript
const handlePromptClick = (sectionKey, prompt) => {
  const currentContent = section.content || '';
  const updatedContent = currentContent +
    (currentContent ? '\n\n' : '') +
    `**${prompt}**\n[Your answer here]`;
  updatePRDSection(sectionKey, updatedContent);
};
```

## Best Practices

1. **Start with Chat**: Generate initial PRD through chat for best results
2. **Refine with Suggest**: Use Suggest buttons to enhance specific sections
3. **Use Helper Prompts**: For sections needing manual input or specific details
4. **Don't Over-Suggest**: Each Suggest click appends content, avoid duplicating suggestions
5. **Review Before Saving**: AI suggestions should be reviewed and edited as needed

## User Experience Tips

- **For Quick PRDs**: Use chat to generate full PRD at once
- **For Detailed PRDs**: Generate base in chat, then enhance each section with Suggest
- **For Manual PRDs**: Use helper prompts as writing guides
- **For Iterations**: Edit sections manually, then use Suggest for improvements

## Technical Notes

- Suggestions are temperature 0.7 (creative but coherent)
- Section parsing is case-insensitive and handles multiple formats
- Helper prompts are stored in the template definition
- Suggest feature maintains conversation context for better suggestions
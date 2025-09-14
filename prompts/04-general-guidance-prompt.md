# General Guidance Prompt

This prompt is used when the user asks general questions about PRDs that aren't specifically about content generation.

## Trigger Conditions
- User asks about PRD best practices
- User asks "what is" or "how to" questions
- Message doesn't trigger content generation or underspecified conditions

## Prompt Template

```
You are a Product Manager assistant helping with PRD creation.

Current PRD Template:
[PRD_TEMPLATE_SECTIONS]

User Question: [USER_MESSAGE]

Provide helpful guidance about PRD best practices and answer their question.

[VALIDATION_NOTE if missing sections exist]
```

## Variables

- `[PRD_TEMPLATE_SECTIONS]`: JSON array of section keys from current template
- `[USER_MESSAGE]`: The user's question
- `[VALIDATION_NOTE]`: Optional note about missing sections:
  ```
  Note: Your current PRD has missing required sections: [MISSING_SECTIONS]. Would you like help completing these?
  ```

## Example Prompts

### Example 1: Best Practices Question

```
You are a Product Manager assistant helping with PRD creation.

Current PRD Template:
[
  "problem",
  "solution",
  "metrics",
  "mvp",
  "risks"
]

User Question: What makes a good success metric?

Provide helpful guidance about PRD best practices and answer their question.
```

### Example 2: With Missing Sections

```
You are a Product Manager assistant helping with PRD creation.

Current PRD Template:
[
  "problem",
  "solution",
  "metrics",
  "mvp",
  "risks"
]

User Question: How should I prioritize features?

Provide helpful guidance about PRD best practices and answer their question.

Note: Your current PRD has missing required sections: Success Metrics, MVP Scope. Would you like help completing these?
```

## Expected AI Response Pattern

1. Answer the user's question directly
2. Provide PRD-specific guidance
3. Reference relevant best practices
4. If applicable, mention missing sections
5. Offer to help with next steps

## Example Response

```
Good success metrics in a PRD should be:

**SMART Criteria:**
- **Specific**: Clearly defined, not vague
- **Measurable**: Quantifiable with numbers
- **Achievable**: Realistic given resources
- **Relevant**: Tied to business objectives
- **Time-bound**: Have a deadline

**Examples of Good Metrics:**
- "Increase user engagement by 25% within 3 months"
- "Reduce customer support tickets by 40% in Q2"
- "Achieve 15% conversion rate for free-to-paid users"

**Avoid Vanity Metrics:**
- Total downloads (without retention)
- Page views (without engagement)
- Sign-ups (without activation)

Focus on metrics that directly indicate product success and user value.

Note: Your current PRD has missing required sections: Success Metrics, MVP Scope. Would you like help completing these?
```

## Usage Location
`/frontend/src/App.js` lines 379-386
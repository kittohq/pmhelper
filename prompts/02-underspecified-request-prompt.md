# Underspecified Request Prompt

This prompt is used when the user's request is too vague to generate meaningful PRD content.

## Trigger Conditions
- User says "create a PRD" or similar
- Message length < 100 characters
- Missing key information (product name, problem, users)

## Prompt Template

```
The user said: "[USER_MESSAGE]"

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

Please provide these details, and I'll create a comprehensive PRD using the [TEMPLATE_TYPE] template.

[MISSING_SECTIONS_TEXT if applicable]
```

## Variables
- `[USER_MESSAGE]`: The original user's message
- `[TEMPLATE_TYPE]`: Current template (lean, agile, startup, etc.)
- `[MISSING_SECTIONS_TEXT]`: List of missing required sections if PRD already exists

## Example Output

```
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

Please provide these details, and I'll create a comprehensive PRD using the lean template.

⚠️ **Missing Required Sections in Your Current PRD:**
• Problem Statement
• Proposed Solution
• Success Metrics
These sections need to be completed for a comprehensive PRD.
```

## Usage Location
`/frontend/src/App.js` lines 313-334
# Temperature Settings Documentation

## Overview
This document explains the temperature settings used throughout the PM Helper application for different AI tasks and the reasoning behind each choice.

## What is Temperature?
Temperature is a parameter that controls the randomness/creativity of AI responses:
- **Lower temperature (0.0-0.3)**: More deterministic, focused, consistent responses
- **Medium temperature (0.4-0.6)**: Balanced between consistency and creativity
- **Higher temperature (0.7-1.0)**: More creative, diverse, potentially unpredictable responses

## Temperature Settings by Task

### 1. PRD Assessment (Underspecification Check)
**Location**: `frontend/src/App.js` (line 387)
```javascript
temperature: 0.3,  // Low but not too low - maintains reasoning ability
top_k: 20,         // Slightly wider choice for better context understanding
top_p: 0.7,        // Moderate probability distribution
seed: 42           // Fixed seed for reproducibility
```

**Why 0.3?**
- Need consistent assessment for demo reliability
- Must maintain reasoning ability to understand context
- Binary decision (SUFFICIENT/NEEDS_INFO) requires determinism
- 0.1 was too rigid and lost nuanced understanding
- 0.3 provides the sweet spot between consistency and intelligence

### 2. PRD Content Generation
**Location**: `frontend/src/services/ollamaService.js` (default chat)
```javascript
temperature: 0.7,  // Default for creative content
top_k: 40,
top_p: 0.9,
num_predict: 4096
```

**Why 0.7?**
- PRD generation requires creativity and innovation
- Need diverse feature suggestions and problem articulation
- Higher temperature produces more natural, engaging content
- Avoids generic, cookie-cutter PRD sections

### 3. Specification Assessment
**Location**: `backend/server-simple.js` (line 175)
```javascript
temperature: 0.3,
num_predict: 10  // Just need one word response
```

**Why 0.3?**
- Similar to PRD assessment - binary decision
- Evaluating technical completeness requires consistency
- Low enough to be reliable, high enough to understand context

### 4. General Chat/Q&A
**Location**: `frontend/src/services/ollamaService.js` (default)
```javascript
temperature: 0.7  // Default setting
```

**Why 0.7?**
- General questions benefit from varied responses
- Provides helpful, conversational answers
- Matches typical chatbot behavior expectations

## Temperature Guidelines for Future Features

| Task Type | Recommended Temperature | Rationale |
|-----------|------------------------|-----------|
| Yes/No Decisions | 0.2-0.3 | Need consistency and reliability |
| Assessment/Evaluation | 0.3-0.4 | Balance consistency with context understanding |
| Technical Documentation | 0.4-0.5 | Accurate but not overly rigid |
| Creative Content (PRDs) | 0.6-0.8 | Need innovation and diverse ideas |
| Code Generation | 0.2-0.4 | Correctness is paramount |
| Brainstorming | 0.8-1.0 | Maximum creativity and divergent thinking |
| Summarization | 0.3-0.5 | Accurate representation of source material |

## Trade-offs to Consider

### Lower Temperature (< 0.3)
**Pros:**
- Highly consistent responses
- Predictable for demos
- Reliable decision-making

**Cons:**
- Less creative/generic output
- May miss contextual nuances
- Can seem robotic or formulaic

### Higher Temperature (> 0.7)
**Pros:**
- Creative and diverse responses
- Better at inferring implicit requirements
- More engaging content

**Cons:**
- Less consistent (problematic for demos)
- May occasionally produce unexpected results
- Harder to reproduce exact outputs

## Best Practices

1. **Use Variable Temperature**: Don't use the same temperature for all tasks
2. **Test Empirically**: Test different temperatures for your specific use case
3. **Consider the User Journey**: Assessments need consistency, content needs creativity
4. **Document Changes**: Always document why you chose a specific temperature
5. **Provide Overrides**: Consider allowing power users to adjust temperature settings

## Implementation Example

To add temperature control to a new feature:

```javascript
// For assessment or decision tasks
const response = await ollamaService.chatWithOptions(
  prompt,
  context,
  {
    temperature: 0.3,  // Low for consistency
    top_k: 20,         // Moderate choice range
    top_p: 0.7,        // Moderate probability
    seed: 42           // Optional: fixed seed for reproducibility
  }
);

// For creative content generation
const response = await ollamaService.chat(prompt, context);
// Uses default 0.7 temperature
```

## Testing Temperature Settings

When testing different temperatures:

1. Run the same prompt 5-10 times at each temperature
2. Evaluate consistency vs quality trade-off
3. Consider the user experience impact
4. Document your findings

## Future Improvements

1. **User-Configurable Temperatures**: Add settings UI for power users
2. **Adaptive Temperature**: Adjust based on task complexity
3. **Temperature Profiles**: Save preferred settings for different workflows
4. **A/B Testing**: Collect data on optimal temperatures for different tasks

## References

- [Ollama Model Parameters](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter)
- [Understanding LLM Temperature](https://platform.openai.com/docs/guides/text-generation/temperature)
- [Top-k and Top-p Sampling](https://huggingface.co/blog/how-to-generate)
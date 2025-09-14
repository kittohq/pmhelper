// Test script to verify PRD parsing works correctly
const testPRDResponse = `I'll help you create a comprehensive PRD for FitTracker - your fitness tracking mobile app.

**Problem Statement**
Fitness enthusiasts and beginners often struggle to maintain consistent workout routines, track their progress effectively, and integrate nutrition data with their fitness goals. Current solutions are either too complex for beginners or lack comprehensive features for serious fitness enthusiasts. Users need a unified platform that combines workout tracking, nutrition logging, and wearable device integration in an intuitive, motivating interface.

**Proposed Solution**
FitTracker will be a comprehensive fitness tracking mobile application that combines three core features:
1. **Workout Tracking**: Pre-built and custom workout plans with exercise library, rep/set tracking, and rest timers
2. **Nutrition Logging**: Barcode scanning, meal planning, calorie tracking, and macro breakdowns
3. **Device Integration**: Sync with popular wearables (Apple Watch, Fitbit, Garmin) for heart rate, steps, and activity data
4. **AI Coaching**: Personalized recommendations based on user progress and goals
5. **Social Features**: Share workouts, join challenges, and connect with fitness buddies

**Success Metrics**
- **User Acquisition**: 100,000 downloads within 6 months of launch
- **User Retention**: 70% 30-day retention rate, 40% 90-day retention rate
- **Engagement**: Average of 4 app sessions per week per active user
- **Premium Conversion**: 25% free-to-premium conversion rate within first 3 months
- **User Satisfaction**: Maintain 4.5+ star rating on app stores
- **Revenue**: $500K ARR by end of year one

**Risks & Assumptions**
- **Technical Risks**: Complex integration with multiple wearable device APIs may cause delays
- **Market Risks**: Highly competitive market with established players (MyFitnessPal, Strava)
- **Resource Risks**: Need experienced mobile developers familiar with health data APIs
- **Assumptions**: Users are willing to pay for premium features, wearable device adoption continues to grow
- **Mitigation**: Start with MVP focusing on core features, conduct user testing early and often`;

// Function to test parsing
function testParsing() {
  const sections = {};

  // Parse Problem Statement - handle bold markdown format
  const problemMatch = testPRDResponse.match(/(?:\*\*Problem Statement\*\*|Problem Statement:|## Problem.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Proposed Solution|$)/i);
  if (problemMatch) {
    sections.problem = problemMatch[1].trim();
  }

  // Parse Proposed Solution
  const solutionMatch = testPRDResponse.match(/(?:\*\*Proposed Solution\*\*|Proposed Solution:|## Solution.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Success Metrics|$)/i);
  if (solutionMatch) {
    sections.solution = solutionMatch[1].trim();
  }

  // Parse Success Metrics
  const metricsMatch = testPRDResponse.match(/(?:\*\*Success Metrics\*\*|Success Metrics:|## Metrics.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Risks|$)/i);
  if (metricsMatch) {
    sections.metrics = metricsMatch[1].trim();
  }

  // Parse Risks & Assumptions - handle various formats
  const risksMatch = testPRDResponse.match(/(?:\*\*Risks.*?\*\*|Risks.*?:|## Risks.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|$)/i);
  if (risksMatch) {
    sections.risks = risksMatch[1].trim();
  }

  console.log('Parsed sections:');
  console.log('================');

  for (const [key, content] of Object.entries(sections)) {
    console.log(`\n${key.toUpperCase()}:`);
    console.log('Length:', content.length);
    console.log('First 100 chars:', content.substring(0, 100) + '...');
  }

  return sections;
}

// Run the test
const result = testParsing();
console.log('\n\nTotal sections parsed:', Object.keys(result).length);
console.log('Section keys:', Object.keys(result).join(', '));
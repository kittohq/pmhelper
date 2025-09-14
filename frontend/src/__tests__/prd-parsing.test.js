import '@testing-library/jest-dom';

// Mock the FitTracker PRD response
const mockFitTrackerResponse = `I'll help you create a comprehensive PRD for FitTracker - your fitness tracking mobile app.

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

describe('PRD Parsing Tests', () => {
  let parsePRDResponse;

  beforeEach(() => {
    // Extract the parsing logic for testing
    parsePRDResponse = (response) => {
      const sections = {};

      // Parse Problem Statement - handle bold markdown format
      const problemMatch = response.match(/(?:\*\*Problem Statement\*\*|Problem Statement:|## Problem.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Proposed Solution|$)/i);
      if (problemMatch) {
        sections.problem = problemMatch[1].trim();
      }

      // Parse Proposed Solution
      const solutionMatch = response.match(/(?:\*\*Proposed Solution\*\*|Proposed Solution:|## Proposed Solution|## Solution.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Success Metrics|$)/i);
      if (solutionMatch) {
        sections.solution = solutionMatch[1].trim();
      }

      // Parse Success Metrics
      const metricsMatch = response.match(/(?:\*\*Success Metrics\*\*|Success Metrics:|## Metrics.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|Risks|$)/i);
      if (metricsMatch) {
        sections.metrics = metricsMatch[1].trim();
      }

      // Parse Risks & Assumptions - handle various formats
      const risksMatch = response.match(/(?:\*\*Risks.*?\*\*|Risks.*?:|## Risks.*?)\s*\n+([\s\S]*?)(?=\n\*\*[A-Z]|\n##|$)/i);
      if (risksMatch) {
        sections.risks = risksMatch[1].trim();
      }

      return sections;
    };
  });

  test('should parse FitTracker PRD response correctly', () => {
    const result = parsePRDResponse(mockFitTrackerResponse);

    // Check all sections were parsed
    expect(Object.keys(result)).toEqual(['problem', 'solution', 'metrics', 'risks']);
  });

  test('should extract Problem Statement correctly', () => {
    const result = parsePRDResponse(mockFitTrackerResponse);

    expect(result.problem).toBeDefined();
    expect(result.problem).toContain('Fitness enthusiasts and beginners often struggle');
    expect(result.problem).toContain('unified platform');
    expect(result.problem.length).toBeGreaterThan(100);
  });

  test('should extract Proposed Solution correctly', () => {
    const result = parsePRDResponse(mockFitTrackerResponse);

    expect(result.solution).toBeDefined();
    expect(result.solution).toContain('FitTracker will be a comprehensive fitness tracking');
    expect(result.solution).toContain('Workout Tracking');
    expect(result.solution).toContain('Nutrition Logging');
    expect(result.solution).toContain('Device Integration');
  });

  test('should extract Success Metrics correctly', () => {
    const result = parsePRDResponse(mockFitTrackerResponse);

    expect(result.metrics).toBeDefined();
    expect(result.metrics).toContain('100,000 downloads');
    expect(result.metrics).toContain('70% 30-day retention');
    expect(result.metrics).toContain('$500K ARR');
  });

  test('should extract Risks & Assumptions correctly', () => {
    const result = parsePRDResponse(mockFitTrackerResponse);

    expect(result.risks).toBeDefined();
    expect(result.risks).toContain('Technical Risks');
    expect(result.risks).toContain('Market Risks');
    expect(result.risks).toContain('MyFitnessPal, Strava');
  });

  test('should handle alternative formatting', () => {
    const alternativeResponse = `## Problem Statement
Users struggle with fitness tracking.

## Proposed Solution
Build a comprehensive app.

## Success Metrics
Get 100k users.

## Risks and Assumptions
Competition is tough.`;

    const result = parsePRDResponse(alternativeResponse);

    expect(result.problem).toBeDefined();
    expect(result.solution).toBeDefined();
    expect(result.solution).toContain('Build a comprehensive app');
    expect(result.metrics).toBeDefined();
    expect(result.risks).toBeDefined();
  });
});
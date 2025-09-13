// Mock AI service that provides PRD assistance without requiring Ollama
class MockAIService {
  async generatePRDContent(projectName, projectType = 'web') {
    const templates = {
      web: {
        overview: `## Product Overview

**Product Name:** ${projectName}

**Problem Statement:**
Users currently face challenges with [specific pain points]. Our research indicates that [percentage] of users struggle with [specific issue], leading to [negative outcome].

**Solution:**
${projectName} is a web-based platform that enables users to [core functionality]. By leveraging [key technology/approach], we provide a seamless experience that reduces [metric] by [percentage].

**Target Audience:**
- Primary: [Primary user segment] who need to [primary use case]
- Secondary: [Secondary user segment] who want to [secondary use case]

**Value Proposition:**
Unlike existing solutions, ${projectName} offers [unique differentiator] that allows users to [unique benefit] in [time frame], resulting in [measurable outcome].`,

        goals: `## Goals & Success Metrics

**Primary Goals:**
1. Increase user engagement by 40% within Q1 2024
2. Achieve 10,000 active users within 6 months of launch
3. Reduce task completion time from 15 minutes to 3 minutes
4. Maintain user satisfaction score above 4.5/5.0

**Key Performance Indicators (KPIs):**
- Daily Active Users (DAU): Target 1,000 by Month 3
- User Retention Rate: >60% after 30 days
- Task Completion Rate: >85%
- Average Session Duration: >5 minutes
- Net Promoter Score (NPS): >50

**Success Criteria:**
- Launch MVP with core features by [date]
- Achieve product-market fit validation through user feedback
- Generate positive ROI within 12 months`,

        businessObjectives: `## Business Objectives

**Strategic Alignment:**
This initiative directly supports our company's strategic goal of [company goal] by providing [specific contribution].

**Revenue Impact:**
- Projected revenue: $[amount] in Year 1
- Cost savings: $[amount] through [efficiency gain]
- Market opportunity: $[TAM size] total addressable market

**Competitive Advantage:**
- First-mover advantage in [specific niche]
- Proprietary technology in [area]
- Strategic partnerships with [partners]

**Investment & ROI:**
- Initial investment: $[amount]
- Expected break-even: Month [X]
- 3-year projected ROI: [X]%`,

        userStories: `## User Stories

**Epic 1: User Onboarding**
- As a new user, I want to sign up quickly so that I can start using the product immediately
- As a new user, I want a guided tour so that I understand key features
- As a user, I want to import my existing data so that I don't start from scratch

**Epic 2: Core Functionality**
- As a user, I want to [core action] so that I can [achieve goal]
- As a power user, I want keyboard shortcuts so that I can work more efficiently
- As a team lead, I want to see analytics so that I can track team performance

**Epic 3: Collaboration**
- As a team member, I want to share my work so that others can collaborate
- As a manager, I want to set permissions so that I can control access
- As a user, I want real-time updates so that I see changes immediately

**Acceptance Criteria Example:**
Given I am a registered user
When I click the "Create New" button
Then I should see a form with all required fields
And I should be able to save my work
And I should receive a confirmation message`,

        scope: `## Scope & Boundaries

**In Scope - MVP:**
✅ User authentication and authorization
✅ Core CRUD operations for main entities
✅ Basic reporting dashboard
✅ Email notifications
✅ Mobile-responsive web interface
✅ Integration with [key third-party service]

**In Scope - Phase 2:**
📋 Advanced analytics and insights
📋 API for third-party integrations
📋 Native mobile applications
📋 Advanced collaboration features
📋 AI-powered recommendations

**Out of Scope:**
❌ Offline functionality (Year 2)
❌ Multi-language support (Future)
❌ White-label solution (TBD)
❌ Legacy system migration tools

**Dependencies:**
- Third-party API availability
- Design system completion
- Infrastructure setup
- Security audit completion`,

        technicalSpecs: `## Technical Specifications

**Architecture:**
- Frontend: React 18+ with TypeScript
- Backend: Node.js with Express/NestJS
- Database: PostgreSQL for relational data, Redis for caching
- Infrastructure: AWS/Azure cloud services
- CI/CD: GitHub Actions / Jenkins

**Performance Requirements:**
- Page load time: <2 seconds
- API response time: <200ms for 95% of requests
- Uptime: 99.9% availability
- Concurrent users: Support 10,000 simultaneous users
- Data retention: 90 days for activity logs

**Security Requirements:**
- OAuth 2.0 / JWT authentication
- End-to-end encryption for sensitive data
- GDPR/CCPA compliance
- Regular security audits
- Role-based access control (RBAC)

**Integration Points:**
- Payment gateway (Stripe/PayPal)
- Email service (SendGrid)
- Analytics (Mixpanel/Amplitude)
- Cloud storage (S3)
- Monitoring (Datadog/New Relic)`,

        timeline: `## Timeline & Milestones

**Phase 1: Foundation (Weeks 1-4)**
- Week 1-2: Technical architecture and setup
- Week 3-4: Core backend development
- Deliverable: Basic API and database schema

**Phase 2: MVP Development (Weeks 5-12)**
- Week 5-8: Frontend development
- Week 9-10: Integration and testing
- Week 11-12: Bug fixes and polish
- Deliverable: Working MVP with core features

**Phase 3: Beta Launch (Weeks 13-16)**
- Week 13-14: Beta user onboarding
- Week 15-16: Feedback incorporation
- Deliverable: Production-ready application

**Phase 4: General Availability (Week 17+)**
- Public launch
- Marketing campaign
- Continuous improvement based on metrics

**Critical Path:**
Design → Backend API → Frontend → Testing → Launch`,

        risks: `## Risks & Mitigation

**Technical Risks:**
- Risk: Scalability issues with chosen architecture
  - Mitigation: Conduct load testing early, implement auto-scaling
  
- Risk: Third-party API changes or downtime
  - Mitigation: Build abstraction layer, implement fallback mechanisms

**Business Risks:**
- Risk: Low user adoption
  - Mitigation: Beta testing program, iterative feedback loops
  
- Risk: Competitor launches similar product
  - Mitigation: Focus on unique differentiators, faster time to market

**Resource Risks:**
- Risk: Key team member unavailability
  - Mitigation: Knowledge documentation, cross-training
  
- Risk: Budget overrun
  - Mitigation: Phased approach, regular budget reviews

**Compliance Risks:**
- Risk: Data privacy regulation changes
  - Mitigation: Privacy-by-design approach, legal consultation`
      }
    };

    return templates.web || templates.web;
  }

  async generateSuggestions(section, currentContent) {
    const suggestions = {
      overview: [
        "Add specific metrics to quantify the problem",
        "Include market research data to support the problem statement",
        "Define clear success criteria for the solution",
        "Add competitive analysis to highlight differentiators"
      ],
      goals: [
        "Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)",
        "Add baseline metrics for comparison",
        "Include both leading and lagging indicators",
        "Define what success looks like in 30, 60, 90 days"
      ],
      userStories: [
        "Add acceptance criteria for each user story",
        "Prioritize stories using MoSCoW method",
        "Include negative scenarios and edge cases",
        "Add story points or effort estimates"
      ],
      scope: [
        "Clearly define MVP vs future phases",
        "List technical and business constraints",
        "Include assumptions and dependencies",
        "Add decision criteria for scope changes"
      ],
      timeline: [
        "Add buffer time for unexpected delays",
        "Include key decision points and checkpoints",
        "Define clear deliverables for each milestone",
        "Add resource allocation for each phase"
      ]
    };

    return suggestions[section] || [
      "Add more specific details and examples",
      "Include measurable success criteria",
      "Consider edge cases and exceptions",
      "Add supporting data or research"
    ];
  }

  async analyzePRD(prd) {
    const sections = Object.keys(prd.sections || {});
    const completedSections = sections.filter(key => 
      prd.sections[key].content && prd.sections[key].content.length > 50
    );
    
    const completeness = Math.round((completedSections.length / sections.length) * 100);
    
    return {
      completeness,
      strengths: [
        completedSections.length > 5 ? "Good coverage of essential sections" : "",
        prd.sections.goals?.content ? "Clear goals defined" : "",
        prd.sections.userStories?.content ? "User-centered approach" : ""
      ].filter(Boolean),
      improvements: [
        completeness < 50 ? "Complete more sections for a comprehensive PRD" : "",
        !prd.sections.risks?.content ? "Add risk assessment and mitigation strategies" : "",
        !prd.sections.timeline?.content ? "Include detailed timeline and milestones" : "",
        "Add more specific metrics and KPIs",
        "Include competitive analysis"
      ].filter(Boolean),
      missingCritical: sections.filter(key => 
        prd.sections[key].required && (!prd.sections[key].content || prd.sections[key].content.length < 20)
      ).map(key => prd.sections[key].title)
    };
  }

  async chat(message, context) {
    // Provide helpful responses based on common PRD questions
    const lowercaseMsg = message.toLowerCase();
    
    if (lowercaseMsg.includes('user stor')) {
      return `Here's how to write effective user stories:

**Format:** As a [user type], I want to [action] so that [benefit]

**Best Practices:**
1. Keep them small and focused on one capability
2. Write from the user's perspective, not technical
3. Include acceptance criteria
4. Make them testable

**Example:**
As a project manager, I want to export PRDs as PDF so that I can share them with stakeholders offline.

**Acceptance Criteria:**
- PDF includes all sections with formatting
- File size is under 5MB
- Export completes in under 10 seconds`;
    }
    
    if (lowercaseMsg.includes('metric') || lowercaseMsg.includes('kpi')) {
      return `Key metrics to include in your PRD:

**User Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- User retention (1-day, 7-day, 30-day)
- Churn rate
- User satisfaction (NPS, CSAT)

**Engagement Metrics:**
- Session duration
- Feature adoption rate
- Task completion rate
- Time to value

**Business Metrics:**
- Revenue per user
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Conversion rate

**Technical Metrics:**
- Page load time
- API response time
- Error rate
- Uptime percentage`;
    }
    
    if (lowercaseMsg.includes('scope')) {
      return `Managing scope effectively:

**MVP Scope Definition:**
1. Identify core value proposition
2. List must-have features only
3. Remove nice-to-haves
4. Focus on solving one problem well

**Scope Creep Prevention:**
- Document all scope decisions
- Require change requests for additions
- Evaluate impact on timeline/budget
- Get stakeholder sign-off

**Prioritization Framework:**
- Impact vs Effort matrix
- MoSCoW (Must/Should/Could/Won't)
- RICE scoring
- Kano model`;
    }
    
    return `I can help you with your PRD. Based on your question about "${message}", here are some suggestions:

1. Start by clearly defining the problem you're solving
2. Identify your target users and their needs
3. Set measurable goals and success metrics
4. Define scope boundaries (what's in vs out)
5. Create a realistic timeline with milestones

Would you like me to elaborate on any of these areas? You can also:
- Ask about specific sections (e.g., "How do I write user stories?")
- Request templates (e.g., "Show me a goals template")
- Get feedback (e.g., "Review my product overview")`;
  }
}

export const mockAIService = new MockAIService();
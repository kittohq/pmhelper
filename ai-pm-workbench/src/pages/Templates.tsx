import { useState } from "react";
import { FileText, Code, Save, Edit, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const defaultPRDTemplate = `# Product Requirements Document: [Product Name]

## Executive Summary
Brief overview of the product and its purpose.

## Problem Statement
- What problem are we solving?
- Who experiences this problem?
- How significant is this problem?

## Objectives & Success Metrics
### Primary Goals
- Goal 1
- Goal 2
- Goal 3

### Key Metrics
- Metric 1: [Target]
- Metric 2: [Target]
- Metric 3: [Target]

## User Stories & Requirements
### User Personas
- Persona 1: [Description]
- Persona 2: [Description]

### User Stories
- As a [user type], I want [functionality] so that [benefit]
- As a [user type], I want [functionality] so that [benefit]

## Technical Requirements
### Functional Requirements
1. Requirement 1
2. Requirement 2
3. Requirement 3

### Non-Functional Requirements
- Performance: [Requirements]
- Security: [Requirements]
- Scalability: [Requirements]

## Implementation Timeline
### Phase 1: [Timeframe]
- Milestone 1
- Milestone 2

### Phase 2: [Timeframe]
- Milestone 3
- Milestone 4

## Risks & Dependencies
- Risk 1: [Mitigation strategy]
- Dependency 1: [Details]

## Appendix
Additional context, research, or supporting materials.`;

const defaultSpecTemplate = `# Technical Specification: [Feature Name]

## Overview
High-level description of the technical solution.

## Architecture
### System Architecture
- Component 1: [Description]
- Component 2: [Description]
- Component 3: [Description]

### Data Flow
1. Step 1: [Description]
2. Step 2: [Description]
3. Step 3: [Description]

## API Design
### Endpoints
\`\`\`
GET /api/endpoint1
POST /api/endpoint2
PUT /api/endpoint3
DELETE /api/endpoint4
\`\`\`

### Data Models
\`\`\`typescript
interface Model1 {
  id: string;
  property1: string;
  property2: number;
}

interface Model2 {
  id: string;
  property1: string;
  property2: boolean;
}
\`\`\`

## Database Schema
### Tables
- Table 1: [Description and fields]
- Table 2: [Description and fields]

### Relationships
- Relationship 1: [Description]
- Relationship 2: [Description]

## Security Considerations
- Authentication: [Strategy]
- Authorization: [Strategy] 
- Data Protection: [Strategy]

## Performance Requirements
- Response Time: [Target]
- Throughput: [Target]
- Concurrent Users: [Target]

## Testing Strategy
### Unit Tests
- Test category 1
- Test category 2

### Integration Tests
- Integration scenario 1
- Integration scenario 2

### End-to-End Tests
- User journey 1
- User journey 2

## Deployment Plan
### Infrastructure
- Environment 1: [Configuration]
- Environment 2: [Configuration]

### Rollout Strategy
1. Phase 1: [Details]
2. Phase 2: [Details]
3. Phase 3: [Details]

## Monitoring & Observability
- Metrics to track
- Alerts to configure
- Logging strategy`;

export default function Templates() {
  const [templates, setTemplates] = useState({
    prd: defaultPRDTemplate,
    spec: defaultSpecTemplate
  });
  const [editMode, setEditMode] = useState<{ prd: boolean; spec: boolean }>({
    prd: false,
    spec: false
  });
  const { toast } = useToast();

  const toggleEditMode = (type: 'prd' | 'spec') => {
    setEditMode(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const saveTemplate = (type: 'prd' | 'spec') => {
    // TODO: Save to backend
    console.log(`Saving ${type} template:`, templates[type]);
    setEditMode(prev => ({ ...prev, [type]: false }));
    toast({
      title: "Template saved",
      description: `${type.toUpperCase()} template has been updated successfully.`,
    });
  };

  const copyTemplate = (type: 'prd' | 'spec') => {
    navigator.clipboard.writeText(templates[type]);
    toast({
      title: "Template copied",
      description: `${type.toUpperCase()} template copied to clipboard.`,
    });
  };

  const resetTemplate = (type: 'prd' | 'spec') => {
    const defaultTemplate = type === 'prd' ? defaultPRDTemplate : defaultSpecTemplate;
    setTemplates(prev => ({ ...prev, [type]: defaultTemplate }));
    toast({
      title: "Template reset",
      description: `${type.toUpperCase()} template has been reset to default.`,
    });
  };

  const updateTemplate = (type: 'prd' | 'spec', value: string) => {
    setTemplates(prev => ({ ...prev, [type]: value }));
  };

  const renderTemplateEditor = (type: 'prd' | 'spec') => {
    const isEditing = editMode[type];
    const template = templates[type];
    const title = type === 'prd' ? 'PRD Template' : 'Technical Spec Template';
    const icon = type === 'prd' ? FileText : Code;
    const Icon = icon;

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {template.split('\n').length} lines
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyTemplate(type)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => resetTemplate(type)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleEditMode(type)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveTemplate(type)}
                    className="bg-gradient-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleEditMode(type)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          {isEditing ? (
            <Textarea
              value={template}
              onChange={(e) => updateTemplate(type, e.target.value)}
              className="h-full w-full font-mono text-sm resize-none border-0 rounded-none focus:ring-0 focus:ring-offset-0 p-6"
              placeholder={`Enter ${type.toUpperCase()} template...`}
            />
          ) : (
            <div className="h-full overflow-auto p-6">
              <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-4 rounded-lg min-h-full">
                {template}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Document Templates</h1>
        <p className="text-muted-foreground mt-1">
          Customize the templates your AI teammate uses when creating PRDs and technical specifications
        </p>
      </div>

      {/* Templates */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="prd" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 max-w-md flex-shrink-0">
            <TabsTrigger value="prd" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PRD Template
            </TabsTrigger>
            <TabsTrigger value="spec" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Spec Template
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6 overflow-hidden">
            <TabsContent value="prd" className="h-full m-0">
              {renderTemplateEditor('prd')}
            </TabsContent>
            
            <TabsContent value="spec" className="h-full m-0">
              {renderTemplateEditor('spec')}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Help text */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Template Usage</p>
              <p>
                These templates are used by your AI teammate when creating new PRDs and technical specifications. 
                You can use placeholders like [Product Name] and [Feature Name] which will be replaced with actual values. 
                The AI will also adapt the content based on your conversation context.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
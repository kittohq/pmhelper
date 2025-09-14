import { useState } from "react";
import { Calendar, Plus, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/lib/projectStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Roadmap() {
  const { projects, addProject, updateProject } = useProjectStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const quarters = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in-progress": return "bg-primary text-primary-foreground";
      case "planned": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0": return "text-destructive font-bold"; // Critical - Red & Bold
      case "P1": return "text-warning font-semibold";  // High - Orange & Semi-bold  
      case "P2": return "text-primary font-medium";    // Medium - Blue & Medium
      case "P3": return "text-muted-foreground";       // Low - Muted
      default: return "text-muted-foreground";
    }
  };

  const movePriority = (id: string, direction: "up" | "down") => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const currentQuarterIndex = quarters.indexOf(project.quarter);
    let newQuarterIndex;

    if (direction === "up") {
      newQuarterIndex = Math.max(0, currentQuarterIndex - 1);
    } else {
      newQuarterIndex = Math.min(quarters.length - 1, currentQuarterIndex + 1);
    }

    if (newQuarterIndex !== currentQuarterIndex) {
      const newQuarter = quarters[newQuarterIndex];
      updateProject(id, { quarter: newQuarter });
      
      toast({
        title: "Project moved",
        description: `Moved project to ${newQuarter}.`,
      });
    }
  };

  const handleAddInitiative = () => {
    const newProjectId = (projects.length + 1).toString();
    const newProject = {
      name: `New Initiative ${newProjectId}`,
      description: "Enter a brief description for this initiative...",
      type: "feature" as const,
      status: "planning" as const,
      priority: "P2" as const,
      quarter: "Q1 2024",
      prd: `# Product Requirements Document: New Initiative ${newProjectId}

## Problem Statement
Define the problem this initiative aims to solve.

## Objectives
- Primary goal 1
- Primary goal 2
- Primary goal 3

## User Stories
- As a user, I want...
- As a stakeholder, I need...

## Requirements
### Functional Requirements
1. Requirement 1
2. Requirement 2

### Non-Functional Requirements
- Performance targets
- Security requirements
- Scalability needs

## Success Metrics
- Metric 1: [Target]
- Metric 2: [Target]

## Timeline
- Phase 1: Planning
- Phase 2: Development
- Phase 3: Launch`,
      spec: `# Technical Specification: New Initiative ${newProjectId}

## Architecture Overview
High-level technical approach for this initiative.

## Core Components
1. Component 1: Description
2. Component 2: Description
3. Component 3: Description

## API Design
### Endpoints
\`\`\`
GET /api/resource
POST /api/resource
PUT /api/resource/:id
DELETE /api/resource/:id
\`\`\`

## Data Models
\`\`\`typescript
interface InitiativeData {
  id: string;
  name: string;
  status: string;
}
\`\`\`

## Implementation Plan
1. Setup development environment
2. Implement core functionality
3. Add testing suite
4. Deploy to staging
5. Production release`
    };
    
    addProject(newProject);
    navigate(`/project/${newProjectId}`);
    
    toast({
      title: "Initiative created!",
      description: `${newProject.name} has been created successfully.`,
    });
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedProject = projects.find(p => p.id === draggedItem);
    const targetProject = projects.find(p => p.id === targetId);

    if (draggedProject && targetProject && draggedProject.quarter !== targetProject.quarter) {
      updateProject(draggedItem, { quarter: targetProject.quarter });
      toast({
        title: "Project moved",
        description: `Moved project to ${targetProject.quarter}.`,
      });
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Strategic overview of all product initiatives and their timelines
          </p>
        </div>
        <Button className="bg-gradient-primary" onClick={handleAddInitiative}>
          <Plus className="w-4 h-4 mr-2" />
          Add Initiative
        </Button>
      </div>

      {/* Roadmap by Quarters */}
      <div className="grid gap-6">
        {quarters.map((quarter) => {
          const quarterItems = projects.filter(project => project.quarter === quarter);
          
          return (
            <Card key={quarter} className="bg-gradient-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {quarter}
                  </CardTitle>
                  <Badge variant="outline">
                    {quarterItems.length} initiative{quarterItems.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {quarterItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No initiatives planned for this quarter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quarterItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className={`border border-border/50 transition-all duration-200 cursor-move hover:shadow-md ${
                          draggedItem === item.id ? 'opacity-50 scale-95' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">{item.name}</h3>
                                <Badge className={getStatusColor(item.status)} variant="secondary">
                                  {item.status.replace('-', ' ')}
                                </Badge>
                                <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                                  {item.priority}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => movePriority(item.id, "up")}
                                className="h-8 w-8 p-0"
                                disabled={quarters.indexOf(item.quarter) === 0}
                                title="Move to previous quarter"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => movePriority(item.id, "down")}
                                className="h-8 w-8 p-0"
                                disabled={quarters.indexOf(item.quarter) === quarters.length - 1}
                                title="Move to next quarter"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border border-border shadow-md">
                                  <DropdownMenuItem onClick={() => navigate(`/project/${item.id}`)}>
                                    Edit Initiative
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Change Quarter</DropdownMenuItem>
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Delete Initiative
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
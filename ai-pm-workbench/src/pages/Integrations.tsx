import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  ExternalLink, 
  Settings, 
  CheckCircle, 
  Circle,
  Globe,
  Database,
  MessageSquare,
  FileText,
  Calendar,
  Users
} from "lucide-react";

const integrations = [
  {
    name: "Linear MCP",
    description: "Connect to Linear for issue tracking and project management",
    icon: Circle,
    category: "Project Management",
    status: "available",
    color: "bg-blue-500"
  },
  {
    name: "Notion MCP",
    description: "Sync with Notion databases and pages for documentation",
    icon: FileText,
    category: "Documentation",
    status: "available",
    color: "bg-gray-700"
  },
  {
    name: "Composio",
    description: "AI-powered automation and workflow management",
    icon: Zap,
    category: "Automation",
    status: "coming-soon",
    color: "bg-purple-500"
  },
  {
    name: "Slack MCP",
    description: "Send notifications and updates to Slack channels",
    icon: MessageSquare,
    category: "Communication",
    status: "available",
    color: "bg-green-500"
  },
  {
    name: "GitHub MCP",
    description: "Integrate with GitHub repositories and issues",
    icon: Globe,
    category: "Development",
    status: "available",
    color: "bg-gray-900"
  },
  {
    name: "Airtable MCP",
    description: "Connect to Airtable bases and manage data",
    icon: Database,
    category: "Data Management",
    status: "coming-soon",
    color: "bg-orange-500"
  },
  {
    name: "Google Calendar MCP",
    description: "Sync project timelines with Google Calendar",
    icon: Calendar,
    category: "Productivity",
    status: "available",
    color: "bg-red-500"
  },
  {
    name: "Teams MCP",
    description: "Microsoft Teams integration for collaboration",
    icon: Users,
    category: "Communication",
    status: "coming-soon",
    color: "bg-blue-600"
  }
];

const categories = ["All", "Project Management", "Documentation", "Automation", "Communication", "Development", "Data Management", "Productivity"];

export default function Integrations() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect PMPanda with your favorite tools and services via MCP (Model Context Protocol) servers
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "All" ? "default" : "outline"}
            size="sm"
            className="text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                    <integration.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {integration.status === "available" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant={integration.status === "available" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {integration.status === "available" ? "Available" : "Coming Soon"}
                </Badge>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={integration.status !== "available"}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={integration.status !== "available"}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            About MCP Servers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Model Context Protocol (MCP) servers enable PMPanda to securely connect with external tools and services. 
            Each integration runs as a separate server process, providing isolated and secure access to your data.
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Real-time sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Isolated processes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
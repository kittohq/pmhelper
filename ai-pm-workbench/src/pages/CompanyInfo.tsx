import { useState } from "react";
import { Building2, Save, Users, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function CompanyInfo() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    size: "",
    mission: "",
    vision: "",
    targetCustomers: "",
    currentProducts: "",
    keyCompetitors: "",
    uniqueValue: "",
    businessGoals: "",
    technicalStack: "",
    challenges: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend/database
    localStorage.setItem('companyInfo', JSON.stringify(formData));
    toast({
      title: "Company information saved!",
      description: "Your company details have been updated and will help the AI provide better context.",
    });
  };

  // Load saved data on component mount
  useState(() => {
    const savedData = localStorage.getItem('companyInfo');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  });

  return (
    <div className="flex-1 space-y-6 p-6 pb-16 md:pb-6">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Company Information</h2>
        </div>
        <p className="text-muted-foreground">
          Provide details about your company and products to help the AI give you better recommendations and insights.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Tell us about your company's fundamental details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., SaaS, E-commerce, FinTech"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input
                id="size"
                placeholder="e.g., 10-50 employees, Startup, Enterprise"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Mission & Vision
            </CardTitle>
            <CardDescription>
              Your company's purpose and aspirations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea
                id="mission"
                placeholder="What is your company's core purpose and reason for existence?"
                value={formData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vision">Vision Statement</Label>
              <Textarea
                id="vision"
                placeholder="Where do you see your company in the future?"
                value={formData.vision}
                onChange={(e) => handleInputChange('vision', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Target Customers
            </CardTitle>
            <CardDescription>
              Who are your primary customers and users?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetCustomers">Customer Description</Label>
              <Textarea
                id="targetCustomers"
                placeholder="Describe your target customers: demographics, needs, pain points, behaviors..."
                value={formData.targetCustomers}
                onChange={(e) => handleInputChange('targetCustomers', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products & Market */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Products & Market Position
            </CardTitle>
            <CardDescription>
              Your current products and competitive landscape
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentProducts">Current Products/Services</Label>
              <Textarea
                id="currentProducts"
                placeholder="List and describe your existing products or services..."
                value={formData.currentProducts}
                onChange={(e) => handleInputChange('currentProducts', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyCompetitors">Key Competitors</Label>
              <Textarea
                id="keyCompetitors"
                placeholder="Who are your main competitors and how do you differentiate?"
                value={formData.keyCompetitors}
                onChange={(e) => handleInputChange('keyCompetitors', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueValue">Unique Value Proposition</Label>
              <Textarea
                id="uniqueValue"
                placeholder="What makes your company unique? What's your competitive advantage?"
                value={formData.uniqueValue}
                onChange={(e) => handleInputChange('uniqueValue', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals & Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Context</CardTitle>
            <CardDescription>
              Goals, technical stack, and current challenges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessGoals">Business Goals (Next 12 months)</Label>
              <Textarea
                id="businessGoals"
                placeholder="What are your key business objectives and metrics you're trying to achieve?"
                value={formData.businessGoals}
                onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalStack">Technical Stack</Label>
              <Textarea
                id="technicalStack"
                placeholder="What technologies, platforms, and tools does your company use? (e.g., React, AWS, Salesforce...)"
                value={formData.technicalStack}
                onChange={(e) => handleInputChange('technicalStack', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges">Current Challenges</Label>
              <Textarea
                id="challenges"
                placeholder="What are the main challenges or pain points your company is facing?"
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Company Information
        </Button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { User, Building, Mail, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  company: string;
  department: string;
  bio: string;
  preferences: {
    prdTemplate: string;
    specTemplate: string;
    communicationStyle: string;
  };
}

const mockProfileData: ProfileData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@company.com", 
  role: "Senior Product Manager",
  company: "TechCorp Inc",
  department: "Product & Engineering",
  bio: "Experienced product manager with 8+ years building consumer and enterprise software products. Passionate about AI-driven product development and cross-functional collaboration.",
  preferences: {
    prdTemplate: "lean-startup",
    specTemplate: "technical-detailed", 
    communicationStyle: "concise"
  }
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(mockProfileData);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Save profile data
    console.log("Saving profile:", profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: keyof ProfileData['preferences'], value: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and AI assistant preferences
          </p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={isEditing ? "bg-gradient-primary" : ""}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-lg bg-gradient-primary text-white">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-muted-foreground">{profile.role}</p>
              <p className="text-sm text-muted-foreground">{profile.company}</p>
            </div>

            <div className="pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="w-4 h-4" />
                {profile.department}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about your role and experience..."
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Preferences */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>AI Assistant Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure how your AI teammate should interact with you and structure documents
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="prd-template">Preferred PRD Style</Label>
                <Input
                  id="prd-template"
                  value={profile.preferences.prdTemplate}
                  onChange={(e) => handlePreferenceChange('prdTemplate', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., lean-startup, detailed, agile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spec-template">Preferred Spec Style</Label>
                <Input
                  id="spec-template"
                  value={profile.preferences.specTemplate}
                  onChange={(e) => handlePreferenceChange('specTemplate', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., technical-detailed, high-level, visual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="communication-style">Communication Style</Label>
                <Input
                  id="communication-style"
                  value={profile.preferences.communicationStyle}
                  onChange={(e) => handlePreferenceChange('communicationStyle', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., concise, detailed, collaborative"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Save, Download, RefreshCw, ChevronRight, ChevronDown, Sparkles, ChevronUp } from 'lucide-react';
import { useStore } from '../store/appStore';
import { ollamaService } from '../services/ollamaService';
import toast from 'react-hot-toast';
import TemplateSelector from './TemplateSelector';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Toolbar = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToolButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    border-color: #667eea;
  }
`;

const TemplateBadge = styled.button`
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  background: transparent;
  margin-bottom: 1.5rem;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-bottom-color: #667eea;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #e9ecef;
  }
`;

const SectionTitle = styled.div`
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  padding: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PromptsList = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
`;

const PromptItem = styled.div`
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0e8ff;
    transform: translateX(4px);
  }
`;

const SuggestButton = styled.button`
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;

  &:hover {
    background: #5a67d8;
  }
`;

const StatusBar = styled.div`
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  font-size: 0.85rem;
  color: #666;
  display: flex;
  justify-content: space-between;
`;

const MissingAlert = styled.div`
  margin: 1rem 1.5rem;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 0.9rem;
`;

const RequiredBadge = styled.span`
  margin-left: 8px;
  padding: 2px 6px;
  background: #dc3545;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CompleteBadge = styled.span`
  margin-left: 8px;
  padding: 2px 6px;
  background: #28a745;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

function PRDEditor() {
  const { currentPRD, setCurrentPRD, updatePRDSection, documents, savePRDToProject, currentProject } = useStore();
  const [expandedSections, setExpandedSections] = useState(['overview', 'objectives']);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState({});
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  if (!currentPRD) {
    return (
      <Container>
        <Content>
          <p>Loading PRD template...</p>
        </Content>
      </Container>
    );
  }

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(k => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleSectionChange = (sectionKey, value) => {
    updatePRDSection(sectionKey, value);
  };

  const generateSuggestions = async (sectionKey) => {
    setIsGeneratingSuggestions(prev => ({ ...prev, [sectionKey]: true }));
    
    try {
      const section = currentPRD.sections[sectionKey];
      const suggestions = await ollamaService.generatePRDSuggestions(
        section,
        section.content
      );
      
      // Add suggestions to the section content
      const updatedContent = section.content + '\n\n### AI Suggestions:\n' + suggestions;
      updatePRDSection(sectionKey, updatedContent);
      
      toast.success('Suggestions added to section');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const handlePromptClick = (sectionKey, prompt) => {
    const section = currentPRD.sections[sectionKey];
    const currentContent = section.content || '';
    const updatedContent = currentContent + 
      (currentContent ? '\n\n' : '') + 
      `**${prompt}**\n[Your answer here]`;
    updatePRDSection(sectionKey, updatedContent);
  };

  const savePRD = () => {
    if (currentProject) {
      // Save to project
      const saved = savePRDToProject();
      if (saved) {
        toast.success('PRD saved to project');
      } else {
        toast.error('Failed to save PRD to project');
      }
    } else {
      // Export as file if no project
      const prdData = JSON.stringify(currentPRD, null, 2);
      const blob = new Blob([prdData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PRD_${currentPRD.title.replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.click();
      toast.success('PRD exported successfully');
    }
  };

  const exportMarkdown = () => {
    let markdown = `# ${currentPRD.title}\n\n`;
    
    Object.entries(currentPRD.sections).forEach(([key, section]) => {
      markdown += `## ${section.title}\n\n`;
      markdown += section.content || '_To be defined_';
      markdown += '\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${currentPRD.title.replace(/\s+/g, '_')}_${Date.now()}.md`;
    a.click();
    toast.success('PRD exported as Markdown');
  };

  const analyzePRD = async () => {
    try {
      const analysis = await ollamaService.analyzePRD(currentPRD);
      toast.success('Analysis complete - check chat for details');
      // You could also display this in a modal or separate view
    } catch (error) {
      toast.error('Failed to analyze PRD');
    }
  };

  const wordCount = Object.values(currentPRD.sections)
    .reduce((acc, section) => acc + (section.content?.split(/\s+/).length || 0), 0);

  const completedSections = Object.values(currentPRD.sections)
    .filter(section => section.content && section.content.length > 50).length;
  
  // Check if user has made substantial edits (more than just AI-generated content)
  // Consider it "started" only if there's significant content (>100 chars) in any section
  const hasSubstantialContent = Object.values(currentPRD.sections)
    .some(section => section.content && section.content.length > 100);
  
  // Count how many sections have any content
  const filledSectionsCount = Object.values(currentPRD.sections)
    .filter(section => section.content && section.content.trim().length > 0).length;
  
  // Only show warning if user has filled at least 2 sections but is missing required ones
  // This avoids showing the warning for initial AI-generated content
  const missingSections = (hasSubstantialContent && filledSectionsCount >= 2) ? 
    Object.entries(currentPRD.sections)
      .filter(([key, section]) => section.required && (!section.content || section.content.trim().length < 20))
      .map(([key, section]) => section.title) : [];
  
  const isSectionComplete = (section) => {
    return section.content && section.content.length > 20;
  };

  return (
    <Container>
      <Toolbar>
        <ToolButton onClick={savePRD}>
          <Save size={16} />
          Save
        </ToolButton>
        <ToolButton onClick={exportMarkdown}>
          <Download size={16} />
          Export
        </ToolButton>
        <ToolButton onClick={analyzePRD}>
          <RefreshCw size={16} />
          Analyze
        </ToolButton>
        <TemplateBadge onClick={() => setShowTemplateSelector(true)}>
          📋 Template: {currentPRD.templateName || 'Basic PRD'}
          <ChevronUp size={14} />
        </TemplateBadge>
      </Toolbar>

      <Content>
        <TitleInput
          value={currentPRD.title || ''}
          onChange={(e) => setCurrentPRD({ ...currentPRD, title: e.target.value })}
          placeholder="PRD Title..."
        />

        {missingSections.length > 0 && (
          <MissingAlert>
            <strong>⚠️ Missing Required Sections:</strong><br />
            {missingSections.join(', ')}
            <br />
            <small style={{ marginTop: '8px', display: 'block' }}>
              These sections are required for a complete PRD. Please fill them in.
            </small>
          </MissingAlert>
        )}

        {Object.entries(currentPRD.sections).map(([sectionKey, section]) => (
          <Section key={sectionKey}>
            <SectionHeader onClick={() => toggleSection(sectionKey)}>
              <SectionTitle>
                {expandedSections.includes(sectionKey) ? 
                  <ChevronDown size={16} /> : 
                  <ChevronRight size={16} />
                }
                {section.title}
                {section.required && !isSectionComplete(section) && <RequiredBadge>Required</RequiredBadge>}
                {isSectionComplete(section) && <CompleteBadge>✓</CompleteBadge>}
              </SectionTitle>
              <SuggestButton
                onClick={(e) => {
                  e.stopPropagation();
                  generateSuggestions(sectionKey);
                }}
                disabled={isGeneratingSuggestions[sectionKey]}
              >
                <Sparkles size={14} />
                {isGeneratingSuggestions[sectionKey] ? 'Generating...' : 'Suggest'}
              </SuggestButton>
            </SectionHeader>

            {expandedSections.includes(sectionKey) && (
              <SectionContent>
                <TextArea
                  value={section.content || ''}
                  onChange={(e) => handleSectionChange(sectionKey, e.target.value)}
                  placeholder={`Enter ${section.title ? section.title.toLowerCase() : 'section'} details...`}
                />
                
                {section.prompts && section.prompts.length > 0 && (
                  <PromptsList>
                    <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>
                      Click a prompt to add it:
                    </div>
                    {section.prompts.map((prompt, index) => (
                      <PromptItem 
                        key={index}
                        onClick={() => handlePromptClick(sectionKey, prompt)}
                      >
                        {prompt}
                      </PromptItem>
                    ))}
                  </PromptsList>
                )}
              </SectionContent>
            )}
          </Section>
        ))}
      </Content>

      <StatusBar>
        <span>
          {completedSections}/{Object.keys(currentPRD.sections).length} sections • {wordCount} words
        </span>
        <span>
          {documents.length} context documents
        </span>
      </StatusBar>
      
      <TemplateSelector 
        isOpen={showTemplateSelector} 
        onClose={() => setShowTemplateSelector(false)} 
      />
    </Container>
  );
}

export default PRDEditor;
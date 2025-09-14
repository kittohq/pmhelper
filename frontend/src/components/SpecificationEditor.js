import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ChevronDown, ChevronRight, Save, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    border-color: #667eea;
  }
`;

const Content = styled.div`
  padding: 1rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  padding: 0.75rem 1rem;
  background: ${props => props.hasContent ? '#e8f5e9' : '#f5f5f5'};
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${props => props.hasContent ? '#c8e6c9' : '#eeeeee'};
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const SectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequiredBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CompleteBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SectionContent = styled.div`
  padding: 1rem;
`;

const SectionDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PromptsList = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const PromptsTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
`;

const PromptItem = styled.div`
  padding: 0.5rem 0.75rem;
  background: #f0f4ff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #4c51bf;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0e7ff;
  }
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.percentage}%;
`;

function SpecificationEditor({ specification }) {
  const { updateSpecSection, saveSpecToProject } = useStore();
  const [expandedSections, setExpandedSections] = useState(['technicalOverview']);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(k => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleSectionChange = (sectionKey, value) => {
    updateSpecSection(sectionKey, value);
  };

  const handlePromptClick = (sectionKey, prompt) => {
    const section = specification.sections[sectionKey];
    const currentContent = section.content || '';
    const updatedContent = currentContent +
      (currentContent ? '\n\n' : '') +
      `**${prompt}**\n[Your answer here]`;
    updateSpecSection(sectionKey, updatedContent);
  };

  const saveSpecification = () => {
    const saved = saveSpecToProject();
    if (saved) {
      toast.success('Specification saved to project');
    } else {
      toast.error('Failed to save specification');
    }
  };

  const exportSpecification = () => {
    const exportData = {
      ...specification,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spec_${specification.id}_${Date.now()}.json`;
    a.click();
    toast.success('Specification exported successfully');
  };

  // Calculate progress
  const totalSections = Object.keys(specification.sections || {}).length;
  const completedSections = Object.values(specification.sections || {})
    .filter(section => section.content && section.content.length > 50).length;
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  if (!specification || !specification.sections) {
    return (
      <Container>
        <Content>
          <p>No specification loaded. Generate a specification to get started.</p>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Technical Specification</Title>
        <Actions>
          <ActionButton onClick={saveSpecification}>
            <Save size={16} />
            Save
          </ActionButton>
          <ActionButton onClick={exportSpecification}>
            <Download size={16} />
            Export
          </ActionButton>
        </Actions>
      </Header>

      <Content>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              Progress: {completedSections}/{totalSections} sections
            </span>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
        </div>

        {Object.entries(specification.sections).map(([sectionKey, section]) => {
          const isExpanded = expandedSections.includes(sectionKey);
          const hasContent = section.content && section.content.length > 0;
          const isComplete = section.content && section.content.length > 50;

          return (
            <Section key={sectionKey}>
              <SectionHeader
                onClick={() => toggleSection(sectionKey)}
                hasContent={hasContent}
              >
                <SectionTitle>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  {section.title}
                </SectionTitle>
                <SectionStatus>
                  {section.required && !isComplete && (
                    <RequiredBadge>Required</RequiredBadge>
                  )}
                  {isComplete && (
                    <CompleteBadge>
                      <CheckCircle size={14} />
                      Complete
                    </CompleteBadge>
                  )}
                </SectionStatus>
              </SectionHeader>

              {isExpanded && (
                <SectionContent>
                  {section.description && (
                    <SectionDescription>{section.description}</SectionDescription>
                  )}

                  <TextArea
                    value={section.content || ''}
                    onChange={(e) => handleSectionChange(sectionKey, e.target.value)}
                    placeholder={`Enter ${section.title.toLowerCase()} details...`}
                  />

                  {section.prompts && section.prompts.length > 0 && (
                    <PromptsList>
                      <PromptsTitle>Guiding Questions:</PromptsTitle>
                      {section.prompts.map((prompt, idx) => (
                        <PromptItem
                          key={idx}
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
          );
        })}
      </Content>
    </Container>
  );
}

export default SpecificationEditor;
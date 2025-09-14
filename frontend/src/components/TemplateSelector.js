import React, { useState } from 'react';
import styled from '@emotion/styled';
import { X, Check, FileText, Zap, Building2, Rocket, Code, Package } from 'lucide-react';
import { useStore } from '../store/appStore';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const TemplateList = styled.div`
  width: 300px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 16px;
`;

const TemplateCard = styled.div`
  padding: 14px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)' : 'white'};

  &:hover {
    border-color: ${props => props.selected ? '#667eea' : '#999'};
    transform: translateX(4px);
  }
`;

const TemplateIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: ${props => props.selected ? '#667eea' : '#666'};
`;

const TemplateName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #333;
`;

const TemplateDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
`;

const PreviewSection = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentBadge = styled.span`
  background: #4caf50;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
`;

const SectionList = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const SectionItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionNumber = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const SectionContent = styled.div`
  flex: 1;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RequiredBadge = styled.span`
  background: #ff5252;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const SectionPrompts = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: white;
  color: #666;
  border: 1px solid #ddd;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #999;
  }
`;

const ApplyButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const templates = {
  lean: {
    name: 'Lean PRD',
    description: 'Minimalist approach focusing on problem, solution, and metrics',
    icon: <Zap size={20} />,
    sections: ['Problem Statement', 'Proposed Solution', 'Success Metrics', 'Risks & Assumptions']
  },
  agile: {
    name: 'Agile/Scrum PRD',
    description: 'User story focused with acceptance criteria and sprint planning',
    icon: <FileText size={20} />,
    sections: ['Product Vision', 'Epics', 'User Stories', 'Acceptance Criteria', 'Sprint Planning', 'Product Backlog']
  },
  enterprise: {
    name: 'Enterprise PRD',
    description: 'Comprehensive documentation for large-scale products',
    icon: <Building2 size={20} />,
    sections: ['Executive Summary', 'Market Analysis', 'Stakeholder Analysis', 'Detailed Requirements', 'Solution Architecture', 'Implementation Plan', 'Risk Management', 'Cost-Benefit Analysis']
  },
  startup: {
    name: 'Startup PRD',
    description: 'Fast-paced, hypothesis-driven for rapid iteration',
    icon: <Rocket size={20} />,
    sections: ['Core Hypothesis', 'Customer Problem', 'MVP Definition', 'Experiments & Learning', 'Pivot Criteria', 'Growth Strategy']
  },
  technical: {
    name: 'Technical PRD',
    description: 'Engineering-focused with technical specifications',
    icon: <Code size={20} />,
    sections: ['Technical Overview', 'System Design', 'Performance Requirements', 'Infrastructure', 'Security Considerations', 'Testing Strategy', 'Migration Plan']
  },
  amazon: {
    name: 'Amazon Working Backwards',
    description: 'Start with press release and work backwards',
    icon: <Package size={20} />,
    sections: ['Press Release', 'FAQ', 'Customer Experience', 'Working Backwards', 'Tenets']
  }
};

export default function TemplateSelector({ isOpen, onClose }) {
  const { currentPRD, setCurrentPRD } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState(currentPRD?.templateType || 'lean');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleTemplateSelect = async (templateType) => {
    setSelectedTemplate(templateType);
    
    // Fetch template details for preview
    try {
      const templateData = await apiService.getPRDTemplate(templateType);
      setPreviewData(templateData);
    } catch (error) {
      console.error('Failed to fetch template preview:', error);
    }
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate === currentPRD?.templateType) {
      toast.success('This template is already selected');
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const templateData = await apiService.getPRDTemplate(selectedTemplate);
      const template = templates[selectedTemplate];
      
      // Update current PRD with new template
      setCurrentPRD({
        ...currentPRD,
        ...templateData,
        templateType: selectedTemplate,
        templateName: template.name,
        title: currentPRD?.title || 'New Product Requirements Document'
      });
      
      toast.success(`Switched to ${template.name} template`);
      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to apply template');
    } finally {
      setIsLoading(false);
    }
  };

  const currentTemplateType = currentPRD?.templateType || 'lean';

  return isOpen ? (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Select PRD Template</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <TemplateList>
            {Object.entries(templates).map(([key, template]) => (
              <TemplateCard
                key={key}
                selected={selectedTemplate === key}
                onClick={() => handleTemplateSelect(key)}
              >
                <TemplateIcon selected={selectedTemplate === key}>
                  {template.icon}
                  <TemplateName>
                    {template.name}
                    {currentTemplateType === key && <CurrentBadge>CURRENT</CurrentBadge>}
                  </TemplateName>
                </TemplateIcon>
                <TemplateDescription>{template.description}</TemplateDescription>
              </TemplateCard>
            ))}
          </TemplateList>

          <PreviewSection>
            <PreviewTitle>
              Template Preview: {templates[selectedTemplate].name}
            </PreviewTitle>
            
            <SectionList>
              <h4 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
                SECTIONS INCLUDED
              </h4>
              {templates[selectedTemplate].sections.map((section, index) => (
                <SectionItem key={index}>
                  <SectionNumber>{index + 1}</SectionNumber>
                  <SectionContent>
                    <SectionTitle>
                      {section}
                      {index < 4 && <RequiredBadge>REQUIRED</RequiredBadge>}
                    </SectionTitle>
                    {previewData?.sections && (
                      <SectionPrompts>
                        {Object.values(previewData.sections)[index]?.prompts?.slice(0, 2).join(' • ')}
                      </SectionPrompts>
                    )}
                  </SectionContent>
                </SectionItem>
              ))}
            </SectionList>

            {selectedTemplate !== currentTemplateType && (
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '12px',
                marginTop: '16px'
              }}>
                <strong>⚠️ Note:</strong> Switching templates will replace your current PRD structure. 
                Your existing content will be preserved where sections match.
              </div>
            )}
          </PreviewSection>
        </Content>

        <Footer>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <ApplyButton onClick={handleApplyTemplate} disabled={isLoading}>
            <Check size={16} />
            {isLoading ? 'Applying...' : 'Apply Template'}
          </ApplyButton>
        </Footer>
      </Modal>
    </Overlay>
  ) : null;
}
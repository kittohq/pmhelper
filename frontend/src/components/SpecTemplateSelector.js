import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { X, FileCode, Globe, Database, Rocket } from 'lucide-react';
import axios from 'axios';
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
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const TemplateCard = styled.div`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`;

const TemplateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const TemplateTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const TemplateDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const TemplateSections = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SectionBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${props => props.required ? '#fee2e2' : '#e0e7ff'};
  color: ${props => props.required ? '#dc2626' : '#4c51bf'};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }

  &.secondary {
    background: white;
    color: #666;

    &:hover {
      background: #f0f0f0;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const templates = [
  {
    id: 'implementation',
    name: 'Implementation Specification',
    description: 'Standard technical specification for feature development',
    icon: <FileCode size={24} />,
    sections: [
      { name: 'Technical Overview', required: true },
      { name: 'Component Design', required: true },
      { name: 'Data Model', required: true },
      { name: 'API Design', required: true },
      { name: 'Testing Strategy', required: true },
      { name: 'Security', required: true }
    ]
  },
  {
    id: 'system-design',
    name: 'System Design Specification',
    description: 'Comprehensive specification for complex distributed systems',
    icon: <Globe size={24} />,
    sections: [
      { name: 'System Architecture', required: true },
      { name: 'Service Boundaries', required: true },
      { name: 'Data Flow', required: true },
      { name: 'Scalability', required: true },
      { name: 'Reliability', required: true },
      { name: 'Monitoring', required: true }
    ]
  },
  {
    id: 'migration',
    name: 'Migration Specification',
    description: 'Technical specification for migrating or upgrading existing systems',
    icon: <Database size={24} />,
    sections: [
      { name: 'Current State', required: true },
      { name: 'Target Architecture', required: true },
      { name: 'Migration Strategy', required: true },
      { name: 'Data Transformation', required: true },
      { name: 'Rollback Procedures', required: true },
      { name: 'Risk Mitigation', required: true }
    ]
  },
  {
    id: 'api',
    name: 'API Specification',
    description: 'Detailed specification for API-first development',
    icon: <Rocket size={24} />,
    sections: [
      { name: 'API Overview', required: true },
      { name: 'Authentication', required: true },
      { name: 'Endpoints', required: true },
      { name: 'Data Formats', required: true },
      { name: 'Rate Limiting', required: true },
      { name: 'Versioning', required: true }
    ]
  }
];

function SpecTemplateSelector({ onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState('implementation');
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    setLoading(true);
    try {
      // Verify template exists on backend
      const response = await axios.get(
        `http://localhost:3001/api/v1/templates/spec?type=${selectedTemplate}`
      );

      if (response.data) {
        onSelect(selectedTemplate);
        toast.success(`Selected ${response.data.name}`);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Choose Specification Template</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <TemplateGrid>
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                selected={selectedTemplate === template.id}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <TemplateIcon>{template.icon}</TemplateIcon>
                <TemplateTitle>{template.name}</TemplateTitle>
                <TemplateDescription>{template.description}</TemplateDescription>
                <TemplateSections>
                  {template.sections.slice(0, 4).map((section, idx) => (
                    <SectionBadge key={idx} required={section.required}>
                      {section.name}
                    </SectionBadge>
                  ))}
                  {template.sections.length > 4 && (
                    <SectionBadge>+{template.sections.length - 4} more</SectionBadge>
                  )}
                </TemplateSections>
              </TemplateCard>
            ))}
          </TemplateGrid>
        </Content>

        <Footer>
          <Button className="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="primary"
            onClick={handleSelect}
            disabled={!selectedTemplate || loading}
          >
            {loading ? 'Loading...' : 'Use Template'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
}

export default SpecTemplateSelector;
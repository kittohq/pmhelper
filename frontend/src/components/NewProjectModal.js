import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { X, FileText, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Modal = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1d23;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  
  &:hover {
    color: #1a1d23;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TemplateCard = styled.div`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const TemplateTitle = styled.div`
  font-weight: 600;
  color: #1a1d23;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TemplateDescription = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
`;

const TemplateBadge = styled.span`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  background: ${props => {
    switch(props.type) {
      case 'quick': return '#10b981';
      case 'full': return '#6b7280';
      case 'mvp': return '#f59e0b';
      default: return '#667eea';
    }
  }};
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;
  border: none;
  
  &:hover {
    background: #5a67d8;
  }
  
  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #6b7280;
  border: 1px solid #e0e0e0;
  
  &:hover {
    background: #f9fafb;
  }
`;

const templates = [
  {
    id: 'lean',
    name: 'Lean PRD',
    description: 'Minimalist approach with problem, solution, and metrics',
    badge: 'quick',
    sections: 4
  },
  {
    id: 'agile',
    name: 'Agile/Scrum PRD',
    description: 'User stories with acceptance criteria',
    sections: 6
  },
  {
    id: 'startup',
    name: 'Startup PRD',
    description: 'Hypothesis-driven for rapid iteration',
    badge: 'mvp',
    sections: 6
  },
  {
    id: 'amazon',
    name: 'Amazon Working Backwards',
    description: 'Start with press release and FAQ',
    sections: 5
  },
  {
    id: 'technical',
    name: 'Technical PRD',
    description: 'Engineering-focused specifications',
    sections: 7
  },
  {
    id: 'enterprise',
    name: 'Enterprise PRD',
    description: 'Comprehensive documentation for large projects',
    badge: 'full',
    sections: 8
  }
];

function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('lean');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsLoading(true);
    try {
      // Get the template
      const template = await apiService.getPRDTemplate(selectedTemplate);
      
      // Create the project with the template
      const newProject = {
        id: Date.now(),
        title: projectName,
        status: 'draft',
        templateType: selectedTemplate,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        prd: template,
        documents: []
      };
      
      onCreate(newProject);
      toast.success(`Project "${projectName}" created with ${selectedTemplate} template`);
      onClose();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Create New Project</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Input
          type="text"
          placeholder="Enter project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          autoFocus
        />

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            Choose a PRD Template
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
            Select a template that best fits your project style
          </p>
        </div>

        <TemplateGrid>
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              selected={selectedTemplate === template.id}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <TemplateTitle>
                <FileText size={16} />
                {template.name}
                {template.badge && (
                  <TemplateBadge type={template.badge}>
                    {template.badge.toUpperCase()}
                  </TemplateBadge>
                )}
              </TemplateTitle>
              <TemplateDescription>
                {template.description}
                <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                  {template.sections} sections
                </div>
              </TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateGrid>

        <ButtonGroup>
          <SecondaryButton onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton 
            onClick={handleCreate}
            disabled={!projectName.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </PrimaryButton>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
}

export default NewProjectModal;
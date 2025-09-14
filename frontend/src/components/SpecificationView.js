import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FileCode, AlertCircle, ChevronRight, Save, Download, RefreshCw } from 'lucide-react';
import { useStore } from '../store/appStore';
import SpecificationEditor from './SpecificationEditor';
import SpecTemplateSelector from './SpecTemplateSelector';
import toast from 'react-hot-toast';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PRDSelector = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TemplateButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  overflow-y: auto;
`;

const NotesSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const NotesLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? '#667eea' : 'white'};
  color: ${props => props.primary ? 'white' : '#667eea'};
  border: 1px solid #667eea;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? '#5a67d8' : '#f0f4ff'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoAlert = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  svg {
    flex-shrink: 0;
    color: #f59e0b;
  }
`;

const AlertText = styled.div`
  flex: 1;
  color: #92400e;
  font-size: 0.9rem;
  line-height: 1.5;
`;

function SpecificationView() {
  const {
    projects,
    currentProject,
    currentPRD,
    currentSpec,
    currentSpecTemplate,
    engineeringNotes,
    setEngineeringNotes,
    createSpecification,
    setCurrentSpec,
    setSpecTemplate
  } = useStore();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Get projects with completed PRDs
  const projectsWithPRD = projects.filter(p => p.prd && Object.keys(p.prd.sections || {}).length > 0);

  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    if (project) {
      useStore.getState().setCurrentProject(project);
      // Check if project has a specification
      const spec = useStore.getState().specifications.find(s => s.prdId === project.id);
      if (spec) {
        setCurrentSpec(spec);
      } else {
        setCurrentSpec(null);
      }
    }
  };

  const handleAssessReadiness = async () => {
    if (!currentPRD) {
      toast.error('Please select a project with a PRD first');
      return;
    }

    setIsAssessing(true);
    try {
      const response = await axios.post('http://localhost:3001/api/v1/specs/assess', {
        prd: currentPRD,
        engineeringNotes,
        templateType: currentSpecTemplate
      });

      setAssessmentResult(response.data);

      if (response.data.sufficient) {
        toast.success('Ready to generate specification!');
      } else {
        toast.warning('Need more information for complete specification');
      }
    } catch (error) {
      console.error('Assessment error:', error);
      toast.error('Failed to assess specification readiness');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleGenerateSpecification = async () => {
    if (!currentPRD) {
      toast.error('Please select a project with a PRD first');
      return;
    }

    setIsGenerating(true);
    try {
      // First, load the template
      const templateResponse = await axios.get(
        `http://localhost:3001/api/v1/templates/spec?type=${currentSpecTemplate}`
      );
      const template = templateResponse.data;

      // Create specification with template structure
      const spec = createSpecification(currentProject.id, currentSpecTemplate);

      // Initialize spec with template sections
      const updatedSpec = {
        ...spec,
        sections: template.sections,
        templateName: template.name
      };
      setCurrentSpec(updatedSpec);

      // Generate content for each section using Ollama
      const systemPrompt = `You are a Senior Technical Architect creating a detailed technical specification.
Transform the PRD into concrete technical implementation plans.

PRD Content:
${JSON.stringify(currentPRD, null, 2)}

Engineering Notes:
${engineeringNotes || 'None provided'}

Template: ${template.name}`;

      // Use the chat view's existing Ollama integration
      const message = `Generate a complete technical specification for this PRD. Include specific technologies, architecture decisions, and implementation details.`;

      // Trigger generation through the chat interface
      // For now, just show success message
      toast.success('Specification template loaded. Use the chat to generate content.');

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate specification');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <FileCode size={24} />
          Technical Specification
        </HeaderTitle>

        <PRDSelector
          value={currentProject?.id || ''}
          onChange={(e) => handleProjectSelect(e.target.value)}
        >
          <option value="">Select a project with PRD...</option>
          {projectsWithPRD.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.prd?.title || 'Untitled PRD'}
            </option>
          ))}
        </PRDSelector>

        <TemplateButton onClick={() => setShowTemplateSelector(true)}>
          Template: {currentSpecTemplate}
        </TemplateButton>
      </Header>

      <ContentArea>
        {!currentPRD ? (
          <InfoAlert>
            <AlertCircle size={20} />
            <AlertText>
              Please select a project with a completed PRD to generate a technical specification.
            </AlertText>
          </InfoAlert>
        ) : (
          <>
            <NotesSection>
              <NotesLabel>Engineering Manager Notes & Technical Constraints</NotesLabel>
              <NotesTextarea
                value={engineeringNotes}
                onChange={(e) => setEngineeringNotes(e.target.value)}
                placeholder="Add any technical constraints, team capabilities, technology preferences, performance requirements, security considerations, etc."
              />

              <ActionButtons>
                <ActionButton onClick={handleAssessReadiness} disabled={isAssessing}>
                  {isAssessing ? 'Assessing...' : 'Assess Readiness'}
                </ActionButton>

                <ActionButton
                  primary
                  onClick={handleGenerateSpecification}
                  disabled={isGenerating || !assessmentResult?.sufficient}
                >
                  <RefreshCw size={16} />
                  {isGenerating ? 'Generating...' : 'Generate Specification'}
                </ActionButton>
              </ActionButtons>

              {assessmentResult && !assessmentResult.sufficient && (
                <InfoAlert style={{ marginTop: '1rem' }}>
                  <AlertCircle size={20} />
                  <AlertText>
                    <strong>Missing Information:</strong>
                    <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                      {assessmentResult.missingAreas?.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </AlertText>
                </InfoAlert>
              )}
            </NotesSection>

            {currentSpec && (
              <SpecificationEditor specification={currentSpec} />
            )}
          </>
        )}
      </ContentArea>

      {showTemplateSelector && (
        <SpecTemplateSelector
          onSelect={(template) => {
            setSpecTemplate(template);
            setShowTemplateSelector(false);
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </Container>
  );
}

export default SpecificationView;
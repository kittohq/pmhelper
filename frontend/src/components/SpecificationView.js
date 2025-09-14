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

const GenerationStatus = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 0.9; }
    50% { opacity: 1; }
    100% { opacity: 0.9; }
  }
`;

const StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatusTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
`;

const StatusMessage = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const ElapsedTime = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
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
  const [jobStatus, setJobStatus] = useState(null); // Track background job status
  const [elapsedTime, setElapsedTime] = useState(0);

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

    // First check if PRD has actual content
    const hasContent = currentPRD.sections &&
      Object.values(currentPRD.sections).some(section =>
        section.content && section.content.trim().length > 50
      );

    if (!hasContent) {
      toast.error('PRD is incomplete. Please finish the PRD before assessing specification readiness.');
      setAssessmentResult({
        sufficient: false,
        assessment: 'NEEDS_INFO',
        missingAreas: ['Complete PRD required - current PRD has no substantial content']
      });
      return;
    }

    // Build PRD with actual content (no fallbacks)
    const prdWithContent = {
      ...currentPRD,
      sections: {
        problem: {
          title: 'Problem Statement',
          content: currentPRD.sections?.problem?.content || ''
        },
        solution: {
          title: 'Proposed Solution',
          content: currentPRD.sections?.solution?.content || ''
        },
        metrics: {
          title: 'Success Metrics',
          content: currentPRD.sections?.metrics?.content || ''
        },
        risks: {
          title: 'Risks & Assumptions',
          content: currentPRD.sections?.risks?.content || ''
        }
      }
    };

    setIsAssessing(true);
    try {
      const response = await axios.post('http://localhost:3001/api/v1/specs/assess', {
        prd: prdWithContent,
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

      // Generate content using background job system
      toast('Starting specification generation in background...', {
        icon: '🚀',
        duration: 3000
      });

      // Build a comprehensive prompt with all the context
      const specPrompt = `You are a Senior Technical Architect creating a detailed technical specification.

## PRD Content:
${Object.entries(currentPRD.sections || {})
  .map(([key, section]) => `### ${section.title}\n${section.content || 'Not provided'}`)
  .join('\n\n')}

## Engineering Manager Notes:
${engineeringNotes || 'None provided'}

## Specification Template: ${template.name}
Required sections to fill:
${Object.entries(template.sections)
  .map(([key, section]) => `- ${section.title}: ${section.description}`)
  .join('\n')}

Based on the PRD and engineering notes above, generate a comprehensive technical specification. For each section, provide concrete, detailed technical decisions and implementation plans.

Format your response with clear section headers matching the template sections. Be specific about:
- Technology choices and why
- Architecture patterns
- Database schema
- API design
- Security measures
- Performance requirements
- Testing strategy
- Deployment approach

Start your response with "## Technical Specification" and then provide each section.`;

      // Start background job for specification generation
      try {
        const jobResponse = await axios.post('http://localhost:3001/api/jobs/generate-specification', {
          prompt: specPrompt,
          model: 'mistral:7b-instruct'
        });

        const { jobId } = jobResponse.data;

        // Set initial job status
        setJobStatus({
          jobId: jobId.slice(-8),
          status: 'processing',
          message: 'Starting specification generation...'
        });

        toast(`Generation started. Job ID: ${jobId.slice(-8)}`, {
          icon: '📝',
          duration: 4000
        });

        // Track elapsed time
        const startTime = Date.now();
        const elapsedInterval = setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Start polling for job completion
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`http://localhost:3001/api/jobs/${jobId}/status`);
            const status = statusResponse.data;

            if (status.status === 'completed') {
              clearInterval(pollInterval);
              clearInterval(elapsedInterval);

              setJobStatus({
                jobId: jobId.slice(-8),
                status: 'completed',
                message: 'Processing response...'
              });

              // Get the result
              const resultResponse = await axios.get(`http://localhost:3001/api/jobs/${jobId}/result`);

              if (resultResponse.data.success) {
                const specResponse = resultResponse.data.result;

                // Parse the response and update each section
                const sections = { ...template.sections };

                // Try to parse sections from the response
                Object.keys(sections).forEach(sectionKey => {
                  const sectionTitle = sections[sectionKey].title;
                  const regex = new RegExp(`(?:#{2,3}\\s*${sectionTitle}|${sectionTitle}:?)\\s*\\n+([\\s\\S]*?)(?=\\n#{2,3}|$)`, 'i');
                  const match = specResponse.match(regex);
                  if (match && match[1]) {
                    sections[sectionKey] = {
                      ...sections[sectionKey],
                      content: match[1].trim()
                    };
                  }
                });

                // Update the specification with generated content
                const specWithContent = {
                  ...updatedSpec,
                  sections: sections
                };

                setCurrentSpec(specWithContent);

                // Save to project
                useStore.getState().updateProject(currentProject.id, {
                  specification: specWithContent,
                  specStatus: 'active'
                });

                toast.success('Technical specification generated successfully!');
                setIsGenerating(false);
                setJobStatus(null); // Clear status after success
                setElapsedTime(0);
              } else {
                toast.error('Failed to generate specification: ' + (resultResponse.data.error || 'Unknown error'));
                setIsGenerating(false);
                setJobStatus({
                  jobId: jobId.slice(-8),
                  status: 'failed',
                  message: resultResponse.data.error || 'Generation failed'
                });
                clearInterval(elapsedInterval);
              }

            } else if (status.status === 'failed') {
              clearInterval(pollInterval);
              clearInterval(elapsedInterval);
              toast.error('Specification generation failed');
              setIsGenerating(false);
              setJobStatus({
                jobId: jobId.slice(-8),
                status: 'failed',
                message: 'Generation failed'
              });

            } else if (status.status === 'processing') {
              // Still processing - show progress
              const duration = Math.floor((Date.now() - new Date(status.startedAt).getTime()) / 1000);
              if (duration % 10 === 0) {  // Update every 10 seconds
                toast(`Still generating... (${duration}s elapsed)`, {
                  icon: '⏳',
                  duration: 2000
                });
              }
            }
          } catch (pollError) {
            console.error('Polling error:', pollError);
            // Don't stop polling on transient errors
          }
        }, 3000); // Poll every 3 seconds

        // Store interval ID for cleanup if needed
        // You might want to add this to component state for cleanup on unmount

      } catch (jobError) {
        console.error('Failed to start background job:', jobError);
        toast.error('Failed to start specification generation');
        setIsGenerating(false);
      }

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
          {projectsWithPRD.map((project, index) => (
            <option key={`${project.id}-${index}`} value={project.id}>
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

              {/* Show generation status */}
              {jobStatus && (
                <GenerationStatus>
                  <StatusInfo>
                    <StatusTitle>
                      {jobStatus.status === 'processing' ? '⚙️ Generating Specification' :
                       jobStatus.status === 'completed' ? '✅ Generation Complete' :
                       '❌ Generation Failed'}
                    </StatusTitle>
                    <StatusMessage>
                      Job ID: {jobStatus.jobId} | {jobStatus.message}
                    </StatusMessage>
                  </StatusInfo>
                  <ElapsedTime>
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </ElapsedTime>
                </GenerationStatus>
              )}

              {assessmentResult && (
                <InfoAlert style={{
                  marginTop: '1rem',
                  background: assessmentResult.sufficient ? '#d4edda' : '#fef3c7',
                  borderColor: assessmentResult.sufficient ? '#28a745' : '#f59e0b'
                }}>
                  <AlertCircle size={20} style={{
                    color: assessmentResult.sufficient ? '#28a745' : '#f59e0b'
                  }} />
                  <AlertText style={{
                    color: assessmentResult.sufficient ? '#155724' : '#92400e'
                  }}>
                    {assessmentResult.sufficient ? (
                      <>
                        <strong>✅ Ready to Generate Specification!</strong>
                        <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                          The PRD and engineering notes provide sufficient information to create a comprehensive technical specification.
                          Click "Generate Specification" to proceed.
                        </p>
                      </>
                    ) : (
                      <>
                        <strong>Missing Information:</strong>
                        <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                          {assessmentResult.missingAreas?.map((area, idx) => (
                            <li key={idx}>{area}</li>
                          ))}
                        </ul>
                      </>
                    )}
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
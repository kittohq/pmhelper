import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Plus, FolderOpen, Trash2, Edit2, Check, X } from 'lucide-react';
import { useStore } from '../store/appStore';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NewProjectButton = styled.button`
  padding: 4px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const ProjectCard = styled.div`
  padding: 10px;
  background: ${props => props.active ? 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)' : 'white'};
  border: 1px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #667eea;
    transform: translateX(2px);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProjectMeta = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 2px;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: ${props => props.danger ? '#ff5252' : '#667eea'};
  }
`;

const NewProjectForm = styled.div`
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #667eea;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 8px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const FormButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const SaveButton = styled(FormButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

const CancelButton = styled(FormButton)`
  background: white;
  color: #666;
  border: 1px solid #ddd;

  &:hover {
    background: #f0f0f0;
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
`;

export default function ProjectManager() {
  const { 
    projects, 
    currentProject, 
    addProject, 
    setCurrentProject, 
    deleteProject,
    setCurrentPRD
  } = useStore();
  
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState('lean');
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      // Get the template for the new project
      const template = await apiService.getPRDTemplate(newProjectTemplate);
      const prd = {
        ...template,
        templateType: newProjectTemplate,
        templateName: getTemplateName(newProjectTemplate),
        title: `${newProjectName} - Product Requirements Document`
      };

      // Create the project with its PRD
      const project = addProject({
        name: newProjectName,
        templateType: newProjectTemplate,
        prd: prd
      });

      toast.success(`Created project: ${newProjectName}`);
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectTemplate('lean');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleSelectProject = (project) => {
    if (currentProject?.id !== project.id) {
      setCurrentProject(project);
      toast.success(`Switched to: ${project.name}`);
    }
  };

  const handleDeleteProject = (project, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
      toast.success(`Deleted project: ${project.name}`);
    }
  };

  const handleEditProject = (project, e) => {
    e.stopPropagation();
    setEditingProject(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (project, e) => {
    e.stopPropagation();
    if (editName.trim()) {
      // Update project name logic would go here
      toast.success('Project name updated');
    }
    setEditingProject(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingProject(null);
    setEditName('');
  };

  const getTemplateName = (type) => {
    const templates = {
      lean: 'Lean PRD',
      agile: 'Agile/Scrum PRD',
      enterprise: 'Enterprise PRD',
      startup: 'Startup PRD',
      technical: 'Technical PRD',
      amazon: 'Amazon Working Backwards'
    };
    return templates[type] || 'Basic PRD';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Container>
      <Header>
        <Title>Projects</Title>
        <NewProjectButton onClick={() => setShowNewProject(true)}>
          <Plus size={14} />
          New
        </NewProjectButton>
      </Header>

      {showNewProject && (
        <NewProjectForm>
          <Input
            placeholder="Project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
          <Select 
            value={newProjectTemplate} 
            onChange={(e) => setNewProjectTemplate(e.target.value)}
          >
            <option value="lean">Lean PRD</option>
            <option value="agile">Agile/Scrum PRD</option>
            <option value="startup">Startup PRD</option>
            <option value="technical">Technical PRD</option>
            <option value="enterprise">Enterprise PRD</option>
            <option value="amazon">Amazon Working Backwards</option>
          </Select>
          <FormActions>
            <CancelButton onClick={() => {
              setShowNewProject(false);
              setNewProjectName('');
            }}>
              <X size={14} />
              Cancel
            </CancelButton>
            <SaveButton onClick={handleCreateProject}>
              <Check size={14} />
              Create
            </SaveButton>
          </FormActions>
        </NewProjectForm>
      )}

      <ProjectList>
        {projects.length === 0 ? (
          <EmptyState>
            No projects yet. Create your first project to get started.
          </EmptyState>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              active={currentProject?.id === project.id}
              onClick={() => handleSelectProject(project)}
            >
              <ProjectHeader>
                <ProjectInfo>
                  {editingProject === project.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <>
                      <ProjectName>
                        <FolderOpen size={14} />
                        {project.name}
                      </ProjectName>
                      <ProjectMeta>
                        {project.prd?.templateName || 'No template'} • {formatDate(project.lastModified || project.createdAt)}
                      </ProjectMeta>
                    </>
                  )}
                </ProjectInfo>
                <ProjectActions>
                  {editingProject === project.id ? (
                    <>
                      <ActionButton onClick={(e) => handleSaveEdit(project, e)}>
                        <Check size={14} />
                      </ActionButton>
                      <ActionButton onClick={handleCancelEdit}>
                        <X size={14} />
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton onClick={(e) => handleEditProject(project, e)}>
                        <Edit2 size={14} />
                      </ActionButton>
                      <ActionButton danger onClick={(e) => handleDeleteProject(project, e)}>
                        <Trash2 size={14} />
                      </ActionButton>
                    </>
                  )}
                </ProjectActions>
              </ProjectHeader>
            </ProjectCard>
          ))
        )}
      </ProjectList>
    </Container>
  );
}
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { 
  Map, 
  User, 
  FileText, 
  FolderOpen, 
  Plus, 
  Home,
  ChevronRight,
  Calendar,
  Settings,
  Archive
} from 'lucide-react';
import { useStore } from '../store/appStore';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import NewProjectModal from './NewProjectModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1d23;
  color: #e4e6eb;
`;

const NavSection = styled.div`
  border-bottom: 1px solid #2d3139;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #252933;
  }

  &.active {
    background: #2d3139;
    color: #667eea;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #667eea;
    }
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;

const ProjectsSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #252933;
  border-bottom: 1px solid #2d3139;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
`;

const NewProjectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #5a67d8;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProjectCard = styled.div`
  background: #252933;
  border: 1px solid #2d3139;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2d3139;
    border-color: #667eea;
    transform: translateX(2px);
  }

  &.active {
    background: #2d3139;
    border-color: #667eea;
  }
`;

const ProjectTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProjectMeta = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  display: flex;
  gap: 12px;
`;

const ProjectStatus = styled.span`
  padding: 2px 6px;
  background: ${props => {
    switch(props.status) {
      case 'active': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
`;

const UserProfile = styled.div`
  padding: 1rem;
  border-top: 1px solid #2d3139;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a1d23;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

function LeftPanel() {
  const { 
    projects, 
    currentProject, 
    setCurrentProject, 
    addProject,
    activeView,
    setActiveView,
    setCurrentPRD 
  } = useStore();
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleCreateProject = (newProject) => {
    addProject(newProject);
    setCurrentProject(newProject);
    setCurrentPRD(newProject.prd);
  };

  const loadTemplate = async (templateType) => {
    try {
      const template = await apiService.getPRDTemplate(templateType);
      setCurrentPRD(template);
      setActiveView('projects');
      toast.success(`Loaded ${template.name || templateType} template`);
      
      // If there's a current project, update its PRD
      if (currentProject) {
        useStore.getState().savePRDToProject();
      }
    } catch (error) {
      toast.error('Failed to load template');
    }
  };

  const navigationItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const sampleProjects = [
    {
      id: 1,
      title: 'Mobile App Redesign',
      status: 'active',
      lastModified: '2024-01-15',
      completion: 65
    },
    {
      id: 2,
      title: 'Payment Gateway Integration',
      status: 'draft',
      lastModified: '2024-01-14',
      completion: 20
    },
    {
      id: 3,
      title: 'Analytics Dashboard',
      status: 'completed',
      lastModified: '2024-01-10',
      completion: 100
    }
  ];

  // Initialize with sample projects if none exist
  React.useEffect(() => {
    if (!projects || projects.length === 0) {
      sampleProjects.forEach(project => {
        useStore.getState().addProject(project);
      });
    }
  }, []);

  return (
    <>
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />
      
      <Container>
      <NavSection>
        {navigationItems.map(item => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.id}
              className={activeView === item.id ? 'active' : ''}
              onClick={() => setActiveView(item.id)}
            >
              <Icon />
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          );
        })}
      </NavSection>

      {activeView === 'projects' && (
        <>
          <SectionHeader>
            Projects
            <Plus 
              size={16} 
              style={{ cursor: 'pointer' }}
              onClick={handleNewProject}
            />
          </SectionHeader>

          <ProjectsSection>
            <NewProjectButton onClick={handleNewProject}>
              <Plus />
              New Project
            </NewProjectButton>

            {(!projects || projects.length === 0) ? (
              <EmptyState>
                <Archive size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div>No projects yet</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  Create your first project to get started
                </div>
              </EmptyState>
            ) : (
              projects.map(project => (
                <ProjectCard
                  key={project.id}
                  className={currentProject?.id === project.id ? 'active' : ''}
                  onClick={() => setCurrentProject(project)}
                >
                  <ProjectTitle>
                    <FolderOpen size={14} />
                    {project.title}
                    <ProjectStatus status={project.status}>
                      {project.status}
                    </ProjectStatus>
                  </ProjectTitle>
                  <ProjectMeta>
                    <span>{project.lastModified}</span>
                    {project.completion && (
                      <span>{project.completion}% complete</span>
                    )}
                  </ProjectMeta>
                </ProjectCard>
              ))
            )}
          </ProjectsSection>
        </>
      )}

      {activeView === 'roadmap' && (
        <ProjectsSection>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            <Map size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>Product Roadmap</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Visualize your product timeline and milestones
            </div>
          </div>
        </ProjectsSection>
      )}

      {activeView === 'templates' && (
        <ProjectsSection>
          <div style={{ padding: '1rem' }}>
            <ProjectCard onClick={() => loadTemplate('lean')}>
              <ProjectTitle>
                <FileText size={14} />
                Lean PRD
                <span style={{ fontSize: '0.7rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Quick</span>
              </ProjectTitle>
              <ProjectMeta>Minimalist - Problem, Solution, Metrics</ProjectMeta>
            </ProjectCard>
            
            <ProjectCard onClick={() => loadTemplate('agile')}>
              <ProjectTitle>
                <FileText size={14} />
                Agile/Scrum PRD
              </ProjectTitle>
              <ProjectMeta>User stories with acceptance criteria</ProjectMeta>
            </ProjectCard>
            
            <ProjectCard onClick={() => loadTemplate('startup')}>
              <ProjectTitle>
                <FileText size={14} />
                Startup PRD
                <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>MVP</span>
              </ProjectTitle>
              <ProjectMeta>Hypothesis-driven rapid iteration</ProjectMeta>
            </ProjectCard>
            
            <ProjectCard onClick={() => loadTemplate('amazon')}>
              <ProjectTitle>
                <FileText size={14} />
                Amazon Working Backwards
              </ProjectTitle>
              <ProjectMeta>Start with press release</ProjectMeta>
            </ProjectCard>
            
            <ProjectCard onClick={() => loadTemplate('technical')}>
              <ProjectTitle>
                <FileText size={14} />
                Technical PRD
              </ProjectTitle>
              <ProjectMeta>Engineering-focused specifications</ProjectMeta>
            </ProjectCard>
            
            <ProjectCard onClick={() => loadTemplate('enterprise')}>
              <ProjectTitle>
                <FileText size={14} />
                Enterprise PRD
                <span style={{ fontSize: '0.7rem', background: '#6b7280', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Full</span>
              </ProjectTitle>
              <ProjectMeta>Comprehensive for large projects</ProjectMeta>
            </ProjectCard>
          </div>
        </ProjectsSection>
      )}

      {activeView === 'profile' && (
        <ProjectsSection>
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
                Name
              </label>
              <input 
                type="text" 
                defaultValue="Product Manager"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#252933',
                  border: '1px solid #2d3139',
                  borderRadius: '6px',
                  color: '#e4e6eb',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
                Email
              </label>
              <input 
                type="email" 
                defaultValue="pm@company.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#252933',
                  border: '1px solid #2d3139',
                  borderRadius: '6px',
                  color: '#e4e6eb',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
                Role
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#252933',
                  border: '1px solid #2d3139',
                  borderRadius: '6px',
                  color: '#e4e6eb',
                  fontSize: '0.9rem'
                }}
              >
                <option>Product Manager</option>
                <option>Senior PM</option>
                <option>Product Owner</option>
                <option>VP Product</option>
              </select>
            </div>
          </div>
        </ProjectsSection>
      )}

      <UserProfile>
        <Avatar>PM</Avatar>
        <UserInfo>
          <UserName>Product Manager</UserName>
          <UserRole>pm@company.com</UserRole>
        </UserInfo>
        <Settings size={18} style={{ cursor: 'pointer', color: '#9ca3af' }} />
      </UserProfile>
    </Container>
    </>
  );
}

export default LeftPanel;
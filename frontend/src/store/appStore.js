import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Projects management
      projects: [],
      currentProject: null,
      addProject: (project) => {
        const newProject = { 
          id: Date.now(), 
          ...project,
          prd: project.prd || null,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          currentPRD: newProject.prd
        }));
        return newProject;
      },
      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, ...updates, lastModified: new Date().toISOString() }
            : p
        )
      })),
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        currentPRD: state.currentProject?.id === projectId ? null : state.currentPRD
      })),
      setCurrentProject: (project) => set({ 
        currentProject: project,
        currentPRD: project?.prd || null
      }),
      selectProject: (projectId) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          set({ 
            currentProject: project,
            currentPRD: project.prd || null
          });
        }
      },
      createProject: (name) => {
        const state = get();
        return state.addProject({ name });
      },

      // Documents for context
      documents: [],
      addDocument: (doc) => set((state) => ({
        documents: [...state.documents, { 
          id: Date.now(), 
          ...doc,
          addedAt: new Date().toISOString()
        }]
      })),
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter(d => d.id !== id)
      })),
      clearDocuments: () => set({ documents: [] }),

      // Chat messages
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message
        }]
      })),
      clearMessages: () => set({ messages: [] }),

      // Current PRD being edited
      currentPRD: null,
      setCurrentPRD: (prd) => set({ currentPRD: prd }),
      updatePRDSection: (sectionKey, content) => set((state) => ({
        currentPRD: {
          ...state.currentPRD,
          sections: {
            ...state.currentPRD.sections,
            [sectionKey]: {
              ...state.currentPRD.sections[sectionKey],
              content
            }
          }
        }
      })),
      savePRDToProject: () => {
        const state = get();
        if (state.currentProject && state.currentPRD) {
          state.updateProject(state.currentProject.id, {
            prd: state.currentPRD,
            status: 'active'
          });
          return true;
        }
        return false;
      },

      // Specification management
      specifications: [],
      currentSpec: null,
      currentSpecTemplate: 'implementation',
      engineeringNotes: '',

      setCurrentSpec: (spec) => set({ currentSpec: spec }),
      setSpecTemplate: (template) => set({ currentSpecTemplate: template }),
      setEngineeringNotes: (notes) => set({ engineeringNotes: notes }),

      createSpecification: (prdId, templateType = 'implementation') => {
        const state = get();
        const newSpec = {
          id: Date.now(),
          prdId,
          templateType,
          engineeringNotes: state.engineeringNotes || '',
          sections: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          specifications: [...state.specifications, newSpec],
          currentSpec: newSpec
        }));
        return newSpec;
      },

      updateSpecSection: (sectionKey, content) => set((state) => ({
        currentSpec: state.currentSpec ? {
          ...state.currentSpec,
          sections: {
            ...state.currentSpec.sections,
            [sectionKey]: {
              ...state.currentSpec.sections[sectionKey],
              content,
              updatedAt: new Date().toISOString()
            }
          },
          updatedAt: new Date().toISOString()
        } : null
      })),

      saveSpecToProject: () => {
        const state = get();
        if (state.currentProject && state.currentSpec) {
          state.updateProject(state.currentProject.id, {
            specification: state.currentSpec,
            specStatus: 'active'
          });
          return true;
        }
        return false;
      },

      // UI state
      activeView: 'chat',
      setActiveView: (view) => set({ activeView: view }),
      activeSection: 'overview',
      setActiveSection: (section) => set({ activeSection: section }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'pmhelper-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        currentPRD: state.currentPRD,
        specifications: state.specifications,
        currentSpec: state.currentSpec,
        engineeringNotes: state.engineeringNotes
      })
    }
  )
);
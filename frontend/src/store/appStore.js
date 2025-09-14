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

      // UI state
      activeView: 'projects',
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
        currentProject: state.currentProject
      })
    }
  )
);
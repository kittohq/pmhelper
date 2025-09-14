import { renderHook, act } from '@testing-library/react';
import { useStore } from './appStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('appStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('PRD Management', () => {
    test('sets current PRD', () => {
      const { result } = renderHook(() => useStore());
      
      const newPRD = {
        title: 'Test PRD',
        sections: {
          problem: { title: 'Problem', content: 'Test problem' }
        }
      };

      act(() => {
        result.current.setCurrentPRD(newPRD);
      });

      expect(result.current.currentPRD).toEqual(newPRD);
    });

    test('updates PRD section', () => {
      const { result } = renderHook(() => useStore());
      
      // Set initial PRD
      act(() => {
        result.current.setCurrentPRD({
          title: 'Test PRD',
          sections: {
            problem: { title: 'Problem', content: '' },
            solution: { title: 'Solution', content: '' }
          }
        });
      });

      // Update a section
      act(() => {
        result.current.updatePRDSection('problem', 'Updated problem content');
      });

      expect(result.current.currentPRD.sections.problem.content).toBe('Updated problem content');
      expect(result.current.currentPRD.sections.solution.content).toBe('');
    });

    test('handles updating non-existent section gracefully', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.setCurrentPRD({
          title: 'Test PRD',
          sections: {
            problem: { title: 'Problem', content: '' }
          }
        });
      });

      // Try to update non-existent section
      act(() => {
        result.current.updatePRDSection('nonexistent', 'Content');
      });

      // Should not throw and PRD should remain unchanged
      expect(result.current.currentPRD.sections.problem.content).toBe('');
    });
  });

  describe('Project Management', () => {
    test('creates new project', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.createProject('New Project');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('New Project');
      expect(result.current.currentProject).toBe(result.current.projects[0]);
    });

    test('selects project', () => {
      const { result } = renderHook(() => useStore());
      
      // Create two projects
      act(() => {
        result.current.createProject('Project 1');
        result.current.createProject('Project 2');
      });

      const firstProject = result.current.projects[0];
      
      // Select first project
      act(() => {
        result.current.selectProject(firstProject.id);
      });

      expect(result.current.currentProject).toBe(firstProject);
    });

    test('deletes project', () => {
      const { result } = renderHook(() => useStore());
      
      // Create projects
      act(() => {
        result.current.createProject('Project 1');
        result.current.createProject('Project 2');
      });

      const projectToDelete = result.current.projects[0];
      
      // Delete first project
      act(() => {
        result.current.deleteProject(projectToDelete.id);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('Project 2');
    });

    test('saves PRD to current project', () => {
      const { result } = renderHook(() => useStore());
      
      // Create project and set PRD
      act(() => {
        result.current.createProject('Test Project');
        result.current.setCurrentPRD({
          title: 'Test PRD',
          sections: { problem: { content: 'Test' } }
        });
      });

      // Save PRD to project
      act(() => {
        result.current.savePRDToProject();
      });

      expect(result.current.currentProject.prd).toEqual(result.current.currentPRD);
    });

    test('returns false when saving PRD without current project', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.setCurrentPRD({ title: 'Test PRD' });
      });

      let saveResult;
      act(() => {
        saveResult = result.current.savePRDToProject();
      });

      expect(saveResult).toBe(false);
    });
  });

  describe('Document Management', () => {
    test('adds document', () => {
      const { result } = renderHook(() => useStore());
      
      const newDoc = {
        id: '1',
        name: 'test.pdf',
        content: 'Test content'
      };

      act(() => {
        result.current.addDocument(newDoc);
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0]).toEqual(newDoc);
    });

    test('removes document', () => {
      const { result } = renderHook(() => useStore());
      
      // Add documents
      act(() => {
        result.current.addDocument({ id: '1', name: 'doc1.pdf' });
        result.current.addDocument({ id: '2', name: 'doc2.pdf' });
      });

      // Remove first document
      act(() => {
        result.current.removeDocument('1');
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0].id).toBe('2');
    });

    test('clears all documents', () => {
      const { result } = renderHook(() => useStore());
      
      // Add documents
      act(() => {
        result.current.addDocument({ id: '1', name: 'doc1.pdf' });
        result.current.addDocument({ id: '2', name: 'doc2.pdf' });
      });

      // Clear documents
      act(() => {
        result.current.clearDocuments();
      });

      expect(result.current.documents).toHaveLength(0);
    });
  });

  describe('Message Management', () => {
    test('adds message', () => {
      const { result } = renderHook(() => useStore());
      
      const message = {
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      };

      act(() => {
        result.current.addMessage(message);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(message);
    });

    test('clears messages', () => {
      const { result } = renderHook(() => useStore());
      
      // Add messages
      act(() => {
        result.current.addMessage({ role: 'user', content: 'Hello' });
        result.current.addMessage({ role: 'assistant', content: 'Hi' });
      });

      // Clear messages
      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('View Management', () => {
    test('sets active view', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.setActiveView('documents');
      });

      expect(result.current.activeView).toBe('documents');
    });

    test('defaults to chat view', () => {
      const { result } = renderHook(() => useStore());
      
      expect(result.current.activeView).toBe('chat');
    });
  });

  describe('LocalStorage Persistence', () => {
    test('loads state from localStorage on initialization', () => {
      const savedState = {
        projects: [{ id: '1', name: 'Saved Project' }],
        currentProject: { id: '1', name: 'Saved Project' },
        messages: [{ role: 'user', content: 'Saved message' }]
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useStore());

      expect(result.current.projects).toEqual(savedState.projects);
      expect(result.current.currentProject).toEqual(savedState.currentProject);
      expect(result.current.messages).toEqual(savedState.messages);
    });

    test('persists state to localStorage on changes', () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.createProject('Test Project');
      });

      // localStorage.setItem should have been called
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.state.projects).toHaveLength(1);
      expect(savedData.state.projects[0].name).toBe('Test Project');
    });
  });
});
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FileText, Upload, X, Plus } from 'lucide-react';
import { useStore } from '../store/appStore';
import toast from 'react-hot-toast';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const DocumentCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    transform: translateX(2px);
  }
`;

const DocumentTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DocumentPreview = styled.div`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(220, 53, 69, 0.1);
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #5a67d8;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
  }
`;

function DocumentsPane() {
  const { documents, addDocument, removeDocument } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '' });

  const handleAddDocument = () => {
    if (!newDoc.title || !newDoc.content) {
      toast.error('Please provide both title and content');
      return;
    }

    addDocument({
      title: newDoc.title,
      content: newDoc.content,
      type: 'manual'
    });

    toast.success('Document added to context');
    setNewDoc({ title: '', content: '' });
    setIsAdding(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        addDocument({
          title: file.name,
          content: event.target.result,
          type: 'file'
        });
        toast.success(`File "${file.name}" added to context`);
      };
      reader.readAsText(file);
    }
  };

  const loadSampleDocuments = () => {
    const samples = [
      {
        title: 'User Research Findings',
        content: `Key findings from user interviews:
- Users want faster load times
- Mobile experience needs improvement
- Need better search functionality
- Want integration with external tools
- Simplified onboarding process requested`
      },
      {
        title: 'Competitive Analysis',
        content: `Competitor features:
- Competitor A: Strong mobile app, lacks customization
- Competitor B: Good integrations, expensive pricing
- Competitor C: Fast performance, limited features
Our advantage: Better UX and competitive pricing`
      },
      {
        title: 'Technical Constraints',
        content: `Current limitations:
- Legacy database needs migration
- API rate limits from third-party services
- Mobile app framework limitations
- Budget constraints for infrastructure`
      }
    ];

    samples.forEach(doc => addDocument({ ...doc, type: 'sample' }));
    toast.success('Sample documents loaded');
  };

  return (
    <Container>
      {!isAdding && (
        <ButtonGroup>
          <AddButton onClick={() => setIsAdding(true)}>
            <Plus size={16} />
            Add Document
          </AddButton>
        </ButtonGroup>
      )}

      {!isAdding && documents.length === 0 && (
        <ButtonGroup>
          <SecondaryButton onClick={loadSampleDocuments}>
            Load Sample Documents
          </SecondaryButton>
        </ButtonGroup>
      )}

      {isAdding && (
        <div>
          <Input
            placeholder="Document title..."
            value={newDoc.title}
            onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
          />
          <TextArea
            placeholder="Paste or type document content here..."
            value={newDoc.content}
            onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
          />
          <ButtonGroup>
            <AddButton onClick={handleAddDocument}>
              Add to Context
            </AddButton>
            <SecondaryButton onClick={() => setIsAdding(false)}>
              Cancel
            </SecondaryButton>
          </ButtonGroup>
        </div>
      )}

      {documents.length === 0 && !isAdding && (
        <EmptyState>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No documents added yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Add documents to provide context for PRD creation
          </p>
        </EmptyState>
      )}

      {documents.map((doc) => (
        <DocumentCard key={doc.id}>
          <RemoveButton onClick={() => removeDocument(doc.id)}>
            <X size={16} />
          </RemoveButton>
          <DocumentTitle>
            <FileText size={16} />
            {doc.title}
          </DocumentTitle>
          <DocumentPreview>{doc.content}</DocumentPreview>
        </DocumentCard>
      ))}

      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        accept=".txt,.md,.json"
        onChange={handleFileUpload}
      />
      {!isAdding && documents.length > 0 && (
        <SecondaryButton onClick={() => document.getElementById('file-upload').click()}>
          <Upload size={16} style={{ marginRight: '8px' }} />
          Upload File
        </SecondaryButton>
      )}
    </Container>
  );
}

export default DocumentsPane;
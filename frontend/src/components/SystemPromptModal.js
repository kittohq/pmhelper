import React from 'react';
import styled from '@emotion/styled';
import { X, Info, FileText, Settings, Target } from 'lucide-react';
import { getSystemPromptSections } from '../config/systemPrompts';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: #1a1d23;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
`;

const SectionContent = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const TemplateCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
`;

const TemplateName = styled.h4`
  color: #667eea;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const TemplateDesc = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.85rem;
`;

const InfoBox = styled.div`
  background: #f0f4ff;
  border: 1px solid #667eea;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 12px;
  align-items: start;
`;

function SystemPromptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sections = getSystemPromptSections();

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Settings size={24} />
            System Prompt Configuration
          </Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          <InfoBox>
            <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>About System Prompts:</strong> These are the core instructions that guide the AI assistant's behavior across all PRD templates. They ensure consistent, professional output regardless of which template you're using.
            </div>
          </InfoBox>

          <Section>
            <SectionTitle>
              <Target size={20} />
              AI Role & Expertise
            </SectionTitle>
            <SectionContent>{sections.role}</SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <FileText size={20} />
              Approach to PRD Creation
            </SectionTitle>
            <SectionContent>{sections.approach}</SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <Settings size={20} />
              Output Formatting Rules
            </SectionTitle>
            <SectionContent>{sections.formatting}</SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <FileText size={20} />
              Template-Specific Context
            </SectionTitle>
            <TemplateGrid>
              {Object.entries(sections.templates).map(([key, value]) => (
                <TemplateCard key={key}>
                  <TemplateName>{key.charAt(0).toUpperCase() + key.slice(1)}</TemplateName>
                  <TemplateDesc>{value}</TemplateDesc>
                </TemplateCard>
              ))}
            </TemplateGrid>
          </Section>
        </Content>
      </ModalContent>
    </Modal>
  );
}

export default SystemPromptModal;
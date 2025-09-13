from typing import Dict, Any, List, Optional
from datetime import datetime
import yaml
import json
from uuid import UUID

from models.document import Document, DocumentType, DocumentStatus
from schemas.document import PMDContent, SpecContent
from services.llm_service import LLMService
from utils.template_engine import TemplateEngine


class DocumentGenerator:
    def __init__(self, llm_service: LLMService, template_engine: TemplateEngine):
        self.llm_service = llm_service
        self.template_engine = template_engine
        self._load_templates()
    
    def _load_templates(self):
        """Load document templates from YAML files"""
        with open("templates/pmd_template.yaml", "r") as f:
            self.pmd_template = yaml.safe_load(f)["pmd_template"]
        
        with open("templates/spec_template.yaml", "r") as f:
            self.spec_template = yaml.safe_load(f)["spec_template"]
    
    async def generate_pmd(
        self,
        product_name: str,
        initial_context: Dict[str, Any],
        user_inputs: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a PMD document using AI assistance"""
        
        # Prepare context for template
        context = {
            "product_name": product_name,
            "author_name": initial_context.get("author", "PM"),
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "version": "1.0.0",
            **initial_context
        }
        
        # Generate each section using LLM
        pmd_content = {}
        
        for section_key, section_config in self.pmd_template.items():
            if section_key == "header":
                pmd_content[section_key] = self.template_engine.render_section(
                    section_config, context
                )
                continue
            
            if section_config.get("optional") and not user_inputs.get(section_key):
                continue
            
            # Generate section content with AI
            section_prompt = self._build_section_prompt(
                section_key, 
                section_config, 
                context,
                user_inputs.get(section_key) if user_inputs else None
            )
            
            section_content = await self.llm_service.generate(
                prompt=section_prompt,
                system_prompt="You are a product management expert helping to create a comprehensive PMD."
            )
            
            pmd_content[section_key] = self._parse_section_response(
                section_content, 
                section_config
            )
        
        return pmd_content
    
    async def generate_spec(
        self,
        pmd_document: Document,
        engineering_inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate engineering spec from PMD"""
        
        # Extract key information from PMD
        pmd_summary = await self._summarize_pmd(pmd_document.content)
        
        # Build spec generation prompt
        spec_prompt = f"""
        Based on the following PMD summary and engineering inputs, generate a detailed technical specification:
        
        PMD Summary:
        {json.dumps(pmd_summary, indent=2)}
        
        Engineering Inputs:
        {json.dumps(engineering_inputs, indent=2)}
        
        Generate a comprehensive technical specification including:
        1. Technical requirements (functional and non-functional)
        2. System architecture overview
        3. Implementation approach
        4. Resource and timeline estimates
        """
        
        spec_content = await self.llm_service.generate(
            prompt=spec_prompt,
            system_prompt="You are a senior engineering architect creating technical specifications."
        )
        
        # Structure the spec content
        structured_spec = self._structure_spec_content(
            spec_content,
            pmd_document.id,
            engineering_inputs
        )
        
        return structured_spec
    
    async def update_document(
        self,
        document: Document,
        changes: Dict[str, Any],
        linked_documents: List[Document]
    ) -> List[Dict[str, Any]]:
        """Generate updates for linked documents based on changes"""
        
        updates = []
        
        # Analyze impact of changes
        impact_analysis = await self._analyze_change_impact(
            document,
            changes,
            linked_documents
        )
        
        # Generate updates for each affected document
        for linked_doc in linked_documents:
            if linked_doc.id in impact_analysis["affected_documents"]:
                update_prompt = f"""
                The following changes were made to a related document:
                
                Original Document Type: {document.type}
                Changes: {json.dumps(changes, indent=2)}
                
                Current Document Type: {linked_doc.type}
                Current Content Summary: {await self._summarize_document(linked_doc)}
                
                Generate necessary updates to maintain consistency.
                """
                
                suggested_updates = await self.llm_service.generate(
                    prompt=update_prompt,
                    system_prompt="You are updating related documents to maintain consistency across the product documentation."
                )
                
                updates.append({
                    "document_id": linked_doc.id,
                    "document_title": linked_doc.title,
                    "suggested_changes": self._parse_update_suggestions(suggested_updates),
                    "impact_level": impact_analysis["impact_levels"].get(linked_doc.id, "low")
                })
        
        return updates
    
    def _build_section_prompt(
        self,
        section_key: str,
        section_config: Dict[str, Any],
        context: Dict[str, Any],
        user_input: Optional[Any] = None
    ) -> str:
        """Build prompt for generating a specific section"""
        
        prompt = f"Generate content for the '{section_key}' section of a PMD.\n\n"
        
        if "prompt" in section_config:
            prompt += f"Section Goal: {section_config['prompt']}\n\n"
        
        if user_input:
            prompt += f"User Input: {user_input}\n\n"
        
        prompt += f"Context:\n{json.dumps(context, indent=2)}\n\n"
        
        if "sections" in section_config:
            prompt += "Include the following subsections:\n"
            for subsection in section_config["sections"]:
                if isinstance(subsection, dict):
                    prompt += f"- {subsection.get('prompt', subsection)}\n"
                else:
                    prompt += f"- {subsection}\n"
        
        if section_config.get("type") == "list":
            min_items = section_config.get("min_items", 3)
            max_items = section_config.get("max_items", 10)
            prompt += f"\nProvide between {min_items} and {max_items} items.\n"
            
            if "format" in section_config:
                prompt += f"Format: {section_config['format']}\n"
            
            if "examples" in section_config:
                prompt += f"Examples:\n"
                for example in section_config["examples"]:
                    prompt += f"- {example}\n"
        
        return prompt
    
    def _parse_section_response(
        self,
        response: str,
        section_config: Dict[str, Any]
    ) -> Any:
        """Parse LLM response into structured format"""
        
        if section_config.get("type") == "list":
            # Extract list items from response
            lines = response.strip().split("\n")
            items = []
            for line in lines:
                line = line.strip()
                if line and (line.startswith("-") or line.startswith("*") or line[0].isdigit()):
                    # Remove list markers
                    item = line.lstrip("-*").strip()
                    if item[0].isdigit() and "." in item[:3]:
                        item = item.split(".", 1)[1].strip()
                    items.append(item)
            return items[:section_config.get("max_items", 10)]
        
        # Return as dictionary for complex sections
        if "sections" in section_config:
            return self._parse_complex_section(response, section_config["sections"])
        
        return response.strip()
    
    def _parse_complex_section(
        self,
        response: str,
        subsections: List[Any]
    ) -> Dict[str, Any]:
        """Parse complex section with multiple subsections"""
        
        result = {}
        lines = response.split("\n")
        current_section = None
        current_content = []
        
        for line in lines:
            # Check if line is a section header
            is_header = False
            for subsection in subsections:
                subsection_name = subsection if isinstance(subsection, str) else list(subsection.keys())[0]
                if subsection_name.lower() in line.lower():
                    if current_section:
                        result[current_section] = "\n".join(current_content).strip()
                    current_section = subsection_name
                    current_content = []
                    is_header = True
                    break
            
            if not is_header and current_section:
                current_content.append(line)
        
        # Add last section
        if current_section:
            result[current_section] = "\n".join(current_content).strip()
        
        return result
    
    async def _summarize_pmd(self, pmd_content: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize PMD content for spec generation"""
        
        summary_prompt = f"""
        Summarize the following PMD content, focusing on technical requirements:
        
        {json.dumps(pmd_content, indent=2)}
        
        Extract:
        1. Core functionality requirements
        2. User stories and use cases
        3. Performance expectations
        4. Integration needs
        5. Success metrics
        """
        
        summary = await self.llm_service.generate(
            prompt=summary_prompt,
            system_prompt="Extract technical requirements from product documentation."
        )
        
        return {"summary": summary, "original_content": pmd_content}
    
    def _structure_spec_content(
        self,
        spec_content: str,
        pmd_id: UUID,
        engineering_inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Structure the generated spec content"""
        
        return {
            "pmd_reference": str(pmd_id),
            "technical_requirements": {
                "functional": self._extract_requirements(spec_content, "functional"),
                "non_functional": self._extract_requirements(spec_content, "non-functional"),
                "constraints": engineering_inputs.get("constraints", [])
            },
            "architecture": {
                "overview": self._extract_section(spec_content, "architecture"),
                "components": engineering_inputs.get("components", []),
                "integrations": engineering_inputs.get("integrations", [])
            },
            "implementation": {
                "technology_stack": engineering_inputs.get("tech_stack", []),
                "phases": self._extract_section(spec_content, "phases"),
                "testing_strategy": engineering_inputs.get("testing_strategy", "")
            },
            "estimates": {
                "effort": engineering_inputs.get("effort_estimate", ""),
                "timeline": engineering_inputs.get("timeline", []),
                "resources": engineering_inputs.get("resources", [])
            }
        }
    
    def _extract_requirements(self, content: str, req_type: str) -> List[str]:
        """Extract requirements of specific type from content"""
        # Simple extraction logic - can be enhanced with NLP
        requirements = []
        lines = content.split("\n")
        in_section = False
        
        for line in lines:
            if req_type.lower() in line.lower():
                in_section = True
                continue
            elif in_section and line.strip().startswith("-"):
                requirements.append(line.strip().lstrip("-").strip())
            elif in_section and line.strip() == "":
                in_section = False
        
        return requirements
    
    def _extract_section(self, content: str, section_name: str) -> str:
        """Extract specific section from content"""
        lines = content.split("\n")
        section_content = []
        in_section = False
        
        for line in lines:
            if section_name.lower() in line.lower():
                in_section = True
                continue
            elif in_section and line.strip() and not line.strip().startswith("#"):
                section_content.append(line)
            elif in_section and line.strip().startswith("#"):
                break
        
        return "\n".join(section_content).strip()
    
    async def _analyze_change_impact(
        self,
        document: Document,
        changes: Dict[str, Any],
        linked_documents: List[Document]
    ) -> Dict[str, Any]:
        """Analyze impact of changes on linked documents"""
        
        impact_prompt = f"""
        Analyze the impact of these changes on related documents:
        
        Document Type: {document.type}
        Changes: {json.dumps(changes, indent=2)}
        
        Linked Documents:
        {json.dumps([{"id": str(doc.id), "type": doc.type, "title": doc.title} for doc in linked_documents], indent=2)}
        
        Determine which documents need updates and the impact level (high/medium/low).
        """
        
        impact_analysis = await self.llm_service.generate(
            prompt=impact_prompt,
            system_prompt="Analyze document change impact and dependencies."
        )
        
        # Parse impact analysis
        affected_docs = []
        impact_levels = {}
        
        for doc in linked_documents:
            # Simple heuristic - can be enhanced with better parsing
            if doc.type == DocumentType.SPEC and document.type == DocumentType.PMD:
                affected_docs.append(doc.id)
                impact_levels[doc.id] = "high"
            elif doc.type == DocumentType.PMD and document.type == DocumentType.SPEC:
                affected_docs.append(doc.id)
                impact_levels[doc.id] = "medium"
        
        return {
            "affected_documents": affected_docs,
            "impact_levels": impact_levels,
            "analysis": impact_analysis
        }
    
    async def _summarize_document(self, document: Document) -> str:
        """Generate summary of document content"""
        
        summary_prompt = f"""
        Provide a brief summary of this document:
        
        Type: {document.type}
        Title: {document.title}
        Content: {json.dumps(document.content, indent=2)[:2000]}  # Truncate for context limit
        """
        
        return await self.llm_service.generate(
            prompt=summary_prompt,
            system_prompt="Summarize document content concisely."
        )
    
    def _parse_update_suggestions(self, suggestions: str) -> List[Dict[str, Any]]:
        """Parse update suggestions from LLM response"""
        
        parsed_suggestions = []
        lines = suggestions.split("\n")
        current_suggestion = {}
        
        for line in lines:
            line = line.strip()
            if line.startswith("-") or line.startswith("*"):
                if current_suggestion:
                    parsed_suggestions.append(current_suggestion)
                current_suggestion = {"change": line.lstrip("-*").strip()}
            elif ":" in line and current_suggestion:
                key, value = line.split(":", 1)
                current_suggestion[key.strip().lower()] = value.strip()
        
        if current_suggestion:
            parsed_suggestions.append(current_suggestion)
        
        return parsed_suggestions
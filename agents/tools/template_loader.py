"""Template loading utilities for PRD generation."""

import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

class TemplateLoader:
    """Loads and manages PRD templates."""
    
    def __init__(self, templates_path: str = "../backend/templates"):
        self.templates_path = Path(templates_path)
        self._templates_cache: Dict[str, Dict[str, Any]] = {}
    
    def load_template(self, template_type: str) -> Optional[Dict[str, Any]]:
        """Load a specific template by type."""
        if template_type in self._templates_cache:
            return self._templates_cache[template_type]
        
        template_file = self.templates_path / f"{template_type}-prd.json"
        
        if not template_file.exists():
            return None
        
        try:
            with open(template_file, 'r', encoding='utf-8') as f:
                template = json.load(f)
            
            self._templates_cache[template_type] = template
            return template
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading template {template_type}: {e}")
            return None
    
    def get_available_templates(self) -> List[str]:
        """Get list of available template types."""
        if not self.templates_path.exists():
            return []
        
        templates = []
        for file in self.templates_path.glob("*-prd.json"):
            template_type = file.stem.replace("-prd", "")
            templates.append(template_type)
        
        return sorted(templates)
    
    def get_template_sections(self, template_type: str) -> Dict[str, Any]:
        """Get sections for a specific template."""
        template = self.load_template(template_type)
        if not template:
            return {}
        
        return template.get("sections", {})
    
    def get_required_sections(self, template_type: str) -> List[str]:
        """Get required sections for a template."""
        sections = self.get_template_sections(template_type)
        required = []
        
        for section_key, section_data in sections.items():
            if section_data.get("required", False):
                required.append(section_key)
        
        return required
    
    def get_section_prompts(self, template_type: str, section_key: str) -> List[str]:
        """Get prompts for a specific section."""
        sections = self.get_template_sections(template_type)
        section = sections.get(section_key, {})
        return section.get("prompts", [])
    
    def validate_template_data(self, template_type: str, data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Validate PRD data against template requirements."""
        template = self.load_template(template_type)
        if not template:
            return {"errors": [f"Template {template_type} not found"]}
        
        sections = template.get("sections", {})
        errors = []
        missing_required = []
        
        # Check required sections
        for section_key, section_data in sections.items():
            if section_data.get("required", False):
                if section_key not in data or not data[section_key].strip():
                    missing_required.append(section_data.get("title", section_key))
        
        if missing_required:
            errors.append(f"Missing required sections: {', '.join(missing_required)}")
        
        return {
            "errors": errors,
            "missing_required": missing_required,
            "is_valid": len(errors) == 0
        }
    
    def get_template_info(self, template_type: str) -> Dict[str, Any]:
        """Get comprehensive template information."""
        template = self.load_template(template_type)
        if not template:
            return {}
        
        return {
            "name": template.get("name", ""),
            "description": template.get("description", ""),
            "template_type": template.get("templateType", template_type),
            "sections": list(template.get("sections", {}).keys()),
            "required_sections": self.get_required_sections(template_type)
        }

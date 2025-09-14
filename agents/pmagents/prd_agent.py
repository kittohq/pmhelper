"""PRD creation agent using OpenAI Agents SDK."""

import json
from typing import Dict, Any, List, Optional
from agents import Agent, Runner, set_default_openai_key

from config import AgentConfig
from tools import TemplateLoader, PRDValidator
from prompts import SystemPrompts

class PRDAgent:
    """AI agent for PRD creation and management."""
    
    def __init__(self):
        AgentConfig.validate_config()
        
        # Set up OpenAI key for agents SDK
        set_default_openai_key(AgentConfig.OPENAI_API_KEY)
        
        self.template_loader = TemplateLoader(AgentConfig.TEMPLATES_PATH)
        self.validator = PRDValidator()
        
        # Create the agent without custom tools - use conversational approach
        self.agent = Agent(
            name=AgentConfig.AGENT_NAME,
            instructions=self._get_base_instructions(),
            model=AgentConfig.OPENAI_MODEL
        )
        
        self.conversation_history: List[Dict[str, Any]] = []
        self.current_template: Optional[str] = None
        self.current_prd_data: Dict[str, Any] = {}
    
    def _get_base_instructions(self) -> str:
        """Get base instructions for the agent."""
        return SystemPrompts.BASE_SYSTEM_PROMPT
    
    async def chat(self, user_message: str, template_type: str = "lean", 
                   project_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main chat interface for PRD creation."""
        
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message,
            "timestamp": self._get_timestamp()
        })
        
        # Set current template if provided
        if template_type:
            self.current_template = template_type
        
        # Always generate AI response - no rule-based templated responses
        response = await self._generate_prd_response(user_message, template_type, project_context)
        
        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response["content"],
            "timestamp": self._get_timestamp(),
            "metadata": response.get("metadata", {})
        })
        
        return response
    
    async def _generate_prd_response(self, user_message: str, template_type: str, project_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate PRD content response using OpenAI Agents SDK."""
        try:
            # Update agent instructions with template-specific context
            template_context = SystemPrompts.build_system_prompt(
                template_type=template_type,
                context={
                    "current_prd": json.dumps(self.current_prd_data, indent=2),
                    "template_sections": str(self.template_loader.get_template_sections(template_type))
                }
            )
            
            # Create a new agent instance with updated instructions
            agent_with_context = Agent(
                name=self.agent.name,
                instructions=template_context,
                model=self.agent.model
            )
            
            # Run the agent with the user message
            result = await Runner.run(
                agent_with_context,
                f"Create PRD content using {template_type} template: {user_message}"
            )
            
            return {
                "content": result.final_output,
                "type": "prd_content",
                "template_type": template_type,
                "metadata": {
                    "sections_generated": list(self.template_loader.get_template_sections(template_type).keys())
                }
            }
            
        except Exception as e:
            return {
                "content": f"I encountered an error while generating the PRD: {str(e)}. Please try again or provide more specific information.",
                "type": "error"
            }
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get conversation history."""
        return self.conversation_history.copy()
    
    def clear_conversation(self):
        """Clear conversation history."""
        self.conversation_history.clear()
        self.current_prd_data.clear()
    
    def get_available_templates(self) -> List[str]:
        """Get available template types."""
        return self.template_loader.get_available_templates()
    
    def get_template_info(self, template_type: str) -> Dict[str, Any]:
        """Get information about a specific template."""
        return self.template_loader.get_template_info(template_type)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()

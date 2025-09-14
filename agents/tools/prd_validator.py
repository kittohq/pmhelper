"""PRD validation utilities."""

from typing import Dict, Any, List, Tuple
import re

class PRDValidator:
    """Validates PRD content and completeness."""
    
    # Core required information for any PRD
    CORE_REQUIREMENTS = {
        "product_name": "Product/Feature Name",
        "problem_statement": "Problem Statement", 
        "target_users": "Target Users",
        "core_functionality": "Core Functionality",
        "success_metrics": "Success Metrics"
    }
    
    def __init__(self):
        self.validation_rules = {
            "product_name": self._validate_product_name,
            "problem_statement": self._validate_problem_statement,
            "target_users": self._validate_target_users,
            "core_functionality": self._validate_core_functionality,
            "success_metrics": self._validate_success_metrics
        }
    
    def validate_user_input(self, user_input: str) -> Dict[str, Any]:
        """Validate user input and extract information."""
        extracted_info = self._extract_information(user_input)
        missing_info = self._check_missing_requirements(extracted_info)
        
        return {
            "extracted_info": extracted_info,
            "missing_info": missing_info,
            "is_sufficient": len(missing_info) == 0,
            "completeness_score": self._calculate_completeness(extracted_info)
        }
    
    def _extract_information(self, text: str) -> Dict[str, str]:
        """Extract PRD information from user input."""
        info = {}
        text_lower = text.lower()
        
        # Product name extraction
        product_patterns = [
            r"(?:product|app|feature|tool|system|platform)\s+(?:called|named)\s+([^\s,\.]+)",
            r"building\s+(?:a|an)?\s*([^\s,\.]+)",
            r"create\s+(?:a|an)?\s*([^\s,\.]+)",
            r"([A-Z][a-zA-Z]+(?:[A-Z][a-zA-Z]*)*)\s+(?:app|product|feature)"
        ]
        
        for pattern in product_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info["product_name"] = match.group(1).strip()
                break
        
        # Problem statement extraction
        problem_keywords = ["problem", "issue", "challenge", "pain point", "struggle", "difficulty"]
        if any(keyword in text_lower for keyword in problem_keywords):
            info["problem_statement"] = "detected"
        
        # Target users extraction
        user_keywords = ["users", "customers", "audience", "people", "target", "for"]
        if any(keyword in text_lower for keyword in user_keywords):
            info["target_users"] = "detected"
        
        # Core functionality extraction
        feature_keywords = ["features", "functionality", "does", "capabilities", "functions"]
        if any(keyword in text_lower for keyword in feature_keywords):
            info["core_functionality"] = "detected"
        
        # Success metrics extraction
        metric_keywords = ["success", "metrics", "kpi", "measure", "goal", "target"]
        if any(keyword in text_lower for keyword in metric_keywords):
            info["success_metrics"] = "detected"
        
        return info
    
    def _check_missing_requirements(self, extracted_info: Dict[str, str]) -> List[str]:
        """Check which core requirements are missing."""
        missing = []
        
        for req_key, req_name in self.CORE_REQUIREMENTS.items():
            if req_key not in extracted_info or not extracted_info[req_key]:
                missing.append(req_name)
        
        return missing
    
    def _calculate_completeness(self, extracted_info: Dict[str, str]) -> float:
        """Calculate completeness score (0-1)."""
        total_requirements = len(self.CORE_REQUIREMENTS)
        found_requirements = len([k for k in self.CORE_REQUIREMENTS.keys() if k in extracted_info])
        
        return found_requirements / total_requirements if total_requirements > 0 else 0.0
    
    def _validate_product_name(self, value: str) -> Tuple[bool, str]:
        """Validate product name."""
        if not value or len(value.strip()) < 2:
            return False, "Product name must be at least 2 characters"
        
        if value.lower() in ["product", "app", "feature", "tool", "system"]:
            return False, "Product name should be specific, not generic"
        
        return True, ""
    
    def _validate_problem_statement(self, value: str) -> Tuple[bool, str]:
        """Validate problem statement."""
        if not value or len(value.strip()) < 10:
            return False, "Problem statement should be descriptive (at least 10 characters)"
        
        if "problem" not in value.lower() and "issue" not in value.lower():
            return False, "Problem statement should clearly describe the problem"
        
        return True, ""
    
    def _validate_target_users(self, value: str) -> Tuple[bool, str]:
        """Validate target users."""
        if not value or len(value.strip()) < 5:
            return False, "Target users should be specific (at least 5 characters)"
        
        generic_terms = ["everyone", "users", "people", "customers"]
        if value.lower().strip() in generic_terms:
            return False, "Target users should be specific, not generic"
        
        return True, ""
    
    def _validate_core_functionality(self, value: str) -> Tuple[bool, str]:
        """Validate core functionality."""
        if not value or len(value.strip()) < 10:
            return False, "Core functionality should be descriptive (at least 10 characters)"
        
        return True, ""
    
    def _validate_success_metrics(self, value: str) -> Tuple[bool, str]:
        """Validate success metrics."""
        if not value or len(value.strip()) < 5:
            return False, "Success metrics should be specific (at least 5 characters)"
        
        return True, ""
    
    def generate_clarification_questions(self, missing_info: List[str]) -> List[str]:
        """Generate clarification questions for missing information."""
        questions = []
        
        question_map = {
            "Product/Feature Name": "What should we call this product or feature?",
            "Problem Statement": "What specific problem are you trying to solve? Who experiences this problem and what's the impact?",
            "Target Users": "Who are your target users? Please be specific (e.g., 'small business owners', 'fitness enthusiasts', 'software developers').",
            "Core Functionality": "What are the 2-3 main things this product must do? What are the core features?",
            "Success Metrics": "How will you measure success? What are your target KPIs or goals?"
        }
        
        for missing in missing_info:
            if missing in question_map:
                questions.append(question_map[missing])
        
        return questions
    
    def is_request_underspecified(self, user_input: str) -> bool:
        """Check if user request is too vague/underspecified."""
        validation_result = self.validate_user_input(user_input)
        
        # Consider underspecified if less than 40% complete or very short
        return (validation_result["completeness_score"] < 0.4 or 
                len(user_input.strip()) < 20)

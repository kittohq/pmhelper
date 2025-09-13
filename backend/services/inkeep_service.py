from typing import Dict, Any, List, Optional
import aiohttp
import json
import hashlib
from datetime import datetime
from uuid import UUID

from config.settings import settings
from models.document import Document, DocumentType
from utils.logger import get_logger

logger = get_logger(__name__)


class InkeepService:
    """Service for integrating Inkeep AI capabilities into PM Assistant"""
    
    def __init__(self):
        self.api_key = settings.INKEEP_API_KEY
        self.integration_id = settings.INKEEP_INTEGRATION_ID
        self.api_url = settings.INKEEP_API_URL
        self.enabled = bool(self.api_key and self.integration_id)
        
        if not self.enabled:
            logger.warning("Inkeep integration disabled - missing API key or integration ID")
    
    async def index_document(
        self,
        document: Document,
        force_update: bool = False
    ) -> Dict[str, Any]:
        """Index a document in Inkeep's knowledge base"""
        
        if not self.enabled:
            return {"status": "disabled", "message": "Inkeep integration not configured"}
        
        try:
            # Generate unique document ID for Inkeep
            inkeep_doc_id = self._generate_inkeep_id(document.id)
            
            # Prepare document content for indexing
            indexed_content = self._prepare_document_for_indexing(document)
            
            # Check if document already exists
            if not force_update:
                exists = await self._document_exists(inkeep_doc_id)
                if exists:
                    return {"status": "exists", "inkeep_id": inkeep_doc_id}
            
            # Index the document
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "integrationId": self.integration_id,
                    "documents": [{
                        "id": inkeep_doc_id,
                        "title": indexed_content["title"],
                        "content": indexed_content["content"],
                        "metadata": indexed_content["metadata"],
                        "url": f"/documents/{document.id}",
                        "contentType": "markdown"
                    }]
                }
                
                async with session.post(
                    f"{self.api_url}/v1/index/documents",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Document {document.id} indexed in Inkeep")
                        return {
                            "status": "success",
                            "inkeep_id": inkeep_doc_id,
                            "result": result
                        }
                    else:
                        error = await response.text()
                        logger.error(f"Failed to index document: {error}")
                        return {
                            "status": "error",
                            "message": error
                        }
        
        except Exception as e:
            logger.error(f"Error indexing document in Inkeep: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def search(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search documents using Inkeep's semantic search"""
        
        if not self.enabled:
            return []
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "integrationId": self.integration_id,
                    "query": query,
                    "limit": limit
                }
                
                if filters:
                    payload["filters"] = filters
                
                async with session.post(
                    f"{self.api_url}/v1/search",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._format_search_results(result)
                    else:
                        logger.error(f"Search failed: {await response.text()}")
                        return []
        
        except Exception as e:
            logger.error(f"Error searching in Inkeep: {str(e)}")
            return []
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None,
        stream: bool = False
    ) -> Dict[str, Any]:
        """Chat with Inkeep AI using document context"""
        
        if not self.enabled:
            return {
                "status": "disabled",
                "message": "Inkeep integration not configured"
            }
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "integrationId": self.integration_id,
                    "messages": messages,
                    "stream": stream
                }
                
                if context:
                    payload["context"] = context
                
                async with session.post(
                    f"{self.api_url}/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        if stream:
                            return {"status": "success", "stream": response.content}
                        else:
                            result = await response.json()
                            return {
                                "status": "success",
                                "response": result.get("choices", [{}])[0].get("message", {}).get("content", ""),
                                "metadata": result.get("metadata", {})
                            }
                    else:
                        error = await response.text()
                        logger.error(f"Chat failed: {error}")
                        return {
                            "status": "error",
                            "message": error
                        }
        
        except Exception as e:
            logger.error(f"Error in Inkeep chat: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def get_suggestions(
        self,
        document_type: DocumentType,
        section: str,
        current_content: str,
        context: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """Get AI suggestions for document content"""
        
        if not self.enabled:
            return []
        
        try:
            # Build prompt for suggestions
            prompt = f"""
            Based on similar {document_type} documents, suggest content for the '{section}' section.
            
            Current content:
            {current_content[:500]}
            
            Provide 3-5 specific suggestions to improve or complete this section.
            """
            
            messages = [
                {"role": "system", "content": "You are a PM assistant helping to improve document quality."},
                {"role": "user", "content": prompt}
            ]
            
            response = await self.chat(messages, context)
            
            if response.get("status") == "success":
                suggestions = self._parse_suggestions(response.get("response", ""))
                return suggestions
            else:
                return []
        
        except Exception as e:
            logger.error(f"Error getting suggestions: {str(e)}")
            return []
    
    async def validate_document(
        self,
        document: Document
    ) -> Dict[str, Any]:
        """Validate document against best practices using Inkeep"""
        
        if not self.enabled:
            return {
                "status": "disabled",
                "issues": [],
                "suggestions": []
            }
        
        try:
            # Build validation prompt
            doc_summary = self._summarize_document(document)
            
            prompt = f"""
            Review this {document.type} document and identify:
            1. Missing required sections
            2. Incomplete information
            3. Best practice violations
            4. Improvement opportunities
            
            Document Summary:
            {doc_summary}
            
            Provide specific, actionable feedback.
            """
            
            messages = [
                {"role": "system", "content": "You are a document quality reviewer."},
                {"role": "user", "content": prompt}
            ]
            
            response = await self.chat(messages)
            
            if response.get("status") == "success":
                validation_result = self._parse_validation_response(response.get("response", ""))
                return {
                    "status": "success",
                    **validation_result
                }
            else:
                return {
                    "status": "error",
                    "issues": [],
                    "suggestions": []
                }
        
        except Exception as e:
            logger.error(f"Error validating document: {str(e)}")
            return {
                "status": "error",
                "issues": [],
                "suggestions": []
            }
    
    async def find_similar_documents(
        self,
        document: Document,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar documents using Inkeep's semantic search"""
        
        if not self.enabled:
            return []
        
        try:
            # Extract key content for similarity search
            search_query = self._extract_key_content(document)
            
            # Add metadata filters
            filters = {
                "type": document.type,
                "exclude_id": str(document.id)
            }
            
            results = await self.search(search_query, filters, limit)
            
            return results
        
        except Exception as e:
            logger.error(f"Error finding similar documents: {str(e)}")
            return []
    
    async def generate_cross_references(
        self,
        document: Document
    ) -> List[Dict[str, Any]]:
        """Generate cross-references to related documents"""
        
        if not self.enabled:
            return []
        
        try:
            # Extract entities and topics from document
            entities = self._extract_entities(document)
            
            references = []
            for entity in entities:
                # Search for documents mentioning this entity
                results = await self.search(entity, limit=3)
                for result in results:
                    if result.get("id") != str(document.id):
                        references.append({
                            "entity": entity,
                            "document_id": result.get("id"),
                            "title": result.get("title"),
                            "relevance": result.get("score", 0)
                        })
            
            # Sort by relevance and deduplicate
            references = sorted(references, key=lambda x: x["relevance"], reverse=True)
            seen = set()
            unique_references = []
            for ref in references:
                if ref["document_id"] not in seen:
                    seen.add(ref["document_id"])
                    unique_references.append(ref)
            
            return unique_references[:10]
        
        except Exception as e:
            logger.error(f"Error generating cross-references: {str(e)}")
            return []
    
    def _generate_inkeep_id(self, document_id: UUID) -> str:
        """Generate a consistent Inkeep document ID"""
        return f"pma_{str(document_id)}"
    
    def _prepare_document_for_indexing(self, document: Document) -> Dict[str, Any]:
        """Prepare document content for Inkeep indexing"""
        
        # Convert document content to markdown format
        markdown_content = self._convert_to_markdown(document.content)
        
        # Prepare metadata
        metadata = {
            "document_id": str(document.id),
            "type": document.type,
            "status": document.status,
            "version": document.version,
            "created_at": document.created_at.isoformat(),
            "updated_at": document.updated_at.isoformat(),
            **document.metadata
        }
        
        return {
            "title": document.title,
            "content": markdown_content,
            "metadata": metadata
        }
    
    def _convert_to_markdown(self, content: Dict[str, Any]) -> str:
        """Convert document content to markdown format"""
        
        markdown = []
        
        for section, section_content in content.items():
            # Add section header
            markdown.append(f"## {section.replace('_', ' ').title()}\n")
            
            if isinstance(section_content, dict):
                for key, value in section_content.items():
                    markdown.append(f"### {key.replace('_', ' ').title()}\n")
                    if isinstance(value, list):
                        for item in value:
                            markdown.append(f"- {item}\n")
                    else:
                        markdown.append(f"{value}\n")
            elif isinstance(section_content, list):
                for item in section_content:
                    markdown.append(f"- {item}\n")
            else:
                markdown.append(f"{section_content}\n")
            
            markdown.append("\n")
        
        return "\n".join(markdown)
    
    async def _document_exists(self, inkeep_doc_id: str) -> bool:
        """Check if document already exists in Inkeep"""
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                async with session.get(
                    f"{self.api_url}/v1/index/documents/{inkeep_doc_id}",
                    headers=headers
                ) as response:
                    return response.status == 200
        except:
            return False
    
    def _format_search_results(self, raw_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format Inkeep search results"""
        
        formatted = []
        for result in raw_results.get("results", []):
            formatted.append({
                "id": result.get("metadata", {}).get("document_id"),
                "title": result.get("title"),
                "snippet": result.get("snippet"),
                "score": result.get("score"),
                "type": result.get("metadata", {}).get("type"),
                "url": result.get("url")
            })
        
        return formatted
    
    def _parse_suggestions(self, response: str) -> List[str]:
        """Parse suggestions from AI response"""
        
        suggestions = []
        lines = response.split("\n")
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith("-") or line.startswith("*") or line[0].isdigit()):
                suggestion = line.lstrip("-*").strip()
                if suggestion[0].isdigit() and "." in suggestion[:3]:
                    suggestion = suggestion.split(".", 1)[1].strip()
                suggestions.append(suggestion)
        
        return suggestions[:5]
    
    def _summarize_document(self, document: Document) -> str:
        """Create a summary of document for validation"""
        
        summary_parts = [
            f"Title: {document.title}",
            f"Type: {document.type}",
            f"Status: {document.status}",
            "Content Sections:"
        ]
        
        for section in document.content.keys():
            summary_parts.append(f"- {section}")
        
        return "\n".join(summary_parts)
    
    def _parse_validation_response(self, response: str) -> Dict[str, Any]:
        """Parse validation response from AI"""
        
        issues = []
        suggestions = []
        
        lines = response.split("\n")
        current_section = None
        
        for line in lines:
            line = line.strip()
            if "missing" in line.lower() or "incomplete" in line.lower():
                current_section = "issues"
            elif "suggest" in line.lower() or "improve" in line.lower():
                current_section = "suggestions"
            elif line and current_section:
                if line.startswith("-") or line.startswith("*"):
                    item = line.lstrip("-*").strip()
                    if current_section == "issues":
                        issues.append(item)
                    else:
                        suggestions.append(item)
        
        return {
            "issues": issues,
            "suggestions": suggestions
        }
    
    def _extract_key_content(self, document: Document) -> str:
        """Extract key content for similarity search"""
        
        key_parts = [document.title]
        
        # Extract problem statement or main content
        if "problem_statement" in document.content:
            key_parts.append(str(document.content["problem_statement"]))
        elif "solution" in document.content:
            key_parts.append(str(document.content["solution"]))
        
        return " ".join(key_parts)[:500]
    
    def _extract_entities(self, document: Document) -> List[str]:
        """Extract key entities and topics from document"""
        
        entities = []
        
        # Extract from title
        title_words = document.title.split()
        entities.extend([w for w in title_words if len(w) > 3])
        
        # Extract from tags
        if document.tags:
            entities.extend(document.tags)
        
        # Extract key terms from content (simplified)
        content_str = json.dumps(document.content)
        # Look for capitalized terms (potential product/feature names)
        import re
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', content_str)
        entities.extend(capitalized)
        
        # Deduplicate
        return list(set(entities))[:20]
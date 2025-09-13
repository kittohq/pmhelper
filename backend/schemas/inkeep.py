from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID

from models.document import DocumentType


class InkeepSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    filters: Optional[Dict[str, Any]] = None
    limit: int = Field(10, ge=1, le=50)


class InkeepSearchResult(BaseModel):
    id: Optional[str]
    title: str
    snippet: str
    score: float
    type: Optional[str]
    url: Optional[str]


class InkeepSearchResponse(BaseModel):
    query: str
    results: List[InkeepSearchResult]
    total: int


class InkeepChatMessage(BaseModel):
    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: str


class InkeepChatRequest(BaseModel):
    messages: List[InkeepChatMessage]
    context: Optional[Dict[str, Any]] = None
    stream: bool = False


class InkeepChatResponse(BaseModel):
    response: str
    metadata: Dict[str, Any]
    status: str


class InkeepSuggestionsRequest(BaseModel):
    document_type: DocumentType
    section: str
    current_content: str
    context: Optional[Dict[str, Any]] = None


class InkeepSuggestionsResponse(BaseModel):
    section: str
    suggestions: List[str]


class InkeepValidationResponse(BaseModel):
    document_id: UUID
    status: str
    issues: List[str]
    suggestions: List[str]


class InkeepIndexRequest(BaseModel):
    document_id: UUID
    force_update: bool = False


class InkeepIndexResponse(BaseModel):
    status: str
    inkeep_id: Optional[str]
    message: Optional[str]


class InkeepSimilarDocument(BaseModel):
    id: str
    title: str
    score: float
    type: str


class InkeepCrossReference(BaseModel):
    entity: str
    document_id: str
    title: str
    relevance: float
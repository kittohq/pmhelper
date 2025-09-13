from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from models.document import DocumentType, DocumentStatus


class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    type: DocumentType
    content: Dict[str, Any]
    summary: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    tags: Optional[List[str]] = []


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    status: Optional[DocumentStatus] = None


class DocumentResponse(DocumentBase):
    id: UUID
    version: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime
    created_by_id: UUID
    approved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PMDContent(BaseModel):
    problem_statement: Dict[str, Any] = Field(..., description="Problem description and pain points")
    solution: Dict[str, Any] = Field(..., description="Solution overview and features")
    market_analysis: Optional[Dict[str, Any]] = None
    risks_and_mitigations: Optional[Dict[str, Any]] = None
    timeline: Optional[Dict[str, Any]] = None
    success_metrics: Optional[List[str]] = None


class SpecContent(BaseModel):
    pmd_reference: UUID
    technical_requirements: Dict[str, Any]
    architecture: Dict[str, Any]
    implementation: Dict[str, Any]
    estimates: Dict[str, Any]


class DocumentVersionResponse(BaseModel):
    id: UUID
    document_id: UUID
    version: str
    content: Dict[str, Any]
    change_summary: Optional[str]
    created_at: datetime
    created_by_id: UUID
    
    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    section: Optional[str] = None


class CommentResponse(BaseModel):
    id: UUID
    document_id: UUID
    content: str
    section: Optional[str]
    resolved: bool
    created_at: datetime
    created_by_id: UUID
    
    class Config:
        from_attributes = True
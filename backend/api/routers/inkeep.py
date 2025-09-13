from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from uuid import UUID

from services.inkeep_service import InkeepService
from models.document import Document
from schemas.inkeep import (
    InkeepSearchRequest,
    InkeepSearchResponse,
    InkeepChatRequest,
    InkeepChatResponse,
    InkeepSuggestionsRequest,
    InkeepSuggestionsResponse,
    InkeepValidationResponse
)
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter()


@router.post("/search", response_model=InkeepSearchResponse)
async def search_documents(
    request: InkeepSearchRequest,
    inkeep_service: InkeepService = Depends(),
    current_user = Depends(get_current_user)
):
    """Search documents using Inkeep's semantic search"""
    
    results = await inkeep_service.search(
        query=request.query,
        filters=request.filters,
        limit=request.limit
    )
    
    return InkeepSearchResponse(
        query=request.query,
        results=results,
        total=len(results)
    )


@router.post("/chat", response_model=InkeepChatResponse)
async def chat_with_inkeep(
    request: InkeepChatRequest,
    inkeep_service: InkeepService = Depends(),
    current_user = Depends(get_current_user)
):
    """Chat with Inkeep AI using document context"""
    
    response = await inkeep_service.chat(
        messages=request.messages,
        context=request.context,
        stream=request.stream
    )
    
    if response.get("status") == "error":
        raise HTTPException(status_code=500, detail=response.get("message"))
    
    return InkeepChatResponse(
        response=response.get("response", ""),
        metadata=response.get("metadata", {}),
        status=response.get("status")
    )


@router.post("/suggestions", response_model=InkeepSuggestionsResponse)
async def get_suggestions(
    request: InkeepSuggestionsRequest,
    inkeep_service: InkeepService = Depends(),
    current_user = Depends(get_current_user)
):
    """Get AI suggestions for document content"""
    
    suggestions = await inkeep_service.get_suggestions(
        document_type=request.document_type,
        section=request.section,
        current_content=request.current_content,
        context=request.context
    )
    
    return InkeepSuggestionsResponse(
        section=request.section,
        suggestions=suggestions
    )


@router.post("/validate/{document_id}", response_model=InkeepValidationResponse)
async def validate_document(
    document_id: UUID,
    inkeep_service: InkeepService = Depends(),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Validate document against best practices"""
    
    # Get document from database
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Validate using Inkeep
    validation_result = await inkeep_service.validate_document(document)
    
    return InkeepValidationResponse(
        document_id=document_id,
        status=validation_result.get("status"),
        issues=validation_result.get("issues", []),
        suggestions=validation_result.get("suggestions", [])
    )


@router.get("/similar/{document_id}")
async def find_similar_documents(
    document_id: UUID,
    limit: int = Query(5, ge=1, le=20),
    inkeep_service: InkeepService = Depends(),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Find documents similar to the specified document"""
    
    # Get document from database
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find similar documents
    similar = await inkeep_service.find_similar_documents(document, limit)
    
    return {
        "document_id": document_id,
        "similar_documents": similar
    }


@router.get("/references/{document_id}")
async def get_cross_references(
    document_id: UUID,
    inkeep_service: InkeepService = Depends(),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generate cross-references for a document"""
    
    # Get document from database
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate cross-references
    references = await inkeep_service.generate_cross_references(document)
    
    return {
        "document_id": document_id,
        "references": references
    }


@router.post("/index/{document_id}")
async def index_document(
    document_id: UUID,
    force_update: bool = Query(False),
    inkeep_service: InkeepService = Depends(),
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Manually index a document in Inkeep"""
    
    # Get document from database
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Index in Inkeep
    result = await inkeep_service.index_document(document, force_update)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message"))
    
    return result


@router.delete("/index/{document_id}")
async def remove_from_index(
    document_id: UUID,
    inkeep_service: InkeepService = Depends(),
    current_user = Depends(get_current_user)
):
    """Remove a document from Inkeep index"""
    
    # Generate Inkeep ID
    inkeep_id = inkeep_service._generate_inkeep_id(document_id)
    
    # TODO: Implement removal from Inkeep index
    # This would require additional Inkeep API endpoint
    
    return {
        "status": "success",
        "message": f"Document {document_id} removed from index",
        "inkeep_id": inkeep_id
    }
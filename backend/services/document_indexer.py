from typing import Optional
from celery import Celery
from sqlalchemy.orm import Session
import asyncio

from models.document import Document, DocumentStatus
from services.inkeep_service import InkeepService
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize Celery
celery = Celery(
    "document_indexer",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)


class DocumentIndexer:
    """Service for managing document indexing pipeline with Inkeep"""
    
    def __init__(self):
        self.inkeep_service = InkeepService()
        self.auto_index = settings.INKEEP_INDEX_ON_CREATE
    
    async def on_document_created(
        self,
        document: Document,
        db: Session
    ) -> None:
        """Handle document creation event"""
        
        if not self.auto_index:
            return
        
        try:
            # Only index approved documents or drafts if configured
            if document.status in [DocumentStatus.APPROVED, DocumentStatus.DRAFT]:
                # Schedule async indexing task
                index_document_task.delay(str(document.id))
                logger.info(f"Scheduled indexing for document {document.id}")
        
        except Exception as e:
            logger.error(f"Error scheduling document indexing: {str(e)}")
    
    async def on_document_updated(
        self,
        document: Document,
        changes: dict,
        db: Session
    ) -> None:
        """Handle document update event"""
        
        try:
            # Check if significant changes were made
            significant_changes = self._check_significant_changes(changes)
            
            if significant_changes:
                # Re-index the document
                await self.inkeep_service.index_document(document, force_update=True)
                logger.info(f"Re-indexed document {document.id} after updates")
                
                # If status changed to approved, ensure it's indexed
                if changes.get("status") == DocumentStatus.APPROVED:
                    await self._ensure_indexed(document)
        
        except Exception as e:
            logger.error(f"Error updating document index: {str(e)}")
    
    async def on_document_deleted(
        self,
        document_id: str
    ) -> None:
        """Handle document deletion event"""
        
        try:
            # Remove from Inkeep index
            inkeep_id = self.inkeep_service._generate_inkeep_id(document_id)
            # TODO: Implement removal from Inkeep when API supports it
            logger.info(f"Document {document_id} marked for removal from index")
        
        except Exception as e:
            logger.error(f"Error removing document from index: {str(e)}")
    
    async def index_all_documents(
        self,
        db: Session,
        document_type: Optional[str] = None,
        status: Optional[DocumentStatus] = None
    ) -> dict:
        """Bulk index all documents matching criteria"""
        
        try:
            # Build query
            query = db.query(Document)
            
            if document_type:
                query = query.filter(Document.type == document_type)
            
            if status:
                query = query.filter(Document.status == status)
            else:
                # Default to approved documents only
                query = query.filter(Document.status == DocumentStatus.APPROVED)
            
            documents = query.all()
            
            # Index documents
            results = {
                "total": len(documents),
                "indexed": 0,
                "skipped": 0,
                "failed": 0
            }
            
            for document in documents:
                result = await self.inkeep_service.index_document(document)
                
                if result.get("status") == "success":
                    results["indexed"] += 1
                elif result.get("status") == "exists":
                    results["skipped"] += 1
                else:
                    results["failed"] += 1
                    logger.error(f"Failed to index document {document.id}: {result.get('message')}")
            
            logger.info(f"Bulk indexing completed: {results}")
            return results
        
        except Exception as e:
            logger.error(f"Error in bulk indexing: {str(e)}")
            return {
                "error": str(e),
                "total": 0,
                "indexed": 0,
                "skipped": 0,
                "failed": 0
            }
    
    async def sync_with_inkeep(
        self,
        db: Session
    ) -> dict:
        """Synchronize database documents with Inkeep index"""
        
        try:
            # Get all approved documents from database
            db_documents = db.query(Document).filter(
                Document.status == DocumentStatus.APPROVED
            ).all()
            
            # TODO: Get all documents from Inkeep index
            # This would require Inkeep API support for listing indexed documents
            
            # For now, just ensure all approved documents are indexed
            sync_results = {
                "documents_checked": len(db_documents),
                "newly_indexed": 0,
                "updated": 0,
                "removed": 0
            }
            
            for document in db_documents:
                result = await self.inkeep_service.index_document(document, force_update=False)
                
                if result.get("status") == "success":
                    sync_results["newly_indexed"] += 1
                elif result.get("status") == "exists":
                    # Check if update is needed based on updated_at
                    # For now, skip
                    pass
            
            logger.info(f"Sync completed: {sync_results}")
            return sync_results
        
        except Exception as e:
            logger.error(f"Error syncing with Inkeep: {str(e)}")
            return {"error": str(e)}
    
    def _check_significant_changes(self, changes: dict) -> bool:
        """Determine if changes are significant enough to trigger re-indexing"""
        
        # List of fields that trigger re-indexing when changed
        significant_fields = [
            "title",
            "content",
            "summary",
            "status",
            "type"
        ]
        
        for field in significant_fields:
            if field in changes:
                return True
        
        return False
    
    async def _ensure_indexed(self, document: Document) -> None:
        """Ensure a document is indexed in Inkeep"""
        
        result = await self.inkeep_service.index_document(document, force_update=False)
        
        if result.get("status") == "error":
            logger.error(f"Failed to ensure document {document.id} is indexed: {result.get('message')}")


# Celery Tasks
@celery.task(name="index_document")
def index_document_task(document_id: str):
    """Celery task to index a document asynchronously"""
    
    try:
        from utils.database import SessionLocal
        
        # Create database session
        db = SessionLocal()
        
        # Get document
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if document:
            # Run async indexing
            indexer = DocumentIndexer()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            result = loop.run_until_complete(
                indexer.inkeep_service.index_document(document)
            )
            
            logger.info(f"Document {document_id} indexed: {result}")
            return result
        else:
            logger.error(f"Document {document_id} not found for indexing")
            return {"status": "error", "message": "Document not found"}
    
    except Exception as e:
        logger.error(f"Error in index_document_task: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery.task(name="bulk_index_documents")
def bulk_index_documents_task(
    document_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Celery task to bulk index documents"""
    
    try:
        from utils.database import SessionLocal
        
        # Create database session
        db = SessionLocal()
        
        # Run bulk indexing
        indexer = DocumentIndexer()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            indexer.index_all_documents(db, document_type, status)
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error in bulk_index_documents_task: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery.task(name="sync_inkeep_index")
def sync_inkeep_index_task():
    """Celery task to sync documents with Inkeep index"""
    
    try:
        from utils.database import SessionLocal
        
        # Create database session
        db = SessionLocal()
        
        # Run sync
        indexer = DocumentIndexer()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            indexer.sync_with_inkeep(db)
        )
        
        return result
    
    except Exception as e:
        logger.error(f"Error in sync_inkeep_index_task: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


# Schedule periodic sync task
celery.conf.beat_schedule = {
    'sync-inkeep-index': {
        'task': 'sync_inkeep_index',
        'schedule': 3600.0,  # Run every hour
    },
}
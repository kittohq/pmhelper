from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from utils.database import Base


class WorkflowType(str, enum.Enum):
    PMD_TO_SPEC = "pmd_to_spec"
    DOCUMENT_UPDATE = "document_update"
    APPROVAL = "approval"
    REVIEW = "review"


class WorkflowStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING_INPUT = "waiting_input"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(WorkflowType), nullable=False)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.PENDING)
    
    # Workflow data
    input_data = Column(JSON, nullable=False)
    output_data = Column(JSON)
    config = Column(JSON, default={})
    
    # Progress tracking
    current_step = Column(String(100))
    total_steps = Column(Integer, default=1)
    completed_steps = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    
    # Error handling
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_by = relationship("User", back_populates="workflows")
    
    # Related documents
    source_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    target_document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    
    source_document = relationship("Document", foreign_keys=[source_document_id])
    target_document = relationship("Document", foreign_keys=[target_document_id])
    
    # Steps
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    
    # Approvals
    approvals = relationship("WorkflowApproval", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey('workflows.id'))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.PENDING)
    
    # Step data
    input_data = Column(JSON)
    output_data = Column(JSON)
    
    # Execution details
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)
    
    # Error handling
    error_message = Column(Text)
    
    # Order
    step_order = Column(Integer, nullable=False)
    
    workflow = relationship("Workflow", back_populates="steps")


class WorkflowApproval(Base):
    __tablename__ = "workflow_approvals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey('workflows.id'))
    approver_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Approval details
    approved = Column(Boolean)
    comments = Column(Text)
    required = Column(Boolean, default=True)
    
    # Timestamps
    requested_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime)
    
    workflow = relationship("Workflow", back_populates="approvals")
    approver = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Notification content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50))  # info, warning, error, success
    
    # Related entities
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'), nullable=True)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey('workflows.id'), nullable=True)
    
    # Status
    read = Column(Boolean, default=False)
    action_required = Column(Boolean, default=False)
    action_url = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)
    
    user = relationship("User", back_populates="notifications")
    document = relationship("Document")
    workflow = relationship("Workflow")
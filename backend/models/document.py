from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Table, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from utils.database import Base


class DocumentType(str, enum.Enum):
    PMD = "pmd"
    SPEC = "spec"
    PRD = "prd"
    DESIGN = "design"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    ARCHIVED = "archived"


# Association table for document linking
document_links = Table(
    'document_links',
    Base.metadata,
    Column('parent_id', UUID(as_uuid=True), ForeignKey('documents.id'), primary_key=True),
    Column('child_id', UUID(as_uuid=True), ForeignKey('documents.id'), primary_key=True)
)

# Association table for document stakeholders
document_stakeholders = Table(
    'document_stakeholders',
    Base.metadata,
    Column('document_id', UUID(as_uuid=True), ForeignKey('documents.id'), primary_key=True),
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('role', String(50))  # reviewer, approver, contributor
)


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(DocumentType), nullable=False)
    title = Column(String(255), nullable=False)
    version = Column(String(20), default="1.0.0")
    status = Column(Enum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # Content
    content = Column(JSON, nullable=False)
    summary = Column(Text)
    
    # Metadata
    metadata = Column(JSON, default={})
    tags = Column(JSON, default=[])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_by = relationship("User", back_populates="documents", foreign_keys=[created_by_id])
    
    # Linked documents
    linked_documents = relationship(
        "Document",
        secondary=document_links,
        primaryjoin=id == document_links.c.parent_id,
        secondaryjoin=id == document_links.c.child_id,
        backref="parent_documents"
    )
    
    # Version history
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    
    # Comments
    comments = relationship("Comment", back_populates="document", cascade="all, delete-orphan")
    
    # Change history
    changes = relationship("Change", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    __tablename__ = "document_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    version = Column(String(20), nullable=False)
    content = Column(JSON, nullable=False)
    change_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    document = relationship("Document", back_populates="versions")
    created_by = relationship("User")


class Change(Base):
    __tablename__ = "changes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    field = Column(String(100))
    old_value = Column(JSON)
    new_value = Column(JSON)
    change_type = Column(String(50))  # add, update, delete
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    document = relationship("Document", back_populates="changes")
    created_by = relationship("User")


class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id'))
    content = Column(Text, nullable=False)
    section = Column(String(100))  # Which section of the document
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    document = relationship("Document", back_populates="comments")
    created_by = relationship("User")
    replies = relationship("CommentReply", back_populates="comment", cascade="all, delete-orphan")


class CommentReply(Base):
    __tablename__ = "comment_replies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(UUID(as_uuid=True), ForeignKey('comments.id'))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    comment = relationship("Comment", back_populates="replies")
    created_by = relationship("User")
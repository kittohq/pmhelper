const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['prd', 'spec', 'roadmap', 'user-story', 'epic', 'feature', 'other'],
    default: 'other'
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    version: {
      type: Number,
      default: 1
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    wordCount: Number,
    readTime: Number,
    inkeepIndexed: {
      type: Boolean,
      default: false
    },
    inkeepId: String,
    inkeepScore: Number
  },
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiGeneratedContent: {
    suggestions: [String],
    improvements: [String],
    validation: {
      score: Number,
      issues: [String],
      checkedAt: Date
    }
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

documentSchema.index({ title: 'text', content: 'text', tags: 1 });
documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ 'metadata.inkeepId': 1 });

documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.content) {
    const words = this.content.split(/\s+/).length;
    this.metadata.wordCount = words;
    this.metadata.readTime = Math.ceil(words / 200);
  }
  
  next();
});

documentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Document', documentSchema);
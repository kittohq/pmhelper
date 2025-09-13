const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Workflow name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['sequential', 'parallel', 'conditional', 'custom'],
    default: 'sequential'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'active'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  steps: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['manual', 'automated', 'approval', 'notification', 'ai-task'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed', 'skipped'],
      default: 'pending'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    config: {
      action: String,
      parameters: mongoose.Schema.Types.Mixed,
      aiModel: String,
      prompt: String,
      timeout: Number,
      retryCount: {
        type: Number,
        default: 0
      }
    },
    dependencies: [String],
    output: mongoose.Schema.Types.Mixed,
    error: String,
    startedAt: Date,
    completedAt: Date
  }],
  triggers: [{
    type: {
      type: String,
      enum: ['manual', 'schedule', 'webhook', 'event', 'document-change'],
      required: true
    },
    config: {
      schedule: String,
      webhookUrl: String,
      event: String,
      documentType: String,
      condition: String
    }
  }],
  variables: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  execution: {
    currentStep: String,
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    attempts: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    onComplete: [{
      type: String,
      enum: ['email', 'slack', 'webhook'],
      config: mongoose.Schema.Types.Mixed
    }],
    onFailure: [{
      type: String,
      enum: ['email', 'slack', 'webhook'],
      config: mongoose.Schema.Types.Mixed
    }]
  },
  metrics: {
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulRuns: {
      type: Number,
      default: 0
    },
    failedRuns: {
      type: Number,
      default: 0
    },
    averageDuration: Number,
    lastRunAt: Date
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

workflowSchema.index({ owner: 1, status: 1 });
workflowSchema.index({ 'triggers.type': 1 });

workflowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

workflowSchema.methods.getNextStep = function() {
  const pendingSteps = this.steps.filter(step => step.status === 'pending');
  if (pendingSteps.length === 0) return null;
  
  for (const step of pendingSteps) {
    if (!step.dependencies || step.dependencies.length === 0) {
      return step;
    }
    
    const allDependenciesComplete = step.dependencies.every(depId => {
      const depStep = this.steps.find(s => s.id === depId);
      return depStep && depStep.status === 'completed';
    });
    
    if (allDependenciesComplete) {
      return step;
    }
  }
  
  return null;
};

module.exports = mongoose.model('Workflow', workflowSchema);
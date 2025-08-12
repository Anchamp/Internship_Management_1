// models/DemoPresentation.ts
import mongoose, { Schema, models } from "mongoose";

const demoPresentationSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
    trim: true,
  },
  organizationId: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: String, // mentor username
    required: true,
    trim: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // duration in minutes
    required: true,
    default: 30,
    min: 15,
    max: 240,
  },
  location: {
    type: String,
    default: 'Virtual',
  },
  meetingLink: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/.+/.test(v); // Basic URL validation
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  evaluationCriteria: [{
    criterion: {
      type: String,
      required: true,
      trim: true,
    },
    maxPoints: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
      max: 100,
    },
    description: {
      type: String,
      default: '',
    },
  }],
  assignedInterns: [{
    internUsername: {
      type: String,
      required: true,
      trim: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['assigned', 'confirmed', 'completed', 'missed'],
      default: 'assigned',
    },
    presentationOrder: {
      type: Number,
      default: 1,
      min: 1,
    },
  }],
  submissions: [{
    internUsername: {
      type: String,
      required: true,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    presentationTitle: {
      type: String,
      default: '',
    },
    materials: [{
      fileName: String,
      fileUrl: String,
      fileType: {
        type: String,
        enum: ['pdf', 'pptx', 'docx', 'zip', 'other'],
        default: 'other',
      },
    }],
    notes: {
      type: String,
      default: '',
    },
  }],
  evaluations: [{
    internUsername: {
      type: String,
      required: true,
      trim: true,
    },
    evaluatedBy: {
      type: String,
      required: true,
      trim: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
    scores: [{
      criterion: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
        min: 0,
      },
      maxPoints: {
        type: Number,
        required: true,
        min: 1,
      },
    }],
    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    maxTotalScore: {
      type: Number,
      required: true,
      min: 1,
    },
    comments: {
      type: String,
      default: '',
    },
    strengths: [{
      type: String,
      trim: true,
    }],
    improvements: [{
      type: String,
      trim: true,
    }],
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['24_hours', '2_hours', '30_minutes'],
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // This automatically handles createdAt and updatedAt
});

// Index for better query performance
demoPresentationSchema.index({ organizationId: 1, createdBy: 1 });
demoPresentationSchema.index({ 'assignedInterns.internUsername': 1 });
demoPresentationSchema.index({ scheduledDate: 1, status: 1 });

// Virtual for computed fields
demoPresentationSchema.virtual('isOverdue').get(function() {
  return new Date() > this.scheduledDate && this.status !== 'completed';
});

demoPresentationSchema.virtual('assignedInternsCount').get(function() {
  return this.assignedInterns?.length || 0;
});

demoPresentationSchema.virtual('submissionsCount').get(function() {
  return this.submissions?.length || 0;
});

demoPresentationSchema.virtual('evaluationsCount').get(function() {
  return this.evaluations?.length || 0;
});

// Pre-save middleware for validation
demoPresentationSchema.pre('save', function(next) {
  // Ensure scheduled date is in the future for new presentations
  if (this.isNew && this.scheduledDate <= new Date()) {
    next(new Error('Scheduled date must be in the future'));
    return;
  }
  
  // Validate evaluation criteria
  if (this.evaluationCriteria.length === 0) {
    next(new Error('At least one evaluation criterion is required'));
    return;
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  next();
});

// Ensure virtuals are included in JSON output
demoPresentationSchema.set('toJSON', { virtuals: true });
demoPresentationSchema.set('toObject', { virtuals: true });

const DemoPresentation = models.DemoPresentation || mongoose.model("DemoPresentation", demoPresentationSchema);

export default DemoPresentation;
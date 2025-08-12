import mongoose, { Schema, models, Document } from "mongoose";

export interface AssignmentDocument extends Document {
  assignmentTeamName: string;
  assignmentName: string;
  assignmentFrom: string;
  deadline: Date;
  status: 'pending' | 'active' | 'review' | 'completed' | 'posted' | 'submitted' | 'under_review' | 'reviewed';
  description: string;
  assignedTo: string[];
  mentorFeedback?: string;
  organizationName: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // NEW FIELDS for enhanced functionality
  submissions: Array<{
    internUsername: string;
    submissionType: 'link' | 'pdf';
    submissionContent: string;
    fileName?: string;
    fileSize?: number;
    submittedAt: Date;
    status: 'submitted' | 'under_review' | 'reviewed';
    isLateSubmission?: boolean;
    mentorReview?: {
      rating: number;
      comments: string;
      reviewedAt: Date;
      reviewedBy: string;
    };
  }>;
  maxFileSize: number;
  allowedSubmissionTypes: string[];
  instructions?: string;
}

const assignmentSchema = new Schema({
  assignmentTeamName: {
    type: String,
    required: true,
  },
  assignmentName: {
    type: String,
    required: true,
    trim: true,
  },
  assignmentFrom: {
    type: String,
    required: true,
    trim: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'review', 'completed', 'posted', 'submitted', 'under_review', 'reviewed'],
    required: true,
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: [{
    type: String,
    default: 'all',
  }],
  mentorFeedback: String, // Keep for backward compatibility
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
  
  // NEW ENHANCED FIELDS
  submissions: [{
    internUsername: {
      type: String,
      required: true,
    },
    submissionType: {
      type: String,
      enum: ['link', 'pdf'],
      required: true,
    },
    submissionContent: {
      type: String,
      required: true,
    },
    fileName: String,
    fileSize: Number,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'reviewed'],
      default: 'submitted',
    },
    isLateSubmission: {
      type: Boolean,
      default: false,
    },
    mentorReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
      reviewedAt: Date,
      reviewedBy: String,
    }
  }],
  
  maxFileSize: {
    type: Number,
    default: 1048576, // 1MB
  },
  allowedSubmissionTypes: [{
    type: String,
    enum: ['link', 'pdf'],
    default: ['link', 'pdf'],
  }],
  instructions: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  strict: false
});

assignmentSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Assignment = models.Assignment || mongoose.model<AssignmentDocument>("Assignment", assignmentSchema);

export default Assignment;
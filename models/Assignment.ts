// models/Assignment.ts
import mongoose, { Schema, models } from "mongoose";

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
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'posted', 'active', 'under_review', 'reviewed', 'completed'],
      required: true,
      default: 'pending',
    },
    description: {
      type: String,
      required: true,
    },
    instructions: String,
    assignedTo: [{
      type: String,
      default: 'all',
    }],
    submissions: [{
      internUsername: {
        type: String,
        required: true
      },
      submissionType: {
        type: String,
        enum: ['link', 'pdf'],
        required: true
      },
      submissionContent: String,
      fileUrl: String,
      fileName: String,
      submittedAt: {
        type: Date,
        default: Date.now
      },
      isLateSubmission: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['submitted', 'under_review', 'reviewed'],
        default: 'submitted'
      },
      mentorReview: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comments: String,
        reviewedAt: Date,
        reviewedBy: String
      }
    }],
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    },
    allowedSubmissionTypes: [{
      type: String,
      enum: ['link', 'pdf'],
      default: ['link', 'pdf']
    }],
    acceptsSubmissions: {
      type: Boolean,
      default: true
    },
    mentorFeedback: String, // Legacy field
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {strict: false}
);

assignmentSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Assignment = models.Assignment || mongoose.model("Assignment", assignmentSchema);

export default Assignment;
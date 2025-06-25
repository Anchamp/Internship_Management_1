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
      enum: ['pending', 'active', 'review', 'completed'],
      required: true,
      default: 'pending',
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: [{
      type: String,
      default: 'none',
    }],
    mentorFeedback: String,
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


import mongoose, { Schema, models, Document } from "mongoose";

// Define TypeScript interface for the OverallFeedback document
interface IOverallFeedback extends Document {
  name: string;
  designation: string;
  rating: number;
  description: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for overall feedback
const OverallFeedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    description: {
      type: String,
      required: [true, 'Feedback description is required'],
      trim: true,
      minlength: [10, 'Feedback should be at least 10 characters long']
    },
    // You can add more fields if needed
    isApproved: {
      type: Boolean,
      default: true // Set to false if you want admin approval before displaying
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

// Update the timestamp when document is modified
OverallFeedbackSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

// Check if model exists already to prevent overwriting during hot reloads in development
const OverallFeedback = models.OverallFeedback || mongoose.model<IOverallFeedback>("OverallFeedback", OverallFeedbackSchema);

export default OverallFeedback;

import mongoose, { Schema, models, Document } from "mongoose";

export interface FeedbackDocument extends Document {
  userId: mongoose.Types.ObjectId;
  providedBy: mongoose.Types.ObjectId;
  rating: number;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    providedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      required: [true, "Feedback description is required"],
      minlength: [10, "Description should be at least 10 characters long"],
    },
    type: {
      type: String,
      enum: ["performance", "project", "mentor", "general"],
      default: "general",
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = models.Feedback || mongoose.model<FeedbackDocument>("Feedback", feedbackSchema);

export default Feedback;

import mongoose, { Schema, models } from "mongoose";

const teamSchema = new Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mentors: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    interns: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    panelists: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    description: {
      type: String,
      required: true,
      trim: true,
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
    status: {
      type: String,
      enum: ["active", "underReview", "completed"],
      default: "active",
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

teamSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Team = models.Team || mongoose.model("Team", teamSchema);

export default Team;

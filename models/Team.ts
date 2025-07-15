import mongoose, { Schema, models, Document } from "mongoose";

export interface TeamDocument extends Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  lead: mongoose.Types.ObjectId;
  projects: mongoose.Types.ObjectId[];
  organization: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Team description is required"],
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    lead: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team lead is required"],
    },
    projects: [{
      type: Schema.Types.ObjectId,
      ref: "Project",
    }],
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Pre-save hook to update the updatedAt timestamp
teamSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Team = models.Team || mongoose.model<TeamDocument>("Team", teamSchema);

export default Team;
teamSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});



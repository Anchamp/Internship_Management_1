import mongoose, { Schema, models } from "mongoose";

const internshipSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    organizationLogo: {
      type: String, 
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    mode: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
      address: String,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    openings: {
      type: Number,
      required: true,
      min: 1,
    },
    eligibility: {
      type: String,
      required: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    responsibilities: [{
      type: String,
      trim: true,
    }],
    isPaid: {
      type: Boolean,
      required: true,
    },
    stipend: {
      type: String,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    postingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
    postedBy: {
      type: String, // Admin username who posted
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
    },
    applications: [{
      type: Schema.Types.ObjectId,
      ref: 'Intern'
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: true }
);


internshipSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const Internship = models.Internship || mongoose.model("Internship", internshipSchema);

export default Internship;

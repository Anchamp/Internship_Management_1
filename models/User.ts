import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "admin"],
      required: true,
    },
    organizationName: {
      type: String,
      default: "none",
    },
    organizationId: {
      type: String,
      default: null,
    },
    fullName: String,
    phone: String,
    position: String,
    address: String,
    experience: String,
    skills: String,
    bio: String,
    website: String,
    profileImage: String,
    dob: String,
    teams: [String],
    // Add field to track profile submission count
    profileSubmissionCount: {
      type: Number,
      default: 0,
    },
    // Add field to track verification status
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    
    // User Preferences and Settings
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light"
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      weeklyReportReminders: {
        type: Boolean,
        default: true
      },
      teamChatNotifications: {
        type: Boolean,
        default: true
      },
      feedbackNotifications: {
        type: Boolean,
        default: true
      }
    },
    
    // Notification System
    notifications: [{
      type: {
        type: String,
        enum: ["application_update", "team_assignment", "feedback_received", "demo_scheduled", "report_due", "general"]
      },
      title: String,
      message: String,
      read: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      relatedId: String // Can reference team, application, etc.
    }],
    
    // Additional Status Fields
    isActive: {
      type: Boolean,
      default: true
    },

    lastLoginDate: Date,
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Update the timestamp when document is modified
userSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

// Check if model exists already to prevent overwriting during hot reloads in development
const User = models.User || mongoose.model("User", userSchema);

export default User;

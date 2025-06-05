import mongoose from 'mongoose';

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin', 'panelist'],
    required: true,
  },
  organizationName: String,
  organizationId: String,
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
    default: 0
  },
  // Add field to track verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { strict: false });

// Update the timestamp when document is modified
UserSchema.pre('updateOne', function() {
  this.set({ updatedAt: new Date() });
});

// Export the model
export default mongoose.models.User || mongoose.model('User', UserSchema);

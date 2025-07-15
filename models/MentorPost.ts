import mongoose, { Schema, models } from 'mongoose';

const mentorPostSchema = new Schema({
  postTitle: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
    required: true,
  },
  postContent: {
    type: String,
    required: true,
  },
  postType: {
    type: String,
    enum: ['announcement', 'discussion', 'resource'],
    required: true,
  },
  postDate: {
    type: Date,
    default: Date.now,
  },
  teamName: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
})

mentorPostSchema.pre("updateOne", function () {
  this.set({ updatedAt: new Date() });
});

const MentorPost = models.MentorPost || mongoose.model("MentorPost", mentorPostSchema);

export default MentorPost;


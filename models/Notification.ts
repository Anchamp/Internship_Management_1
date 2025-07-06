import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: string;
  role?: string;
  requestorId?: string;
  requestorName?: string;
  status?: string;
  organizationId?: string;
  organizationName?: string;
  message?: string;
  createdAt: Date;
  read: boolean;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  role: { type: String },
  requestorId: { type: String },
  requestorName: { type: String },
  status: { type: String },
  organizationId: { type: String },
  organizationName: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

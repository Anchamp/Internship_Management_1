import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Await the params before using its properties
    const { userId } = await params;
    
    await dbConnect();
    
    // Try to find the user by multiple ID formats
    // Use 'any' type for query to allow MongoDB operators
    let query: any = { userId: userId };
    
    // If it looks like it could be an ObjectId, also search with that format
    if (ObjectId.isValid(userId)) {
      query = { 
        $or: [
          { userId: userId }, // String format
          { userId: new ObjectId(userId) } // ObjectId format
        ] 
      };
    }
    
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    
    // If no notifications found and userId looks like a username, try finding by username
    if (notifications.length === 0 && !ObjectId.isValid(userId)) {
      const user = await User.findOne({ username: userId }).lean();
      
      if (user && user._id) {
        const notificationsByUsername = await Notification.find({ 
          userId: user._id.toString()
        }).sort({ createdAt: -1 }).lean();
        
        return NextResponse.json({ notifications: notificationsByUsername });
      }
    }
    
    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notifications',
      details: error.message
    }, { status: 500 });
  }
}

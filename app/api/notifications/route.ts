import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      userId, 
      type, 
      role, 
      requestorId, 
      requestorName, 
      status, 
      organizationId, 
      organizationName,
      message,
      read = false,
      forOrganizationAdmins = false 
    } = body;
    
    // If forOrganizationAdmins flag is true, find all admins for the organization
    if (forOrganizationAdmins && organizationId) {
      // Find all admin users for the specified organization
      const adminUsers = await User.find({
        role: 'admin',
        $or: [
          { organizationId: organizationId },
          { organizationName: organizationName }
        ]
      }).select('_id');
      
      if (!adminUsers || adminUsers.length === 0) {
        return NextResponse.json(
          { error: "No admin users found for the organization", success: false },
          { status: 404 }
        );
      }
      
      // Create notifications for all admin users
      const notifications = adminUsers.map(admin => ({
        userId: admin._id.toString(),
        type,
        role,
        requestorId,
        requestorName,
        status,
        organizationId,
        organizationName,
        message,
        read,
        createdAt: new Date()
      }));
      
      // Insert all notifications at once
      const createdNotifications = await Notification.insertMany(notifications);
      
      return NextResponse.json({ 
        success: true,
        message: `Created ${createdNotifications.length} notification(s) for organization admins`,
        notifications: createdNotifications
      });
    } 
    // Single notification case
    else if (userId) {
      // Create a single notification
      const notification = new Notification({
        userId,
        type,
        role,
        requestorId,
        requestorName,
        status,
        organizationId,
        organizationName,
        message,
        read,
        createdAt: new Date()
      });
      
      const savedNotification = await notification.save();
      
      return NextResponse.json({ 
        success: true, 
        notification: savedNotification 
      });
    } else {
      return NextResponse.json(
        { error: "Either userId or forOrganizationAdmins with organizationId must be provided", success: false },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification", success: false },
      { status: 500 }
    );
  }
}

// Endpoint to get notifications for a specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID parameter is required", success: false },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find notifications for the user, sorted by most recent first
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to reasonable number
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false
    });
    
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
    
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications", success: false },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';

// This is a temporary debug endpoint to help troubleshoot notification issues
export async function GET() {
  try {
    await dbConnect();
    
    // Get all notifications
    const allNotifications = await Notification.find().lean();
    
    // Count notifications by type
    const countByType = allNotifications.reduce((acc: Record<string, number>, notification) => {
      const type = notification.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Get distinct userIds
    const distinctUserIds = [...new Set(allNotifications.map(n => n.userId))];
    
    // Summary information
    const summary = {
      totalNotifications: allNotifications.length,
      countByType,
      distinctUserIds,
      distinctUserIdCount: distinctUserIds.length,
      sampleNotifications: allNotifications.slice(0, 5) // First 5 notifications as samples
    };
    
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error in notifications debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to debug notifications',
      details: error.message
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }
    
    const result = await Notification.findByIdAndDelete(notificationId);
    
    if (!result) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ 
      error: 'Failed to delete notification', 
      details: error.message 
    }, { status: 500 });
  }
}

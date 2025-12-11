import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await the params Promise (Next.js 15 requirement)
    const resolvedParams = await params;
    const userId = resolvedParams.userId;
    
    // Make sure we're safely handling the userId
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    await dbConnect();
    
    const count = await Notification.countDocuments({ 
      userId: userId,
      read: false
    });
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error counting notifications:', error);
    return NextResponse.json({ 
      error: 'Failed to count notifications',
      details: error.message
    }, { status: 500 });
  }
}

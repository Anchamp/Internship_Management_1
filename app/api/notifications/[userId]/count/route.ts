import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';

// Use a slightly different pattern for the handler that avoids direct property access
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Make sure we're safely handling the userId
    if (!params || !params.userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    const userId = params.userId;
    
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
      details: error.message
    }, { status: 500 });
  }
}

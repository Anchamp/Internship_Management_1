import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if user with the provided email exists
    const existingUser = await User.findOne({ email });
    
    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser ? 'Email found' : 'Email not found'
    });
    
  } catch (error: any) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

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
    const existingUserAsEmployee = await User.findOne({ email });
    const existingUserAsIntern = await Intern.findOne({ email });
    
    if (!existingUserAsEmployee && !existingUserAsIntern) {
      return NextResponse.json({
        exists: false,
        message: 'Email not found',
      });
    } else {
      return NextResponse.json({
        exists: true,
        message: 'Email found',
      });
    }
    
  } catch (error: any) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email', details: error.message },
      { status: 500 }
    );
  }
}

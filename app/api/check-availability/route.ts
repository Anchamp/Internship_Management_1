import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { field, value } = await request.json();
    
    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      );
    }
    
    // Only allow checking username or email
    if (field !== 'username' && field !== 'email') {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    // Create a query object dynamically
    const query = { [field]: value };
    const user = await User.findOne(query);
    
    return NextResponse.json({
      available: !user,
      message: user ? `${field === 'username' ? 'Username' : 'Email'} is already taken` : null
    });
  } catch (error: any) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Server error during availability check' },
      { status: 500 }
    );
  }
}

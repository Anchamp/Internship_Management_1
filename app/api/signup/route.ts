import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { username, email, password, role, organizationName, organizationId } = body;
    
    // Validate input
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingUser) {
      // Check which field caused the conflict
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Prepare user data based on role
    const userData = {
      username,
      email,
      password,
      role,
      organizationName: role === 'admin' ? organizationName : 'none',
      organizationId: ['mentor', 'panelist'].includes(role) ? organizationId : null
    };
    
    // Create new user
    const newUser = new User(userData);
    await newUser.save();
    
    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

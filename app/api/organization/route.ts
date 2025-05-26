import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Helper function to get user ID from token
const getUserFromToken = (req: NextRequest) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get user from token
    const userData = getUserFromToken(req);
    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin users can access organization details' },
        { status: 403 }
      );
    }
    
    // Get organization details
    const user = await User.findById(userData.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      name: user.organizationName || 'Your Organization',
      id: user._id,
      // Add any other organization details you need
    });
    
  } catch (error: any) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization details', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, password, confirmPassword } = body;
    
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email and Password and Confirm Password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const userAsEmployee = await User.findOne({ email });
    const userAsIntern = await Intern.findOne({ email });

    if (!userAsEmployee && !userAsIntern) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 401 }
      );
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (userAsEmployee) {
      user = userAsEmployee;
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
    } else {
      user = userAsIntern;
      await Intern.updateOne(
        { _id: user._id},
        { $set: { password: hashedPassword } }
      );
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Password reset successful',
      token,
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error.message },
      { status: 500 }
    );
  }
}

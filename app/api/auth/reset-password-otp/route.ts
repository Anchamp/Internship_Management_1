import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

// Create a transporter using Gmail SMTP
// Note: For production, use environment variables for these credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com', // Replace with your Gmail or use env variable
    pass: process.env.EMAIL_PASS || 'your_app_password', // Use app password for Gmail
  },
});

// Generate a random 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Store OTPs with expiration (in a real app, use Redis or a database)
// This is a simple in-memory store for demonstration
const otpStore = new Map<string, { otp: string; expiry: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify that the email exists in the database
    await dbConnect();
    let user = await User.findOne({ email });
    let intern = await Intern.findOne({ email });
    
    if (!user && !intern) {
      return NextResponse.json({ 
        error: 'No account is associated with this email' 
      }, { status: 404 });
    }

    if (!user) {
      user = intern;
    }
    // Generate a new OTP
    const otp = generateOTP();
    
    // Store OTP with 10-minute expiration
    otpStore.set(email, { 
      otp, 
      expiry: Date.now() + 10 * 60 * 1000 
    });

    // Password Reset Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_email@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0891B2; text-align: center;">InternshipHub Password Reset</h2>
          <p style="font-size: 16px;">You recently requested to reset your password for your InternshipHub account. Use the verification code below to complete the process:</p>
          <div style="text-align: center; padding: 15px; background-color: #f8fafc; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
          <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} InternshipHub. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true,
      message: 'Password reset code sent successfully' 
    });
    
  } catch (error: any) {
    console.error('Error sending password reset OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to send password reset code',
      details: error.message 
    }, { status: 500 });
  }
}

// Endpoint to verify OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and verification code are required' 
      }, { status: 400 });
    }

    // Check if OTP exists and is valid
    const storedOTPData = otpStore.get(email);
    
    if (!storedOTPData) {
      return NextResponse.json({ 
        success: false, 
        message: 'No verification code found for this email' 
      }, { status: 400 });
    }

    // Check if OTP has expired
    if (storedOTPData.expiry < Date.now()) {
      // Remove expired OTP
      otpStore.delete(email);
      
      return NextResponse.json({ 
        success: false, 
        message: 'Verification code has expired' 
      }, { status: 400 });
    }

    // Check if OTP matches
    if (storedOTPData.otp !== otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid verification code' 
      }, { status: 400 });
    }

    // If OTP is valid, remove it from the store (one-time use)
    otpStore.delete(email);

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
    
  } catch (error: any) {
    console.error('Error verifying password reset OTP:', error);
    return NextResponse.json({ 
      error: 'Failed to verify code', 
      details: error.message 
    }, { status: 500 });
  }
}

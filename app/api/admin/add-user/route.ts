import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { getNewUserEmailTemplate } from '@/utils/emailTemplates';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
});

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { username, email, password, organizationName } = body;
    
    // Input validation
    if (!username || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the admin's organization
    const adminOrg = await User.findOne({
      role: 'admin',
      organizationName: organizationName
    });

    if (!adminOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    const existingIntern = await Intern.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser || existingIntern) {
      if ((existingUser?.email || existingIntern?.email) === email) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      if ((existingUser?.username || existingIntern?.username) === username) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    // Store original password before hashing
    const originalPassword = password;
    
    // Hash password - using the same method as in the User model
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data - Important: The User model might hash again, 
    // so we need to use MongoDB operations directly
    const userDataToSave = {
      username,
      email,
      password: hashedPassword,  // Store already hashed password
      role: 'employee',
      organizationName: 'none',
      organizationId: adminOrg.organizationId,
      verificationStatus: 'pending',
      profileSubmissionCount: 0,
      teams: [],
      preferences: {
        theme: 'light',
        emailNotifications: true,
        weeklyReportReminders: true,
        teamChatNotifications: true,
        feedbackNotifications: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Skip Mongoose middleware by inserting directly - prevents double hashing
    const client = await dbConnect();
    const db = client.connection.db;
    const collection = db.collection('users');
    
    // Insert user directly
    const result = await collection.insertOne(userDataToSave);
    
    // Get inserted user
    const newUser = await collection.findOne({ _id: result.insertedId });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    // After successful user creation, send welcome email with credentials
    try {
      const emailTemplate = getNewUserEmailTemplate(
        username, 
        originalPassword, 
        email,
        organizationName
      );
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your_email@gmail.com',
        to: email,
        subject: 'Your New InternshipHub Account',
        html: emailTemplate,
      };
      
      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Error sending welcome email:', emailError);
      // Continue with response - user is still created successfully
    }

    // Return success without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
      emailSent: true
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}
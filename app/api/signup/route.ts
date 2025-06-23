import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

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
    
    // Additional validation for admin role - require organizationName
    if (role === 'admin' && !organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required for admin accounts' },
        { status: 400 }
      );
    }
    
    // Additional validation for mentor/panelist roles - require organizationId
    if (role === 'employee' && !organizationId) {
      return NextResponse.json(
        { error: 'Organization selection is required for employee accounts' },
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
    
    // For admin role, also check if organization name is already taken
    if (role === 'admin' && organizationName) {
      const existingOrg = await User.findOne({
        role: 'admin',
        organizationName: organizationName
      });
      
      if (existingOrg) {
        return NextResponse.json(
          { error: 'Organization name already exists' },
          { status: 409 }
        );
      }
    }
    
    // For mentor/panelist roles, verify that selected organizationId exists
    if (role === 'employee' && organizationId) {
      // Log the organizationId for debugging
      console.log(`Checking if organization exists: ${organizationId}`);
      
      // Find admin user with the matching organizationId (not using _id)
      const orgExists = await User.findOne({
        role: 'admin',
        organizationId: organizationId // Look for the formatted organizationId directly
      });
      
      if (!orgExists) {
        console.error(`Organization with ID ${organizationId} not found`);
        return NextResponse.json(
          { error: 'Selected organization does not exist. Please try again.' },
          { status: 400 }
        );
      }
      
      console.log(`Organization found: ${orgExists.organizationName} with ID ${organizationId}`);
    }
    
    // Generate or set organization details based on role
    let orgId = null;
    let orgName = 'none';
    
    if (role === 'admin') {
      // Create a unique ID based on organization name and timestamp
      const timestamp = new Date().getTime();
      const nameSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      orgId = `org_${nameSlug}_${timestamp}`; // Formatted organization ID for admins
      orgName = organizationName; // Admins keep their organization name
    } else if (role === '') {
      // For mentors and panelists, use the provided organizationId but set name to "none"
      orgId = organizationId; // This should be the formatted ID from the frontend dropdown
      orgName = 'none';
    }
    
    // Prepare user data based on role
    const userData: any = {
      username,
      email,
      password,
      role,
      organizationName: orgName,
      organizationId: orgId
    };
    
    // For admin users, remove profileSubmissionCount and verificationStatus fields completely
    if (role === 'admin') {
      userData.profileSubmissionCount = undefined; // Remove this field for admins
      userData.verificationStatus = undefined; // Remove verification status for admins
    }
    
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

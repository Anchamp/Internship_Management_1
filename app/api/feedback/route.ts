import { NextResponse } from 'next/server';
import OverallFeedback from '@/models/OverallFeedback';
import mongoose from 'mongoose';

// Connect to MongoDB
const connectToMongoDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  
  await mongoose.connect(MONGODB_URI);
};

// GET handler to retrieve all approved testimonials
export async function GET() {
  try {
    await connectToMongoDB();
    
    // Get all approved testimonials, sorted by most recent first
    const testimonials = await OverallFeedback.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(6); // Limit to prevent too many testimonials
    
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { message: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST handler to submit new feedback
export async function POST(request: Request) {
  try {
    await connectToMongoDB();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.designation || !body.rating || !body.description) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Create a new testimonial with validation
      const newTestimonial = await OverallFeedback.create({
        name: body.name,
        designation: body.designation,
        rating: body.rating,
        description: body.description,
        isApproved: true // You can change this to false if you want admin approval
      });
      
      return NextResponse.json(newTestimonial, { status: 201 });
    } catch (validationError: any) {
      // Handle mongoose validation errors
      if (validationError.name === 'ValidationError') {
        return NextResponse.json(
          { 
            message: 'Validation failed', 
            errors: validationError.errors 
          },
          { status: 400 }
        );
      }
      throw validationError; // Re-throw if it's not a validation error
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

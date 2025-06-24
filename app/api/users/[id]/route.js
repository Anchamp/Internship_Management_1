import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongoose';

export async function GET(request) {
  try {
    // Get the ID from the URL path segments
    const pathParts = request.nextUrl.pathname.split('/');
    const encodedId = pathParts[pathParts.length - 1]; // Get the encoded username/id from URL path
    
    // Decode the ID to handle spaces and special characters
    const id = decodeURIComponent(encodedId);
    
    // Connect to the database
    await dbConnect();
    
    // Create filter based on whether id is ObjectId or username
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) } 
      : { username: id };
    
    // Use direct MongoDB operations
    const client = await dbConnect();
    const db = client.connection.db;
    const userCollection = db.collection('users');
    const internCollection = db.collection('interns');
    
    // Find the user document
    let user = await userCollection.findOne(filter);
    let intern = await internCollection.findOne(filter);

    if (!user && !intern) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user) {
      user = intern
    }
    
    // Remove sensitive fields
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message
    }, { status: 500 });
  }
}

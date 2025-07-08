// Create this as: /api/debug/user-status/route.ts
// This is a temporary debugging endpoint - remove after fixing the issue

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

export async function GET(request: Request) {
  try {
    const client = await dbConnect();
    const db = client.connection.db;
    const usersCollection = db.collection('users');
    const internsCollection = db.collection('interns');
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Anish2'; // Default to your user
    
    console.log(`🔍 DEBUGGING: Searching for user: ${username}`);
    
    // Check users collection
    const userInUsers = await usersCollection.findOne({ username });
    console.log(`🔍 Users collection: ${userInUsers ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check interns collection  
    const userInInterns = await internsCollection.findOne({ username });
    console.log(`🔍 Interns collection: ${userInInterns ? 'FOUND' : 'NOT FOUND'}`);
    
    let userData = userInUsers || userInInterns;
    let foundIn = userInUsers ? 'users' : (userInInterns ? 'interns' : 'neither');
    
    if (!userData) {
      return NextResponse.json({
        error: 'User not found in either collection',
        username,
        searchedCollections: ['users', 'interns']
      });
    }
    
    // Extract relevant information
    const debugInfo = {
      username: userData.username,
      foundInCollection: foundIn,
      role: userData.role,
      applicationStatus: userData.applicationStatus,
      verificationStatus: userData.verificationStatus,
      appliedInternshipsCount: userData.appliedInternships?.length || 0,
      appliedInternships: userData.appliedInternships?.map((app: any) => ({
        id: app._id,
        idType: typeof app._id,
        internshipId: app.internshipId,
        position: app.position,
        status: app.status,
        appliedDate: app.appliedDate
      })) || []
    };
    
    console.log(`✅ DEBUG INFO:`, JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json({
      success: true,
      debugInfo
    });
    
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}
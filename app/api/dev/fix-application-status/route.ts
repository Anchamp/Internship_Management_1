// app/api/dev/fix-application-status/route.ts
// Create this file to fix existing database records

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  try {
    console.log('=== STARTING APPLICATION STATUS FIX ===');
    
    // Connect to database
    await dbConnect();
    
    // Get direct MongoDB connection
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const internsCollection = db.collection('interns');
    
    // Check current state
    const internsWithInvalidStatus = await internsCollection.find({
      applicationStatus: { $exists: false }
    }).toArray();
    
    console.log(`Found ${internsWithInvalidStatus.length} interns without applicationStatus`);
    
    // Fix 1: Set default applicationStatus for records without it
    const updateResult1 = await internsCollection.updateMany(
      { applicationStatus: { $exists: false } },
      { $set: { applicationStatus: "none" } }
    );
    
    console.log(`Updated ${updateResult1.modifiedCount} records with missing applicationStatus`);
    
    // Fix 2: Check for any invalid enum values and fix them
    const invalidStatuses = await internsCollection.find({
      applicationStatus: { 
        $nin: ["none", "pending", "approved", "rejected", "active", "completed"] 
      }
    }).toArray();
    
    console.log(`Found ${invalidStatuses.length} interns with invalid applicationStatus values`);
    
    let updateResult2 = { modifiedCount: 0 };
    if (invalidStatuses.length > 0) {
      // Log the invalid values for debugging
      invalidStatuses.forEach(intern => {
        console.log(`Intern ${intern.username} has invalid status: ${intern.applicationStatus}`);
      });
      
      // Fix invalid statuses by setting them to "none"
      updateResult2 = await internsCollection.updateMany(
        { 
          applicationStatus: { 
            $nin: ["none", "pending", "approved", "rejected", "active", "completed"] 
          } 
        },
        { $set: { applicationStatus: "none" } }
      );
      
      console.log(`Fixed ${updateResult2.modifiedCount} records with invalid applicationStatus`);
    }
    
    // Fix 3: Ensure all records have the field with proper default
    const updateResult3 = await internsCollection.updateMany(
      { applicationStatus: null },
      { $set: { applicationStatus: "none" } }
    );
    
    console.log(`Fixed ${updateResult3.modifiedCount} records with null applicationStatus`);
    
    // Get final count to verify
    const finalCheck = await internsCollection.find({
      applicationStatus: { $in: ["none", "pending", "approved", "rejected", "active", "completed"] }
    }).toArray();
    
    console.log(`Final verification: ${finalCheck.length} interns have valid applicationStatus`);
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      message: 'Application status field fixed successfully',
      results: {
        missingStatus: updateResult1.modifiedCount,
        invalidStatus: invalidStatuses.length,
        fixedInvalid: updateResult2.modifiedCount,
        fixedNull: updateResult3.modifiedCount,
        totalValid: finalCheck.length
      }
    });
    
  } catch (error: any) {
    console.error('Fix script error:', error);
    return NextResponse.json({
      error: 'Fix script failed',
      details: error.message
    }, { status: 500 });
  }
}
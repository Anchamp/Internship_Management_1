// app/api/dev/fix-intern-migration/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    console.log('=== STARTING COMPREHENSIVE INTERN MIGRATION FIX ===');
    
    // Step 1: Get all interns from User model (if any remain)
    const internsInUserModel = await User.find({ role: 'intern' }).lean();
    console.log(`Found ${internsInUserModel.length} interns still in User model`);
    
    // Step 2: Get all existing interns in Intern model  
    const existingInterns = await Intern.find({}).lean();
    console.log(`Found ${existingInterns.length} interns already in Intern model`);
    
    // Step 3: Get direct MongoDB connection for field renaming
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const internsCollection = db.collection('interns');
    
    let migrationResults = {
      userToInternMigrated: 0,
      fieldNameFixed: 0,
      totalProcessed: 0,
      errors: [] as string[]
    };
    
    // Step 4: Migrate remaining interns from User to Intern model
    if (internsInUserModel.length > 0) {
      console.log('Migrating interns from User to Intern model...');
      
      for (const internFromUser of internsInUserModel) {
        try {
          // Check if this intern already exists in Intern model
          const existingIntern = await Intern.findOne({ 
            $or: [
              { username: internFromUser.username },
              { email: internFromUser.email }
            ]
          });
          
          if (!existingIntern) {
            // Create new intern in Intern model
            const newIntern = {
              ...internFromUser,
              role: 'intern', // Ensure role is set correctly
              // Fix the field name during migration
              appliedInternships: internFromUser.appliedInternships || internFromUser.appliedInternsips || [],
              appliedInternsips: undefined // Remove the typo field
            };
            
            // Remove _id to let MongoDB generate a new one
            delete newIntern._id;
            
            await Intern.create(newIntern);
            migrationResults.userToInternMigrated++;
            console.log(`Migrated intern: ${internFromUser.username}`);
          } else {
            console.log(`Intern ${internFromUser.username} already exists in Intern model`);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error migrating intern ${internFromUser.username}:`, error);
          migrationResults.errors.push(`${internFromUser.username}: ${errorMessage}`);
        }
      }
      
      // Remove migrated interns from User model
      if (migrationResults.userToInternMigrated > 0) {
        const deleteResult = await User.deleteMany({ role: 'intern' });
        console.log(`Deleted ${deleteResult.deletedCount} interns from User model`);
      }
    }
    
    // Step 5: Fix field name typo for existing interns in Intern model
    console.log('Fixing field name typo in existing Intern documents...');
    
    const internsWithTypo = await internsCollection.find({
      'appliedInternsips': { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`Found ${internsWithTypo.length} interns with field name typo`);
    
    for (const intern of internsWithTypo) {
      try {
        // Copy data from typo field to correct field and remove typo field
        const updateResult = await internsCollection.updateOne(
          { _id: intern._id },
          {
            $set: {
              appliedInternships: intern.appliedInternsips || []
            },
            $unset: {
              appliedInternsips: ""
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          migrationResults.fieldNameFixed++;
          console.log(`Fixed field name for intern: ${intern.username}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error fixing field name for intern ${intern.username}:`, error);
        migrationResults.errors.push(`${intern.username}: ${errorMessage}`);
      }
    }
    
    // Step 6: Verify final state
    const finalInternCount = await Intern.countDocuments({});
    const finalUserInternCount = await User.countDocuments({ role: 'intern' });
    const internsWithCorrectField = await internsCollection.countDocuments({
      'appliedInternships': { $exists: true }
    });
    const internsWithTypoField = await internsCollection.countDocuments({
      'appliedInternsips': { $exists: true }
    });
    
    migrationResults.totalProcessed = migrationResults.userToInternMigrated + migrationResults.fieldNameFixed;
    
    await client.close();
    
    console.log('=== MIGRATION COMPLETED ===');
    
    return NextResponse.json({
      success: true,
      message: 'Comprehensive intern migration completed successfully',
      migrationResults,
      finalState: {
        totalInternsInInternModel: finalInternCount,
        remainingInternsInUserModel: finalUserInternCount,
        internsWithCorrectFieldName: internsWithCorrectField,
        internsWithTypoField: internsWithTypoField
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: errorMessage
    }, { status: 500 });
  }
}
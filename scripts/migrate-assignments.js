// scripts/migrate-assignments.js
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Function to load environment variables manually
function loadEnvVariables() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');
    
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    });
  } else {
    console.error('.env.local file not found!');
    process.exit(1);
  }
}

// Load environment variables
loadEnvVariables();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables!');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  process.exit(1);
}

async function migrateAssignments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define Assignment schema for migration (flexible schema)
    const AssignmentSchema = new mongoose.Schema({}, { 
      strict: false,
      collection: 'assignments'
    });
    
    const Assignment = mongoose.model('Assignment', AssignmentSchema);
    
    // Get all existing assignments
    const assignments = await Assignment.find({});
    console.log(`Found ${assignments.length} assignments to migrate`);

    if (assignments.length === 0) {
      console.log('No assignments found. Creating the enhanced schema structure...');
      // Just ensure the collection exists with proper indexes
      await Assignment.createCollection();
      console.log('Assignment collection ready for enhanced features');
      return;
    }

    let migratedCount = 0;

    for (const assignment of assignments) {
      try {
        // Prepare update data with new fields
        const updateData = {
          $set: {}
        };

        // Add new fields only if they don't exist
        if (!assignment.submissions) {
          updateData.$set.submissions = [];
        }
        
        if (!assignment.maxFileSize) {
          updateData.$set.maxFileSize = 1048576; // 1MB
        }
        
        if (!assignment.allowedSubmissionTypes) {
          updateData.$set.allowedSubmissionTypes = ['link', 'pdf'];
        }
        
        if (!assignment.instructions) {
          updateData.$set.instructions = '';
        }

        // Map old status values to new ones if needed
        if (assignment.status === 'active') {
          updateData.$set.status = 'posted';
          console.log(`Mapping status 'active' → 'posted' for: ${assignment.assignmentName}`);
        } else if (assignment.status === 'review') {
          updateData.$set.status = 'under_review';
          console.log(`Mapping status 'review' → 'under_review' for: ${assignment.assignmentName}`);
        } else if (assignment.status === 'completed') {
          updateData.$set.status = 'reviewed';
          console.log(`Mapping status 'completed' → 'reviewed' for: ${assignment.assignmentName}`);
        }

        // Only update if there are changes to make
        if (Object.keys(updateData.$set).length > 0) {
          await Assignment.findByIdAndUpdate(assignment._id, updateData);
          migratedCount++;
          console.log(`✓ Migrated assignment: ${assignment.assignmentName}`);
        } else {
          console.log(`- Already migrated: ${assignment.assignmentName}`);
        }

      } catch (assignmentError) {
        console.error(`✗ Failed to migrate assignment ${assignment.assignmentName}:`, assignmentError.message);
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total assignments found: ${assignments.length}`);
    console.log(`   - Successfully migrated: ${migratedCount}`);
    console.log(`   - Already up-to-date: ${assignments.length - migratedCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Full error details:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration with better error handling
async function runMigration() {
  console.log('🚀 Starting Assignment Migration...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('MongoDB URI exists:', !!MONGODB_URI);
  
  try {
    await migrateAssignments();
    console.log('✅ Migration process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  }
}

// Start the migration
runMigration();
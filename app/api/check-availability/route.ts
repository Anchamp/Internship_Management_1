import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

// Function to generate alternative username suggestions
const generateUsernameSuggestions = async (username: string): Promise<string[]> => {
  const suggestions: string[] = [];
  
  // Try adding random numbers
  const randomNum1 = Math.floor(Math.random() * 100);
  
  // Try adding the current year
  const currentYear = new Date().getFullYear();
  
  // Create suggestions - only two now
  const suggestion1 = `${username}${randomNum1}`;
  const suggestion2 = `${username}${currentYear}`;
  
  // Check if suggestions are available
  const existingSuggestions = await User.find({
    username: { $in: [suggestion1, suggestion2] }
  }).select('username');
  
  const takenUsernames = existingSuggestions.map(user => user.username);
  
  // Only add suggestions that are not taken
  [suggestion1, suggestion2].forEach(suggestion => {
    if (!takenUsernames.includes(suggestion) && suggestions.length < 2) {
      suggestions.push(suggestion);
    }
  });
  
  // If we don't have enough suggestions, add some more with different patterns
  while (suggestions.length < 2) {
    const randomSuffix = Math.floor(Math.random() * 9999);
    const newSuggestion = `${username}_${randomSuffix}`;
    
    if (!takenUsernames.includes(newSuggestion) && !suggestions.includes(newSuggestion)) {
      suggestions.push(newSuggestion);
    }
  }
  
  return suggestions;
};

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { field, value } = await request.json();
    
    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      );
    }
    
    // Add 'organization' to allowed fields
    if (field !== 'username' && field !== 'email' && field !== 'organization') {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    // Handle organization name check
    if (field === 'organization') {
      // Check if any admin user has this organization name
      const existingOrg = await User.findOne({
        role: 'admin',
        organizationName: value
      });
      
      return NextResponse.json({
        available: !existingOrg,
        message: existingOrg ? 'Organization name already exists' : null
      });
    }
    
    // Original username/email check logic
    const query = { [field]: value };
    const user = await User.findOne(query);
    
    // For usernames, generate suggestions if already taken
    if (field === 'username' && user) {
      const suggestions = await generateUsernameSuggestions(value);
      
      return NextResponse.json({
        available: false,
        message: 'Username is already taken',
        suggestions
      });
    }
    
    return NextResponse.json({
      available: !user,
      message: user ? `${field === 'username' ? 'Username' : 'Email'} is already taken` : null
    });
  } catch (error: any) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Server error during availability check' },
      { status: 500 }
    );
  }
}

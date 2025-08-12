// app/api/demo-presentations/evaluate/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import DemoPresentation from '@/models/DemoPresentation';

interface EvaluateRequest {
  presentationId: string;
  internUsername: string;
  evaluatedBy: string;
  scores: Array<{
    criterion: string;
    points: number;
    maxPoints: number;
  }>;
  comments?: string;
  strengths?: string[];
  improvements?: string[];
  overallRating: number;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body: EvaluateRequest = await request.json();
    const {
      presentationId,
      internUsername,
      evaluatedBy,
      scores,
      comments = '',
      strengths = [],
      improvements = [],
      overallRating
    } = body;

    // Validate required fields
    if (!presentationId || !internUsername || !evaluatedBy || !scores || !Array.isArray(scores) || !overallRating) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Presentation ID, intern username, evaluator, scores array, and overall rating are required'
      }, { status: 400 });
    }

    // Validate overall rating
    if (typeof overallRating !== 'number' || overallRating < 1 || overallRating > 5) {
      return NextResponse.json({ 
        error: 'Overall rating must be a number between 1 and 5' 
      }, { status: 400 });
    }

    // Validate scores array
    if (scores.length === 0) {
      return NextResponse.json({ 
        error: 'At least one score is required' 
      }, { status: 400 });
    }

    // Validate each score
    for (const score of scores) {
      if (!score.criterion || typeof score.points !== 'number' || typeof score.maxPoints !== 'number') {
        return NextResponse.json({ 
          error: 'Each score must have criterion, points, and maxPoints' 
        }, { status: 400 });
      }
      
      if (score.points < 0 || score.points > score.maxPoints) {
        return NextResponse.json({ 
          error: `Score for "${score.criterion}" must be between 0 and ${score.maxPoints}` 
        }, { status: 400 });
      }
    }

    // Validate evaluator
    const evaluator = await User.findOne({ username: evaluatedBy }).select('role organizationName organizationId');
    if (!evaluator) {
      return NextResponse.json({ error: 'Evaluator not found' }, { status: 404 });
    }

    if (evaluator.role !== 'employee' && evaluator.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only mentors and admins can evaluate presentations' 
      }, { status: 403 });
    }

    // Find presentation
    const presentation = await DemoPresentation.findById(presentationId);
    if (!presentation) {
      return NextResponse.json({ error: 'Demo presentation not found' }, { status: 404 });
    }

    // Check authorization - evaluator must be in same organization
    if (presentation.organizationName !== evaluator.organizationName || 
        presentation.organizationId !== evaluator.organizationId) {
      return NextResponse.json({ 
        error: 'Not authorized to evaluate this presentation' 
      }, { status: 403 });
    }

    // Check if evaluator can evaluate this presentation (created by them or admin)
    if (presentation.createdBy !== evaluatedBy && evaluator.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You can only evaluate presentations you created' 
      }, { status: 403 });
    }

    // Check if intern is assigned to this presentation
    const internAssignment = presentation.assignedInterns.find(
      (assignment: any) => assignment.internUsername === internUsername
    );
    if (!internAssignment) {
      return NextResponse.json({ 
        error: 'Intern not assigned to this presentation' 
      }, { status: 404 });
    }

    // Validate scores against presentation's evaluation criteria
    const validScores = [];
    let totalScore = 0;
    let maxTotalScore = 0;

    // Check that all required criteria are scored
    for (const criteria of presentation.evaluationCriteria) {
      const score = scores.find(s => s.criterion === criteria.criterion);
      if (!score) {
        return NextResponse.json({ 
          error: `Missing score for criterion: "${criteria.criterion}"` 
        }, { status: 400 });
      }

      // Validate score is within allowed range for this criterion
      if (score.maxPoints !== criteria.maxPoints) {
        return NextResponse.json({ 
          error: `Max points for "${criteria.criterion}" should be ${criteria.maxPoints}, got ${score.maxPoints}` 
        }, { status: 400 });
      }

      validScores.push({
        criterion: criteria.criterion,
        points: score.points,
        maxPoints: criteria.maxPoints
      });

      totalScore += score.points;
      maxTotalScore += criteria.maxPoints;
    }

    // Check for extra scores not in criteria
    const extraScores = scores.filter(score => 
      !presentation.evaluationCriteria.some((criteria: any) => criteria.criterion === score.criterion)
    );
    if (extraScores.length > 0) {
      return NextResponse.json({ 
        error: `Unknown evaluation criteria: ${extraScores.map(s => s.criterion).join(', ')}` 
      }, { status: 400 });
    }

    // Prepare evaluation data
    const evaluationData = {
      internUsername: internUsername.trim(),
      evaluatedBy: evaluatedBy.trim(),
      evaluatedAt: new Date(),
      scores: validScores,
      totalScore,
      maxTotalScore,
      comments: comments.trim(),
      strengths: strengths.filter(s => s?.trim()).map(s => s.trim()),
      improvements: improvements.filter(i => i?.trim()).map(i => i.trim()),
      overallRating
    };

    // Check if evaluation already exists and update or add
    const existingEvaluationIndex = presentation.evaluations.findIndex(
      (evaluation: any) => evaluation.internUsername === internUsername && evaluation.evaluatedBy === evaluatedBy
    );

    if (existingEvaluationIndex !== -1) {
      // Update existing evaluation
      presentation.evaluations[existingEvaluationIndex] = evaluationData;
    } else {
      // Add new evaluation
      presentation.evaluations.push(evaluationData);
    }

    // Update intern assignment status to completed if not already
    const assignmentIndex = presentation.assignedInterns.findIndex(
      (assignment: any) => assignment.internUsername === internUsername
    );
    if (assignmentIndex !== -1 && presentation.assignedInterns[assignmentIndex].status !== 'completed') {
      presentation.assignedInterns[assignmentIndex].status = 'completed';
    }

    // Check if all assigned interns have been evaluated
    const allEvaluated = presentation.assignedInterns.every((assignment: any) => {
      return presentation.evaluations.some((evaluation: any) => 
        evaluation.internUsername === assignment.internUsername
      );
    });

    // Update presentation status if all evaluations are complete
    if (allEvaluated && presentation.status !== 'completed') {
      presentation.status = 'completed';
    } else if (presentation.evaluations.length > 0 && presentation.status === 'scheduled') {
      presentation.status = 'in_progress';
    }

    // Save the presentation
    await presentation.save();

    // Return success response with relevant data
    return NextResponse.json({
      success: true,
      message: 'Evaluation submitted successfully',
      evaluation: {
        internUsername: evaluationData.internUsername,
        evaluatedBy: evaluationData.evaluatedBy,
        totalScore: evaluationData.totalScore,
        maxTotalScore: evaluationData.maxTotalScore,
        overallRating: evaluationData.overallRating,
        evaluatedAt: evaluationData.evaluatedAt
      },
      presentationStatus: presentation.status,
      allEvaluationsComplete: allEvaluated
    }, { status: 200 });

  } catch (error: any) {
    console.error("Demo presentation evaluation error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors.join(', ')
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to submit evaluation',
      details: error.message
    }, { status: 500 });
  }
}
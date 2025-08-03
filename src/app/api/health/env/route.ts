import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables (safely)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? '✅ Set' : '❌ Not set',
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? '✅ Set' : '❌ Not set',
      NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? '✅ Set' : '❌ Not set',
      // Add MongoDB specific checks
      MONGODB_CONNECTION_VALID: false,
    };

    // Test MongoDB connection if URI is available
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('dummy')) {
      try {
        // Don't actually connect, just check if URI format is valid
        const uri = process.env.MONGODB_URI;
        if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
          envCheck.MONGODB_CONNECTION_VALID = true;
        }
      } catch {
        envCheck.MONGODB_CONNECTION_VALID = false;
      }
    }

    return NextResponse.json({
      status: 'Environment check completed',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

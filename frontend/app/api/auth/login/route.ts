import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual authentication logic
    // Example: verify credentials against database
    // const user = await verifyCredentials(email, password);
    
    // For demonstration - replace with real auth
    if (email === 'demo@example.com' && password === 'password') {
      // Create session or JWT token here
      const response = NextResponse.json(
        { 
          message: 'Login successful',
          user: { email, name: 'Demo User' }
        },
        { status: 200 }
      );

      // Set authentication cookie
      response.cookies.set('auth-token', 'your-jwt-token-here', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
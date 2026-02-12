import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual user creation logic
    // Example: 
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Create user in database
    
    // Example check if user exists
    // const existingUser = await findUserByEmail(email);
    // if (existingUser) {
    //   return NextResponse.json(
    //     { message: 'User already exists' },
    //     { status: 409 }
    //   );
    // }

    // Hash password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    // const user = await createUser({ name, email, password: hashedPassword });

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: { email, name }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
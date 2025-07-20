import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Auth cookies cleared successfully',
        cleared_cookies: []
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Get all cookies from the request
    const cookies = request.cookies.getAll();
    const clearedCookies: string[] = [];

    // Clear all auth-related cookies
    cookies.forEach(cookie => {
      const name = cookie.name;
      
      // Clear NextAuth session tokens (including fragmented ones)
      if (
        name.includes('authjs.session-token') ||
        name.includes('__Secure-authjs.session-token') ||
        name.includes('authjs.callback-url') ||
        name.includes('__Secure-authjs.callback-url') ||
        name.includes('authjs.csrf-token') ||
        name.includes('__Host-authjs.csrf-token') ||
        name === '_vercel_jwt' ||
        name.startsWith('next-auth.') ||
        name.startsWith('__Secure-next-auth.') ||
        name.startsWith('__Host-next-auth.')
      ) {
        // Clear the cookie by setting it with an expired date
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: '/',
          domain: undefined, // Let browser determine domain
          secure: true,
          httpOnly: true,
          sameSite: 'lax'
        });

        // Also try clearing with different domain/path combinations
        response.cookies.set(name, '', {
          expires: new Date(0),
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax'
        });

        clearedCookies.push(name);
      }
    });

    // Update response body with cleared cookies list
    const updatedResponse = new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: `Cleared ${clearedCookies.length} auth cookies`,
        cleared_cookies: clearedCookies
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Copy all the cookie clearing headers to the new response
    response.cookies.getAll().forEach(cookie => {
      if (cookie.value === '') {
        updatedResponse.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax'
        });
      }
    });

    return updatedResponse;

  } catch (error) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cookies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to clear auth cookies',
    info: 'This endpoint clears fragmented NextAuth session tokens that can cause REQUEST_HEADER_TOO_LARGE errors'
  });
} 
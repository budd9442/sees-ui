import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth-storage');

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie.value);
      return NextResponse.json({
        authenticated: true,
        user: authData?.state?.user,
        raw: authData
      });
    } catch (e) {
      return NextResponse.json({
        authenticated: false,
        error: 'Invalid auth cookie',
        raw: authCookie.value
      });
    }
  }

  return NextResponse.json({
    authenticated: false,
    message: 'No auth cookie found'
  });
}
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth-storage');

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie.value);
      return NextResponse.json({
        hasCookie: true,
        cookieValue: authCookie.value,
        parsedData: authData,
        user: authData?.state?.user,
        isAuthenticated: authData?.state?.isAuthenticated,
      });
    } catch (e) {
      return NextResponse.json({
        hasCookie: true,
        error: 'Failed to parse cookie',
        cookieValue: authCookie.value,
      });
    }
  }

  return NextResponse.json({
    hasCookie: false,
    message: 'No auth cookie found',
  });
}
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Suppression du cookie de session
  response.cookies.delete('session');
  
  return response;
}
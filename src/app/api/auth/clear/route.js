import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  
  // Example: Delete a specific cookie
  cookieStore.delete('auth_token');

  return new Response(JSON.stringify({ message: 'Cleared' }), {
    status: 200,
  });
}

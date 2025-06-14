import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("auth_token")?.value;
  
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  return new Response(JSON.stringify({ message: "Authenticated" }), { status: 200 });
}

import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  cookieStore.set("auth_token", "", {
    path: "/",
    expires: new Date(0), 
  });

  return new Response(JSON.stringify({ message: "Cleared" }), { status: 200 });
}

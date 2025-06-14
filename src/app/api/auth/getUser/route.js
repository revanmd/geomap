import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("auth_token")?.value;
  
  if (!token) {
    return new Response(JSON.stringify({ 
      success: false,
      message: "No auth token found",
      data: null 
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Decode JWT payload without verification (just reading the data)
    // JWT format: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

    // Check if token is expired (optional check without secret verification)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decodedPayload.exp && decodedPayload.exp < currentTime;

    return new Response(JSON.stringify({ 
      success: true,
      message: isExpired ? "Token is expired but readable" : "User data retrieved successfully",
      data: {
        user: decodedPayload,
        tokenExpiry: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : null,
        isExpired: isExpired
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      message: "Failed to decode token: " + error.message,
      data: null 
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const authToken = request.headers.get("authToken");
    
    if (!authToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Check if the authToken exists in the database
    const token = await prisma.token.findUnique({
        where: { "tokenValue": authToken },
    });
    
    // If the token is not valid, return a 401 Unauthorized response
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    // If the token is valid, return a success response
    return new Response("Authorized", { status: 200 });
}
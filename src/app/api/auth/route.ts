import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const authToken = request.headers.get("authToken");
    
    if (!authToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    
    const token = await prisma.token.findUnique({
        where: { "tokenValue": authToken },
    });
    
    
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    
    return new Response("Authorized", { status: 200 });
}
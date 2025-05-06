import  prisma  from "@/lib/prisma"; 
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "!nv3nt0ry!"; 

// Function to generate and store the token
export const generateToken = async (username:string) => {
  // Create the JWT token (no need for user ID since there's only one user)
  const tokenValue = jwt.sign({username}, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
  
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration


  // Store the token in the database
  const token = await prisma.token.upsert({
    where: { id: 1 },
    create: { tokenValue, expiresAt },
    update: {  tokenValue, expiresAt }
  });

  return token;
};

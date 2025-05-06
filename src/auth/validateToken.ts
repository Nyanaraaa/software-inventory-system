import prisma  from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "!nv3ntory!";

export const validateToken = async (tokenValue: string) => {
  // Find the token in the database
  const token = await prisma.token.findUnique({
    where: { tokenValue },
  });

  if (!token) {
    throw new Error("Token not found");
  }

  // Check if the token is revoked
  if (token.revoked) {
    throw new Error("Token has been revoked");
  }

  // Check if the token has expired
  const now = new Date();
  if (token.expiresAt < now) {
    throw new Error("Token has expired");
  }

  try {
    // Optionally, verify JWT here for additional security
    jwt.verify(tokenValue, JWT_SECRET);
  } catch (err) {
    throw new Error("Token is invalid");
  }

  return token;
};

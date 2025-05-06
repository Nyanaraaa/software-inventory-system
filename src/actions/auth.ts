// app/auth.ts (or wherever you define your server-side logic)
"use server"

import  { generateToken } from "@/auth/generateToken";  // Import token generation function
import  { validateToken } from "@/auth/validateToken";  // Import token validation function
import  prisma  from "@/lib/prisma";  // Import Prisma client to interact with the database
import { compare } from "bcrypt-ts";


export const authenticateUser = async (username: string, password: string) => {
  const validUsername = process.env.ACCOUNT_USERNAME;
  const validPassword = process.env.ACCOUNT_PASSWORD;

  // Check if the credentials match
  if (username === validUsername && await compare(password, validPassword!)) {
    // Generate a token when the user is authenticated
    const token = await generateToken(username);

    return token;  // Return the token to be used on the client side
  } else {
    return false;  // Return false if authentication fails
  }
};

"use server"

import  { generateToken } from "@/auth/generateToken";  
import  { validateToken } from "@/auth/validateToken";  
import  prisma  from "@/lib/prisma";  
import { compare } from "bcrypt-ts";


export const authenticateUser = async (username: string, password: string) => {
  const validUsername = process.env.ACCOUNT_USERNAME;
  const validPassword = process.env.ACCOUNT_PASSWORD;

  
  if (username === validUsername && await compare(password, validPassword!)) {
    
    const token = await generateToken(username);

    return token;  
  } else {
    return false;  
  }
};
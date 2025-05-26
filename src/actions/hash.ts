"use server";
import { compare } from "bcrypt-ts";

export async function validateHashed(password: string) {
  const hashedPassword = process.env.ACCOUNT_PASSWORD;

  

  if (password && hashedPassword && await compare(password, hashedPassword)) {
    return true;
  } else {
    return false;
  }
}

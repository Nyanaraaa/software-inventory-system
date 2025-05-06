"use server";
import { compare } from "bcrypt-ts";

export async function validateHashed(password: string) {
  const hashedPassword = process.env.ACCOUNT_PASSWORD;

  // Compare the input password with the hashed password

  if (password && hashedPassword && await compare(password, hashedPassword)) {
    return true;
  } else {
    return false;
  }
}

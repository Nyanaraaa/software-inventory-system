"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/actions/auth";
import { validateHashed } from "@/actions/hash";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Authenticate user and get token from the action
    const token = await authenticateUser(username, password);
    console.log("Token:", token); // Debugging: Check if token is returned

    const validatedPassword= await validateHashed(password)
  
    if (token && validatedPassword) {
      // Successfully authenticated, set the token as a cookie in the client-side
      document.cookie = `authToken=${token.tokenValue}; path=/; secure; SameSite=Strict;`;

      console.log("Redirecting to /home"); // Debugging: Check if this block is executed
      router.push("/home"); // Redirect to the home page
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Inventory System</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-950">
                Log in
              </Button>
              {error && <p className="text-red-500">{error}</p>}{" "}
              {/* Error message */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
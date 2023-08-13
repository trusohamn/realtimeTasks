"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediumTitle } from "@/components/ui/text/title";
import { apiService } from "@/constants";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(apiService + "/users", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }).then((data) => data.json());

      console.log(response);
      localStorage.setItem("userid", response.id);
      localStorage.setItem("username", response.username);

      router.push("/lists");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <MediumTitle>Welcome to Rapid Lists</MediumTitle>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
            />
            <Button type="submit">Login</Button>
          </div>
        </form>
        <div className="p-10" />
        <Card>
          <CardContent>
            <CardHeader>
              Try out one of demo username: marta, ana, or create your own
            </CardHeader>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

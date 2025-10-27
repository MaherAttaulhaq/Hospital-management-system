// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevents automatic redirect and allows for custom error handling
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/dashboard"); // Redirect to a protected page on success
      }
    } catch (e) {
      setError("An unknown error occurred.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1 max-w-300">
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Sign in</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

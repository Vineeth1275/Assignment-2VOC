"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
	const [email, setEmail] = useState("admin@example.com");
	const [password, setPassword] = useState("password123");
	const [error, setError] = useState<string | null>(null);
	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/" });
		if (res?.error) setError(res.error);
	};
	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-xl font-semibold">Sign in</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="w-full rounded-md border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
				<input className="w-full rounded-md border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
				{error && <p className="text-sm text-red-600">{error}</p>}
				<button type="submit" className="rounded-md border px-4 py-2">Sign in</button>
			</form>
		</div>
	);
}
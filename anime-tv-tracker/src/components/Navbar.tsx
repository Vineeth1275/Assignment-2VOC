"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
	const { status } = useSession();
	return (
		<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="font-semibold">AniTrack</Link>
				<nav className="flex items-center gap-3">
					<Link href="/shows" className="text-sm">Shows</Link>
					<Link href="/watchlist" className="text-sm">Watchlist</Link>
					<ThemeToggle />
					{status === "authenticated" ? (
						<button onClick={() => signOut()} className="text-sm rounded-md border px-3 py-1.5">Sign out</button>
					) : (
						<button onClick={() => signIn()} className="text-sm rounded-md border px-3 py-1.5">Sign in</button>
					)}
				</nav>
			</div>
		</header>
	);
}
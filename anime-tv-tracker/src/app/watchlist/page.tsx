import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { WatchStatus } from "@/generated/prisma";

const categories = [
	{ key: "ALL", label: "All" },
	{ key: "WATCHING", label: "Watching" },
	{ key: "COMPLETED", label: "Completed" },
	{ key: "ON_HOLD", label: "On Hold" },
	{ key: "DROPPED", label: "Dropped" },
	{ key: "PLAN_TO_WATCH", label: "Plan to Watch" },
] as const;

type CategoryKey = typeof categories[number]["key"];

function parseCategory(searchParams: Record<string, string | string[] | undefined>): CategoryKey {
	const c = typeof searchParams.category === "string" ? searchParams.category.toUpperCase() : "ALL";
	const keys = categories.map((c) => c.key);
	return (keys.includes(c as CategoryKey) ? (c as CategoryKey) : "ALL");
}

export default async function WatchlistPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) redirect("/auth/signin");
	const category = parseCategory(searchParams);

	const statusFilter: WatchStatus | undefined = category === "ALL" ? undefined : (category as WatchStatus);
	const entries = await prisma.watchlistEntry.findMany({
		where: {
			user: { email: session.user.email },
			...(statusFilter ? { status: statusFilter } : {}),
		},
		include: { show: true },
		orderBy: { updatedAt: "desc" },
	});

	return (
		<div className="mx-auto max-w-6xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Your Watchlist</h1>
			<div className="flex flex-wrap gap-2">
				{categories.map((c) => (
					<Link key={c.key} href={`/watchlist?category=${c.key}`} className={`rounded-md border px-3 py-1.5 text-sm ${c.key === category ? "bg-foreground text-background" : ""}`}>
						{c.label}
					</Link>
				))}
			</div>
			<ul className="space-y-3">
				{entries.map((e) => (
					<li key={e.id} className="rounded-md border p-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-medium">{e.show.title}</h2>
								<p className="text-xs text-muted-foreground">{e.status} • Watched {e.episodesWatched}{e.show.episodeCount ? `/${e.show.episodeCount}` : ""}</p>
							</div>
							<Link href={`/shows/${e.showId}`} className="text-sm underline">Details</Link>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
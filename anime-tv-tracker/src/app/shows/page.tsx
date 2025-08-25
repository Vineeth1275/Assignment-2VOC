import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ShowsPage() {
	const shows = await prisma.show.findMany({
		orderBy: { title: "asc" },
	});
	return (
		<div className="mx-auto max-w-6xl p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Shows</h1>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				{shows.map((s) => (
					<li key={s.id} className="rounded-md border p-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-medium">{s.title}</h2>
								<p className="text-xs text-muted-foreground">{s.type} {s.releaseYear ? `• ${s.releaseYear}` : ""}</p>
							</div>
							<Link className="text-sm underline" href={`/shows/${s.id}`}>Details</Link>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ShowDetails({ params }: { params: { id: string } }) {
	const show = await prisma.show.findUnique({ where: { id: params.id }, include: { streamingLinks: true } });
	if (!show) return notFound();
	return (
		<div className="mx-auto max-w-3xl p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">{show.title}</h1>
				<p className="text-sm text-muted-foreground">
					{show.type} {show.releaseYear ? `• ${show.releaseYear}` : ""}
				</p>
			</div>
			{show.description && <p className="text-sm leading-relaxed">{show.description}</p>}
			<div>
				<h2 className="mb-2 font-medium">Streaming</h2>
				<ul className="space-y-1">
					{show.streamingLinks.map((l) => (
						<li key={l.id}>
							<Link href={l.url} className="underline" target="_blank">
								{l.platform}
							</Link>
							{l.region ? <span className="ml-2 text-xs text-muted-foreground">{l.region}</span> : null}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
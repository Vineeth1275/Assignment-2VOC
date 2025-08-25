import { PrismaClient } from "../generated/prisma";

declare global {
	var cachedPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.cachedPrisma ?? new PrismaClient({
	log: ["error", "warn"],
});

if (process.env.NODE_ENV !== "production") {
	global.cachedPrisma = prisma;
}


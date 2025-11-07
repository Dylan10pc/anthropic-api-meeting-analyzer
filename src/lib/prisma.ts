import { PrismaClient } from "@prisma/client";

//Extend the global NodeJS namespace to include our prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

//Initialize PrismaClient
//If a client already exists in the global scope, use that instead of creating a new one
export const prisma = global.prisma || new PrismaClient({ 
  log: ["error", "warn"] 
});

//In development, save the prisma instance to the global object
//This ensures we reuse the same instance across hot reloads
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
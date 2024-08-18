import {PrismaClient} from "@prisma/client";

const prisma: PrismaClient = new PrismaClient({
    // log: ['query', 'error']
});

export default prisma;
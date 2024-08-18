import express, { Application, Request, Response, NextFunction } from 'express';
 import dotenv from 'dotenv';
import http from 'http'; // Import http module to create the serverImport Socket.IO
import { PrismaClient } from '@prisma/client';
import UserRouter from '../routes/userRoute';


dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) || 3000;

const prisma = new PrismaClient(); // Initialize Prisma client

// Middleware
app.use(express.json());

// Routes

app.use(`${process.env.URI}/user`, UserRouter); // For user management

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = http.createServer(app);


  // Import the swagger docs middleware and pass the app and port to it.

server.listen(port, () => {
    console.log(`Your application is started on http://www.beyond-fashion.com:${port}`);
});


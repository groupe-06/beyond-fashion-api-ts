import express from 'express';
import roleRoute from './routes/roleRoute';
import userRoute from './routes/userRoute';
import measurementRoute from './routes/measurementRoute';
import rechargeRoute from './routes/rechargeRoute';
import storyRoute from './routes/storyRoute';
import messageRoute from './routes/messageRoute';
import { Server as SocketIO } from 'socket.io';
import http from 'http';
import postRouter from './routes/postRoute';
import reportRouter from './routes/reportRouter';
import reactionRouter from './routes/reactionpostRoute';
import rateRouter from './routes/rateRoute';
import favoriteRouter from './routes/favoriteRoute'; 
import userFollowRoute from './routes/userFollowRoute';
import commentRoute from './routes/commentRoute';
import viewRoutes from './routes/viewRoute';
import articleRoute from './routes/articleRoute'; // Import articleCommande route
import categoryRoute from './routes/categoryRoute';
import unitRouter from './routes/unitRoute'; // Importez votre routeur d'unités
import tagRoute from './routes/tagRoute'; // Importez votre route
import commandeRouter from './routes/commandeRoute'
import searchRoute from './routes/searchRoute';
import conversionRoute from './routes/conversionRoute';
import 'dotenv/config'; // Import articleCommande route
import cors from 'cors';


const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;

app.use(express.json());
app.use(`${uri}/roles`, roleRoute);
app.use(`${uri}/users`, userRoute);
app.use(`${uri}/users`,commandeRouter);
app.use(`${uri}/measurements`, measurementRoute);
app.use(`${uri}/recharge`, rechargeRoute);
app.use(`${uri}/post`, postRouter);
app.use(`${uri}/post`, reportRouter);
app.use(`${uri}/post`, reactionRouter);
app.use(`${uri}/stories`, storyRoute);
app.use(`${uri}/messages`, messageRoute);
app.use(`${uri}/posts`, postRouter);
app.use(`${uri}/userFollow`, userFollowRoute);
app.use(`${uri}/comments`, commentRoute);
app.use(`${uri}/rates`, rateRouter);
app.use(`${uri}/favorites`, favoriteRouter); 
app.use(`${uri}/views`, viewRoutes);
app.use(`${uri}/articles`, articleRoute);
app.use(`${uri}/categories`, categoryRoute);
app.use(`${uri}/units`, unitRouter);
app.use(`${uri}/tags`, tagRoute);
app.use(`${uri}/search`, searchRoute);
app.use(`${uri}/conversions`, conversionRoute);


const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('send message', (messageData) => {
        io.to(messageData.receiverId).emit('receive message', messageData);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


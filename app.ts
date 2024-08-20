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

import userFollowRoute from './routes/userFollowRoute';
import commentRoute from './routes/commentRoute';
import rateRouter from './routes/rateRoute'; 
import viewRoutes from './routes/viewRoute';
import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;


app.use(express.json());
app.use(`${uri}/roles`, roleRoute);
app.use(`${uri}/users`, userRoute);
app.use(`${uri}/measurements`, measurementRoute);
app.use(`${uri}/recharge`, rechargeRoute);
app.use(`${uri}/post`, postRouter);
app.use(`${uri}/post`, reportRouter);
app.use(`${uri}/post`, reactionRouter);
app.use(`${uri}/stories`, storyRoute);
app.use(`${uri}/messages`, messageRoute);
app.use(`${uri}/posts`, postRouter);
app.use(`${uri}/userFollow`, userFollowRoute);
app.use(`${uri}/posts`, commentRoute);
app.use(`${uri}/rates`, rateRouter);
app.use(`${uri}/views`, viewRoutes);

const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('send message', (messageData) => {
        io.to(messageData.receiverId).emit('receive message', messageData);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
});

/*app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});*/

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

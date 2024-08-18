import express from 'express';
import roleRoute from './routes/roleRoute';
import userRoute from './routes/userRoute';
import storyRoute from './routes/storyRoute';
import messageRoute from './routes/messageRoute';
import { Server as SocketIO } from 'socket.io';
import http from 'http';

import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;


app.use(express.json());
app.use(`${uri}/roles`, roleRoute);
app.use(`${uri}/users`, userRoute);
app.use(`${uri}/stories`, storyRoute);
app.use(`${uri}/messages`, messageRoute);

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

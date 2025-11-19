"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleRoute_1 = __importDefault(require("./routes/roleRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const measurementRoute_1 = __importDefault(require("./routes/measurementRoute"));
const rechargeRoute_1 = __importDefault(require("./routes/rechargeRoute"));
const storyRoute_1 = __importDefault(require("./routes/storyRoute"));
const messageRoute_1 = __importDefault(require("./routes/messageRoute"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const reportRouter_1 = __importDefault(require("./routes/reportRouter"));
const reactionpostRoute_1 = __importDefault(require("./routes/reactionpostRoute"));
const rateRoute_1 = __importDefault(require("./routes/rateRoute"));
const favoriteRoute_1 = __importDefault(require("./routes/favoriteRoute"));
const userFollowRoute_1 = __importDefault(require("./routes/userFollowRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const viewRoute_1 = __importDefault(require("./routes/viewRoute"));
const articleRoute_1 = __importDefault(require("./routes/articleRoute")); // Import articleCommande route
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const unitRoute_1 = __importDefault(require("./routes/unitRoute")); // Importez votre routeur d'unités
const tagRoute_1 = __importDefault(require("./routes/tagRoute")); // Importez votre route
const commandeRoute_1 = __importDefault(require("./routes/commandeRoute"));
const searchRoute_1 = __importDefault(require("./routes/searchRoute"));
const conversionRoute_1 = __importDefault(require("./routes/conversionRoute"));
const shareRoute_1 = __importDefault(require("./routes/shareRoute"));
require("dotenv/config"); // Import articleCommande route
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:8000", "http://localhost:3000", "https://beyond-fashion-api-ts-8ruc.onrender.com", "https://threadline-front.onrender.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin, X-Requested-With, Content, Accept, Content-Type, Authorization']
}));
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;
app.use(express_1.default.json());
app.use(`${uri}/roles`, roleRoute_1.default);
app.use(`${uri}/users`, userRoute_1.default);
app.use(`${uri}/users`, commandeRoute_1.default);
app.use(`${uri}/measurements`, measurementRoute_1.default);
app.use(`${uri}/recharge`, rechargeRoute_1.default);
app.use(`${uri}/post`, reportRouter_1.default);
app.use(`${uri}/post`, reactionpostRoute_1.default);
app.use(`${uri}/stories`, storyRoute_1.default);
app.use(`${uri}/messages`, messageRoute_1.default);
app.use(`${uri}/posts`, postRoute_1.default);
app.use(`${uri}/userFollow`, userFollowRoute_1.default);
app.use(`${uri}/comments`, commentRoute_1.default);
app.use(`${uri}/rates`, rateRoute_1.default);
app.use(`${uri}/favorites`, favoriteRoute_1.default);
app.use(`${uri}/views`, viewRoute_1.default);
app.use(`${uri}/articles`, articleRoute_1.default);
app.use(`${uri}/categories`, categoryRoute_1.default);
app.use(`${uri}/units`, unitRoute_1.default);
app.use(`${uri}/tags`, tagRoute_1.default);
app.use(`${uri}/search`, searchRoute_1.default);
app.use(`${uri}/conversions`, conversionRoute_1.default);
app.use(`${uri}/`, shareRoute_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
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

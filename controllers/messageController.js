"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.getMessages = exports.createMessage = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.userId;
        const message = yield db_config_1.default.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        return res.status(201).json({ msg: 'Message sent successfully', message, status: true });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error sending message', error, status: false });
    }
});
exports.createMessage = createMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { receiverId } = req.query;
        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId is required', status: false });
        }
        const messages = yield db_config_1.default.message.findMany({
            where: {
                OR: [
                    { AND: [{ senderId: userId }, { receiverId: Number(receiverId) }] },
                    { AND: [{ senderId: Number(receiverId) }, { receiverId: userId }] }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return res.status(200).json({ message: 'Messages fetched successfully', messages, status: true });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching messages', error, status: false });
    }
});
exports.getMessages = getMessages;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_config_1.default.message.delete({
            where: { id: Number(id) },
        });
        return res.status(204).json({ msg: 'Message deleted successfully', status: true });
    }
    catch (error) {
        return res.status(500).json({ msg: 'Error deleting message', error, status: false });
    }
});
exports.deleteMessage = deleteMessage;

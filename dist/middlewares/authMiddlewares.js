"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenFromHeader = exports.getToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header malformed because your are missing the Bearer prefix' });
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023');
        req.userId = decodedToken.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid tokens' });
    }
};
exports.getToken = getToken;
const getTokenFromHeader = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header malformed because your are missing the Bearer prefix' });
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    // Optionnel : vérifier le format de base du JWT (un JWT contient 3 parties séparées par des points)
    if (token.split('.').length !== 3) {
        return res.status(400).json({ message: 'Invalid token format' });
    }
    req.token = token;
    next();
};
exports.getTokenFromHeader = getTokenFromHeader;

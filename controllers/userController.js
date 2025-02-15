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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotifications = exports.logout = exports.verifyValidityUserToken = exports.verifyValidityToken = exports.unblockUser = exports.blockUser = exports.updateProfile = exports.deleteUser = exports.updateUser = exports.getUser = exports.getAllUsers = exports.login = exports.register = void 0;
const utils_1 = require("../utils/utils");
const db_config_1 = __importDefault(require("../database/db.config"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, password, lastname, firstname, phoneNumber, address, gender, confirm_password } = req.body;
        const file = req.file;
        email = email === null || email === void 0 ? void 0 : email.trim().toLowerCase();
        password = password === null || password === void 0 ? void 0 : password.trim();
        confirm_password = confirm_password === null || confirm_password === void 0 ? void 0 : confirm_password.trim();
        lastname = lastname === null || lastname === void 0 ? void 0 : lastname.trim();
        firstname = firstname === null || firstname === void 0 ? void 0 : firstname.trim();
        phoneNumber = phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.trim();
        address = address === null || address === void 0 ? void 0 : address.trim();
        gender = gender === null || gender === void 0 ? void 0 : gender.trim();
        const userFromDB = yield db_config_1.default.user.findUnique({ where: { email } });
        if (userFromDB) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        const existingPhoneNumber = yield db_config_1.default.user.findUnique({ where: { phoneNumber } });
        if (existingPhoneNumber) {
            return res.status(409).json({ message: 'User with this phone number already exists' });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const role = yield db_config_1.default.role.findFirst({ where: { name: 'SIMPLE' } });
        if (!role) {
            return res.status(404).json({ message: 'Role SIMPLE not found' });
        }
        const hashedPassword = (0, utils_1.cryptPassword)(password);
        let photoUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        if (file) {
            const media = yield new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(file.buffer);
            });
            photoUrl = media.secure_url;
        }
        const user = yield db_config_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                lastname,
                firstname,
                phoneNumber,
                address,
                gender,
                photoUrl,
                roles: {
                    connect: { name: role.name }
                }
            },
        });
        return res.status(201).json({ message: 'User created successfully', user });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to create user', error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield db_config_1.default.user.findUnique({
            where: { email: email === null || email === void 0 ? void 0 : email.trim() },
            include: {
                roles: true,
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        const isMatch = (0, utils_1.comparePasswords)(password === null || password === void 0 ? void 0 : password.trim(), user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        const token = yield (0, utils_1.generateToken)(user);
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        const data = Object.assign(Object.assign({}, userWithoutPassword), { token });
        return res.status(200).json({ message: 'User Logged in successfully', data });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to login', error });
    }
});
exports.login = login;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_config_1.default.user.findMany();
        res.json({ message: 'Users fetched successfully', users });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
});
exports.getAllUsers = getAllUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Tente d'abord de récupérer l'ID depuis le token
        let userId = req.userId;
        // Si pas d'ID dans le token, essaie les paramètres d'URL
        if (!userId && req.params.userId) {
            userId = parseInt(req.params.userId);
        }
        if (!userId) {
            return res.status(401).json({
                message: 'User ID not found in token or parameters'
            });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: {
                id: Number(userId)
            },
            include: {
                roles: true,
                // Ajoutez ici d'autres relations si nécessaire
            }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            message: 'Failed to fetch user',
            error: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : 'Unknown error'
        });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const user = yield db_config_1.default.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = yield db_config_1.default.user.update({
            where: { id: Number(userId) },
            data: req.body
        });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db_config_1.default.user.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});
exports.deleteUser = deleteUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { role, token } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        let user = yield db_config_1.default.user.findUnique({
            where: { id: Number(userId) },
            include: {
                roles: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        const roleFromDb = yield db_config_1.default.role.findUnique({
            where: { name: role === null || role === void 0 ? void 0 : role.trim() },
        });
        if (!roleFromDb) {
            return res.status(404).json({ message: `Role ${role} not found from DB` });
        }
        const hasAlreadyRole = user.roles.find(r => r.name === role);
        if (hasAlreadyRole) {
            return res.status(400).json({ message: `User is already assigned the role ${role}.` });
        }
        if (role === "TAILOR") {
            const existingRole = user.roles.find(r => r.name === "SELLER");
            if (existingRole) {
                return res.status(400).json({ message: `User is already assigned to the role ${existingRole.name}.` });
            }
        }
        if (role === "SELLER") {
            const existingRole = user.roles.find(r => r.name === "TAILOR");
            if (existingRole) {
                return res.status(400).json({ message: `User is already assigned to the role ${existingRole.name}.` });
            }
        }
        let updatedUser;
        if (role === "TAILOR") {
            updatedUser = yield db_config_1.default.user.update({
                where: { id: Number(userId) },
                data: {
                    roles: { connect: [{ id: roleFromDb.id }] },
                    credit: 40
                },
                include: { roles: true }
            });
        }
        else {
            updatedUser = yield db_config_1.default.user.update({
                where: { id: Number(userId) },
                data: { roles: { connect: [{ id: roleFromDb.id }] } },
                include: { roles: true }
            });
        }
        const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        const data = Object.assign(Object.assign({}, userWithoutPassword), { token });
        res.status(200).json({ message: 'Profile updated successfully', data });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error });
    }
});
exports.updateProfile = updateProfile;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blockerId = req.userId;
    const blockedId = parseInt(req.params.blockedId);
    try {
        if (!blockerId) {
            return res.status(401).json({ message: 'You are not authorized to block this user.' });
        }
        if (blockerId === blockedId) {
            return res.status(400).json({ message: 'You cannot block yourself.' });
        }
        const blockedUser = yield db_config_1.default.user.findUnique({
            where: { id: blockedId },
        });
        if (!blockedUser) {
            return res.status(404).json({ message: `User with ID ${blockedId} not found` });
        }
        const existingBlock = yield db_config_1.default.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });
        if (existingBlock) {
            return res.status(400).json({ message: 'This user is already blocked.' });
        }
        const block = yield db_config_1.default.block.create({
            data: {
                blockerId: blockerId,
                blockedId: blockedId,
            },
        });
        return res.status(200).json({ message: 'User blocked successfully', block });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to block user', error });
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blockerId = req.userId;
    const blockedId = parseInt(req.params.deblockedId);
    try {
        if (!blockerId) {
            return res.status(401).json({ message: 'You are not authorized to unblock this user.' });
        }
        if (blockerId === blockedId) {
            return res.status(400).json({ message: 'You cannot unblock yourself.' });
        }
        const existingBlock = yield db_config_1.default.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });
        if (!existingBlock) {
            return res.status(404).json({ message: 'Block not found.' });
        }
        yield db_config_1.default.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });
        return res.status(200).json({ message: 'User unblocked successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to unblock user', error });
    }
});
exports.unblockUser = unblockUser;
const verifyValidityToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023');
        console.log(decodedToken);
        return res.status(200).json({ message: 'Valid token' });
    }
    catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
});
exports.verifyValidityToken = verifyValidityToken;
const verifyValidityUserToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Récupérer le header Authorization
    const authHeader = req.headers.authorization;
    // Vérifier si le token est présent dans le header et qu'il commence bien par 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or incorrect format' });
    }
    // Extraire le token (enlever 'Bearer ')
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);
    // Vérifier si Prisma est bien connecté et si le modèle est disponible
    console.log('Prisma blackListToken model:', db_config_1.default.blackListToken);
    try {
        // Vérifier si le token est blacklisté
        const blacklistedToken = yield db_config_1.default.blackListToken.findUnique({
            where: {
                token: token
            }
        });
        if (blacklistedToken) {
            return res.status(401).json({ message: 'Unauthorized: Token blacklisted' });
        }
        // Décoder et vérifier le token JWT
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023');
        console.log(decodedToken);
        return res.status(200).json({ message: 'Valid token' });
    }
    catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
});
exports.verifyValidityUserToken = verifyValidityUserToken;
//res.clearCookie('token');
//return res.status(200).json({ message: 'Logged out successfully' });
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    try {
        // Vérifier si le token est déjà blacklisté
        const tokenExists = yield db_config_1.default.blackListToken.findUnique({
            where: { token }
        });
        if (tokenExists) {
            return res.status(400).json({ message: 'Token already blacklisted' });
        }
        // Enregistrer le token dans la table blacklistToken
        yield db_config_1.default.blackListToken.create({
            data: { token }
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.logout = logout;
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const { type } = req.query;
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: { id: Number(userId) }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let notificationType = type ? type.toUpperCase() : null;
        const existingTypes = ['MESSAGE', 'FOLLOW', 'LIKE', 'COMMENT', 'REPORT'];
        if (notificationType && !existingTypes.includes(notificationType)) {
            return res.status(400).json({ message: 'Invalid notification type' });
        }
        const whereClause = {
            receiverId: Number(userId),
            emetorId: {
                not: null
            }
        };
        if (notificationType) {
            whereClause.type = notificationType;
        }
        const notifications = yield db_config_1.default.notification.findMany({
            where: whereClause,
            include: {
                emetor: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        photoUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ message: 'All notifications fetched successfully', notifications });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({
            message: 'Failed to fetch notifications',
            error: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : 'Unknown error'
        });
    }
});
exports.getUserNotifications = getUserNotifications;

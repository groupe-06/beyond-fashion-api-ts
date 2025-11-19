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
exports.creditRecharge = exports.rechargeAmount = void 0;
const db_config_1 = __importDefault(require("../database/db.config")); // Adjust the path to your Prisma client
const utils_1 = require("../utils/utils");
const utils_2 = require("../utils/utils");
const rechargeAmount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { amount, receiverEmail } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        const parsedAmount = Number(amount);
        console.log(amount);
        const user = yield db_config_1.default.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        const isTailor = user.roles.some(role => role.name === 'TAILOR');
        if (!isTailor) {
            return res.status(403).json({ message: 'Only tailors can do this action' });
        }
        if (!parsedAmount) {
            return res.status(400).json({ message: 'Amount is required' });
        }
        let code = yield generateUniqueCode();
        if (!code) {
            return res.status(500).json({ message: 'Failed to generate code' });
        }
        if (parsedAmount < 100 || parsedAmount > 2000) {
            return res.status(400).json({ message: 'Amount must be between 100 and 2000' });
        }
        if (receiverEmail) {
            const receiver = yield db_config_1.default.user.findUnique({
                where: { email: receiverEmail },
                include: { roles: true },
            });
            if (!receiver) {
                return res.status(404).json({ message: `Receiver with email ${receiverEmail} not found` });
            }
            if (!(receiver === null || receiver === void 0 ? void 0 : receiver.roles.find(role => role.name === 'TAILOR'))) {
                return res.status(403).json({ message: 'This receiver does not have the TAILOR role' });
            }
            const recharge = yield db_config_1.default.recharge.create({
                data: {
                    userId,
                    receiverId: receiver.id,
                    amount: parsedAmount,
                    code: BigInt(code),
                },
            });
            (0, utils_1.sendMail)(user.email, 'Beyound fashion recharge', `Félicitations votre achat de recharge à ${receiver.firstname} ${receiver.lastname} est effectué avec succes.`);
            (0, utils_1.sendMail)(receiver.email, 'Beyound fashion recharge', `${user.firstname} ${user.lastname} vient de vous faire un achat de recharge. Le code de rechargement est : ${recharge.code}`);
            (0, utils_2.sendSMS)(receiver.phoneNumber, `${user.firstname} ${user.lastname} vient de vous faire un achat de recharge. Le code de rechargement est : ${recharge.code}`);
            return res.status(201).json(Object.assign(Object.assign({ message: 'Recharge created successfully' }, recharge), { code: recharge.code.toString() }));
        }
        const recharge = yield db_config_1.default.recharge.create({
            data: {
                userId: userId,
                amount: parsedAmount,
                code: Number(code), // Implement a function to generate a unique code
            },
        });
        (0, utils_1.sendMail)(user.email, 'Beyound fashion recharge', `Félicitations votre achat de recharge est effectué avec succes. Votre code de rechargement est : ${recharge.code}`);
        (0, utils_2.sendSMS)(user.phoneNumber, `Félicitations votre achat de recharge est effectué avec succes. Votre code de rechargement est : ${recharge.code}`);
        return res.status(201).json(Object.assign(Object.assign({ message: 'Recharge created successfully' }, recharge), { code: recharge.code.toString() }));
    }
    catch (error) {
        console.error('Error recharging credit:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.rechargeAmount = rechargeAmount;
const generateUniqueCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const generateCode = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    };
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = generateCode();
        const existingRecharge = yield db_config_1.default.recharge.findUnique({ where: { code } });
        if (!existingRecharge) {
            isUnique = true;
        }
    }
    return code;
});
const creditRecharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { code } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }
        // Vérifier si le code contient uniquement des chiffres
        const isNumeric = /^\d+$/.test(code);
        if (!isNumeric) {
            return res.status(400).json({ message: 'The code must contain only digits.' });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        const recharge = yield db_config_1.default.recharge.findUnique({
            where: { code: BigInt(code) },
        });
        if (!recharge) {
            return res.status(404).json({ message: 'No recharge found with this code' });
        }
        if (recharge.isUsed) {
            return res.status(400).json({ message: 'This code is already used' });
        }
        if (recharge.receiverId) {
            if (recharge.receiverId !== userId) {
                return res.status(403).json({ message: 'This recharge is not yours' });
            }
            const credit = recharging(recharge.amount);
            const user = yield db_config_1.default.user.update({
                where: { id: userId },
                data: { credit: { increment: credit } },
            });
            yield db_config_1.default.recharge.update({
                where: { id: recharge.id },
                data: { isUsed: true },
            });
            return res.status(201).json({ message: `Credit recharge successful. Your new credit is now ${user.credit}` });
        }
        const credit = recharging(recharge.amount);
        const modifiedUser = yield db_config_1.default.user.update({
            where: { id: userId },
            data: { credit: { increment: credit } },
        });
        yield db_config_1.default.recharge.update({
            where: { id: recharge.id },
            data: { isUsed: true },
        });
        return res.status(201).json({ message: `Credit recharge successful. Your new credit is now ${modifiedUser.credit}` });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to recharge credit', error });
    }
});
exports.creditRecharge = creditRecharge;
function recharging(amount) {
    switch (amount) {
        case 100:
            return 10;
        case 300:
            return 32;
        case 500:
            return 52;
        case 1000:
            return 104;
        case 1200:
            return 128;
        case 1500:
            return 160;
        case 2000:
            return 210;
        default:
            return 0;
    }
}

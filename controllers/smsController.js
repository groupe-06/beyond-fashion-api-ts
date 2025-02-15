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
const db_config_1 = __importDefault(require("../database/db.config"));
const sendSms_1 = __importDefault(require("../utils/sendSms"));
const sendReportWarningSms = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_config_1.default.user.findUnique({
            where: { id: userId },
            select: { phoneNumber: true }
        });
        if (!user || !user.phoneNumber) {
            console.error('User not found or phone number not available');
            return;
        }
        const message = `Votre post avec l'ID ${postId} a reçu deux signalements. S'il en reçoit un quatrième , il sera supprimé.`;
        yield (0, sendSms_1.default)(user.phoneNumber, message);
        console.log('SMS sent successfully');
    }
    catch (error) {
        console.error('Error sending report warning SMS:', error);
    }
});
exports.default = sendReportWarningSms;

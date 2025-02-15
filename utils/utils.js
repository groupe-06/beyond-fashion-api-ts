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
exports.generatePDFReceipt = exports.sendSMS = exports.sendMail = exports.verifyTokenValidity = exports.generateToken = exports.comparePasswords = exports.cryptPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const apiKey = process.env.INFOBIP_API_KEY;
const baseUrl = process.env.INFOBIP_BASE_URL;
const cryptPassword = (password) => {
    const salt = bcryptjs_1.default.genSaltSync(10);
    return bcryptjs_1.default.hashSync(password, salt);
};
exports.cryptPassword = cryptPassword;
const comparePasswords = (password, hashedPassword) => {
    return bcryptjs_1.default.compareSync(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const generateToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023', { expiresIn: '24h' });
    return token;
});
exports.generateToken = generateToken;
const verifyTokenValidity = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023');
    return decoded;
});
exports.verifyTokenValidity = verifyTokenValidity;
const sendMail = (to, subject, message, attachmentPath) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_GOOGLE_APP,
            pass: process.env.PASSWORD_GOOGLE_APP
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_GOOGLE_APP,
        to: to,
        subject: subject,
        text: message
    };
    // Ajouter la pièce jointe si elle est fournie
    if (attachmentPath) {
        mailOptions.attachments = [
            {
                path: attachmentPath
            }
        ];
    }
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email envoyé avec succès:", info);
    }
    catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        throw error; // Relancer l'erreur pour la gestion côté appelant
    }
});
exports.sendMail = sendMail;
const sendSMS = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`${baseUrl}/sms/2/text/advanced`, {
            messages: [
                {
                    from: "Beyond_Fashion",
                    destinations: [
                        {
                            to: phoneNumber
                        }
                    ],
                    text: message
                }
            ]
        }, {
            headers: {
                Authorization: `App ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SMS sent successfully:', response.data);
        console.log('Sending SMS with the following details:');
        console.log(`Phone Number: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log('API Key:', apiKey);
        console.log('Base URL:', baseUrl);
    }
    catch (error) {
        console.error('Error sending SMS:', error);
    }
});
exports.sendSMS = sendSMS;
const generatePDFReceipt = (commande) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default();
        // Dossier où les reçus seront enregistrés
        const receiptFolder = path_1.default.resolve(__dirname, '../receipts');
        // Vérifier si le dossier existe, sinon le créer
        if (!fs_1.default.existsSync(receiptFolder)) {
            fs_1.default.mkdirSync(receiptFolder, { recursive: true });
        }
        // Nom du fichier basé sur l'ID de la commande
        const filePath = path_1.default.join(receiptFolder, `receipt_${commande.id}.pdf`);
        // Créer un flux d'écriture pour enregistrer le fichier
        const writeStream = fs_1.default.createWriteStream(filePath);
        // Ajouter les informations de la commande dans le PDF
        doc.fontSize(20).text("Reçu de Commande");
        doc.text(`Commande ID: ${commande.id}`);
        doc.text(`Total: ${commande.totalPrice} €`);
        doc.text(`État: ${commande.etat}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        // Finaliser le PDF
        doc.pipe(writeStream);
        doc.end();
        // Lorsque l'écriture est terminée, résoudre la promesse
        writeStream.on('finish', () => {
            resolve(filePath);
        });
        writeStream.on('error', (error) => {
            reject(error);
        });
    });
});
exports.generatePDFReceipt = generatePDFReceipt;

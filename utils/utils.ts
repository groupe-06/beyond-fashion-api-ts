import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import axios from 'axios'

const apiKey = process.env.INFOBIP_API_KEY;
const baseUrl = process.env.INFOBIP_BASE_URL;

export const cryptPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

export const comparePasswords = (password: string, hashedPassword: string) => {
    return bcrypt.compareSync(password, hashedPassword);
};

export const generateToken = async (user: any) => {
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023', {expiresIn: '24h'});
    return token;
};

export const verifyTokenValidity = async (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023');
    return decoded;
}

export const sendMail = async (to: string, subject: string, message: string, attachmentPath?: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_GOOGLE_APP,
            pass: process.env.PASSWORD_GOOGLE_APP
        }
    });

    const mailOptions: any = {
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
        const info = await transporter.sendMail(mailOptions);
        console.log("Email envoyé avec succès:", info);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        throw error; // Relancer l'erreur pour la gestion côté appelant
    }
};


export const sendSMS = async (phoneNumber: string, message: string) => {
    try {
        const response = await axios.post(`${baseUrl}/sms/2/text/advanced`, {
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

    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};


export const generatePDFReceipt = async (commande: any) => {
    return new Promise<string>((resolve, reject) => {
        const doc = new PDFDocument();

        // Dossier où les reçus seront enregistrés
        const receiptFolder = path.resolve(__dirname, '../receipts');
        // Vérifier si le dossier existe, sinon le créer
        if (!fs.existsSync(receiptFolder)) {
            fs.mkdirSync(receiptFolder, {recursive: true});
        }

        // Nom du fichier basé sur l'ID de la commande
        const filePath = path.join(receiptFolder, `receipt_${commande.id}.pdf`);

        // Créer un flux d'écriture pour enregistrer le fichier
        const writeStream = fs.createWriteStream(filePath);

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
};


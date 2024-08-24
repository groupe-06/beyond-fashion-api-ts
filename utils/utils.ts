import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
export const cryptPassword = (password: string ) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

export const comparePasswords = (password: string, hashedPassword: string ) => {
    return bcrypt.compareSync(password, hashedPassword);
};

export const generateToken = async (user: any) => {
    const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023', { expiresIn: '24h' });
    return token;
};

export const sendMail = async (to: string, subject: string, message: string) => {
    const transporter = nodemailer.createTransport({
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

    return transporter.sendMail(mailOptions);
  }

  export const generatePDFReceipt = async (commande: any) => {
    return new Promise<string>((resolve, reject) => {
      const doc = new PDFDocument();
      
      // Dossier où les reçus seront enregistrés
      const receiptFolder = path.resolve(__dirname, '../receipts');
      // Vérifier si le dossier existe, sinon le créer
      if (!fs.existsSync(receiptFolder)) {
        fs.mkdirSync(receiptFolder, { recursive: true });
      }
  
      // Nom du fichier basé sur l'ID de la commande
      const filePath = path.join(receiptFolder, `receipt_${commande.id}.pdf`);
  
      // Créer un flux d'écriture pour enregistrer le fichier
      const writeStream = fs.createWriteStream(filePath);
  
      // Ajouter les informations de la commande dans le PDF
      doc.fontSize(20).text(`Reçu de Commande`);
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
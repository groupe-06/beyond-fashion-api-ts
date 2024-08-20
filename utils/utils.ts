import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';

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



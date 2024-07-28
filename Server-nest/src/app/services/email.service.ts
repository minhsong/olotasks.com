const nodemailer = require('nodemailer');
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter;
  constructor() {
    const auth = {
      host: process.env.EMAIL_SMTP_DOMAIN,
      port: process.env.EMAIL_SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SMTP_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
      },
    };

    this.transporter = nodemailer.createTransport(auth);
  }

  async sendEmail(to, subject, text, html) {
    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  }
}

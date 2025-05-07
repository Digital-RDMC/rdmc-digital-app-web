"use server";
import nodemailer from 'nodemailer';


export async function sendEmail(to: string, token: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html2 = `
<!DOCTYPE html>
<html>
<body style="background-color: #eee; padding: 48px 32px 48px 32px">
  <div>
    <div style="padding: 32px 32px 48px 32px; font-size: 14px;">
      <p style="font-size: 18px; color: #000">RDMC Portal</p>
      <h1 style="font-size: 24px; font-weight: 900;">Verification code</h1>
      <p style="margin: 32px 0px 0px 0px">Enter the following verification code when prompted:</p>
      <p style="font-size: 40px; margin: 16px 0px 0px 0px; font-weight: 900;"><b>${token}</b></p>
      <p style="margin: 16px 0px 0px 0px">To protect your account, do not share this code.</p>
      <p style="margin: 64px 0px 0px 0px"><b>Didn't request this?</b></p>
      <p style="margin: 4px 0px 0px 0px; color: #333;">
        This message was sent from <b>RDMC Digital team</b>. If you didn't make this request, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: '"RDMC Portal" <notifications@rdmc-portal.com>',
      to,
      subject: 'Sign in to RDMC Portal',
      html: html2,
    });

    return { message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

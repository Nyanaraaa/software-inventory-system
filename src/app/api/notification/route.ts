import nodemailer from 'nodemailer';

export async function GET() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SUPERUSER_EMAIL,
        pass: process.env.SUPERUSER_PASSWORD
      }
    })

    const emailTest = {
      from: process.env.SUPERUSER_EMAIL,
      to: "",
      subject: "Inventory System Email Test",
      text: "Test Test Test"
    };

    try{
    transporter.sendMail(emailTest)

    return new Response('Email sent successfully', { status: 200 });

    } catch (error) {
      return new Response('Failed to send email', { status: 500 });
    }
  
}

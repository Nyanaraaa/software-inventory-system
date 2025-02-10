import nodemailer from 'nodemailer';
import { getExpiringProducts } from '@/actions/products';

export async function GET() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SUPERUSER_EMAIL,
      pass: process.env.SUPERUSER_PASSWORD
    }
  })

  try {
    const expiringProducts = await getExpiringProducts()

    const emailPromises = expiringProducts.map(async expiringProduct => {
      const emailTest = {
        from: process.env.SUPERUSER_EMAIL,
        to: expiringProduct.ownerEmail,
        subject: "Expiring Products",
        text: "Good day! This is an auto-generated email to inform you that " + expiringProduct.name + " is expiring on " +
          expiringProduct.expirationDate + " Please renew the product before it expires."
      };

      return transporter.sendMail(emailTest);
    });

    await Promise.all(emailPromises);
    return new Response('Owners were successfully notified', { status: 200 });
  } catch {
    return new Response('Failed to send emails', { status: 500 });
  };

}

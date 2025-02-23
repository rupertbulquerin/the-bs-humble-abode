import { json } from '@sveltejs/kit';
import { transporter } from '$lib/email';

export async function POST({ request }) {
  try {
    const { name, email, message } = await request.json();

    // Send email notification to admin
    await transporter.sendMail({
      from: '"The B\'s Humble Abode" <contact@thebshumbleabode.com>',
      replyTo: email,
      to: 'contact@thebshumbleabode.com',
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">New Contact Form Submission</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: '"The B\'s Humble Abode" <contact@thebshumbleabode.com>',
      to: email,
      subject: 'Thank you for contacting us',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Thank You for Contacting Us</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
          
          <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #4b5563; font-size: 14px;">
              Best regards,<br>
              The B's Humble Abode Team<br>
              Phone: (+63) 9514-797997<br>
              Email: contact@thebshumbleabode.com
            </p>
          </div>
        </div>
      `
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return json({ error: 'Failed to send message' }, { status: 500 });
  }
} 
import nodemailer from 'nodemailer';
import { SMTP_USER, SMTP_PASS } from '$env/static/private';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

function getPaymentInstructions(method: string) {
  switch (method) {
    case 'bank_transfer':
      return `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">BPI Bank Transfer Details</h3>
          <p style="margin-bottom: 5px;"><strong>Account Name:</strong> Andrea Audine Jandogan</p>
          <p style="margin-bottom: 5px;"><strong>Account Number:</strong> 1339275862</p>
          <p style="color: #4a5568; font-size: 14px;">Please send the screenshot of your payment to our contact number.</p>
        </div>
      `;
    case 'gcash':
      return `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">GCash Payment Details</h3>
          <p style="margin-bottom: 5px;"><strong>Account Name:</strong> AN***A AU***E B.</p>
          <p style="margin-bottom: 5px;"><strong>GCash Number:</strong> 09162484363</p>
          <p style="color: #4a5568; font-size: 14px;">Please send the screenshot of your payment to our contact number.</p>
        </div>
      `;
    default:
      return '';
  }
}

export async function sendBookingEmail(booking: any) {
  const paymentInstructions = getPaymentInstructions(booking.paymentMethod);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Your Booking is Pending Payment</h2>
      
      <p>Dear ${booking.firstName} ${booking.lastName},</p>
      
      <p>Thank you for choosing to stay with us. Your booking is currently pending payment confirmation.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
        <p><strong>Number of Guests:</strong> ${booking.guests}</p>
        <p><strong>Total Amount:</strong> ₱${booking.totalPrice}</p>
      </div>
      
      ${paymentInstructions}
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #e5e7eb;">
        <p style="color: #4b5563; font-size: 14px;">
          For assistance, please contact us:<br>
          Phone: 09514797997<br>
          Email: rupert2133@gmail.com
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"The B\'s Humble Abode" <rupert2133@gmail.com>',
    to: booking.email,
    subject: 'Booking Confirmation - Payment Required',
    html
  });
} 
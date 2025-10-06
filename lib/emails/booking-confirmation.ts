// lib/emails/booking-confirmation.ts

interface BookingEmailProps {
  customerName: string
  confirmationCode: string
  tableName: string
  date: string
  partySize: number
  bottleSubtotal: number
  depositAmount: number
  bottles: Array<{
    name: string
    quantity: number
    price: number
  }>
  occasion?: string | null
  specialRequests?: string | null
}

export function getBookingConfirmationEmail({
  customerName,
  confirmationCode,
  tableName,
  date,
  partySize,
  bottleSubtotal,
  depositAmount,
  bottles,
  occasion,
  specialRequests,
}: BookingEmailProps) {
  const remainingBalance = bottleSubtotal - depositAmount
  const bookingDate = new Date(date)
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `Booking Confirmed - ${confirmationCode.toUpperCase()}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content { 
      padding: 40px 30px; 
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .confirmation-code { 
      font-size: 36px; 
      font-weight: bold; 
      color: #0d9488; 
      text-align: center; 
      margin: 30px 0 10px 0; 
      letter-spacing: 3px;
      font-family: 'Courier New', monospace;
    }
    .code-label {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .details { 
      background: #f9fafb; 
      padding: 25px; 
      margin: 25px 0; 
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .detail-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0; 
      border-bottom: 1px solid #e5e7eb; 
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label { 
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value { 
      font-weight: 600;
      text-align: right;
      color: #1f2937;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 30px 0 15px 0;
      color: #1f2937;
    }
    .bottles { 
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .bottle-item { 
      padding: 10px 0; 
      display: flex; 
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
    }
    .bottle-item:last-child {
      border-bottom: none;
    }
    .totals { 
      background: #ecfdf5; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 8px;
      border: 2px solid #10b981;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }
    .total-row.highlight {
      font-size: 18px;
      font-weight: bold;
      color: #0d9488;
      padding-top: 15px;
      margin-top: 15px;
      border-top: 2px solid #10b981;
    }
    .info-box {
      background: #fff7ed;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .info-box li {
      margin: 8px 0;
      color: #78350f;
    }
    .button { 
      display: inline-block; 
      background: #0d9488; 
      color: white !important; 
      padding: 14px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 25px 0;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background: #0f766e;
    }
    .button-container {
      text-align: center;
    }
    .footer { 
      text-align: center; 
      padding: 30px 20px; 
      color: #6b7280; 
      font-size: 14px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .confirmation-code {
        font-size: 28px;
      }
      .detail-row {
        flex-direction: column;
        gap: 5px;
      }
      .detail-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Your table at Cantina Añejo has been reserved</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${customerName},</p>
      <p>Thank you for your reservation! We're excited to host you. Here are your booking details:</p>
      
      <div class="confirmation-code">${confirmationCode.toUpperCase()}</div>
      <p class="code-label">Save this confirmation code for your records</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Table</span>
          <span class="detail-value">${tableName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date & Time</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Party Size</span>
          <span class="detail-value">${partySize} ${partySize === 1 ? 'guest' : 'guests'}</span>
        </div>
        ${
          occasion
            ? `
        <div class="detail-row">
          <span class="detail-label">Occasion</span>
          <span class="detail-value">${occasion}</span>
        </div>
        `
            : ''
        }
      </div>
      
      ${
        specialRequests
          ? `
      <h3 class="section-title">Special Requests</h3>
      <div class="details">
        <p style="margin: 0;">${specialRequests}</p>
      </div>
      `
          : ''
      }
      
      <h3 class="section-title">Bottle Selection</h3>
      <div class="bottles">
        ${bottles
          .map(
            (b) => `
          <div class="bottle-item">
            <span><strong>${b.name}</strong> × ${b.quantity}</span>
            <span style="font-weight: 600;">$${(b.price * b.quantity).toFixed(2)}</span>
          </div>
        `
          )
          .join('')}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Total Bottle Spend</span>
          <strong>$${bottleSubtotal.toFixed(2)}</strong>
        </div>
        <div class="total-row">
          <span>Deposit Paid (15%)</span>
          <strong>$${depositAmount.toFixed(2)}</strong>
        </div>
        <div class="total-row highlight">
          <span>Balance Due at Venue</span>
          <span>$${remainingBalance.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="info-box">
        <strong style="font-size: 16px;">📋 Important Information</strong>
        <ul>
          <li>Please arrive <strong>15 minutes before</strong> your reservation time</li>
          <li>Remaining balance of <strong>$${remainingBalance.toFixed(2)}</strong> is due at the venue</li>
          <li>No-shows will forfeit the deposit</li>
          <li>For cancellations, contact us at least <strong>24 hours in advance</strong></li>
          <li>Valid ID required (21+ only)</li>
        </ul>
      </div>
      
      <div class="button-container">
        <a href="http://localhost:3000/booking/confirmation?code=${confirmationCode}" class="button">
          View Full Booking Details
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        If you have any questions or need to modify your reservation, please contact us as soon as possible.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Need Help?</strong></p>
      <p>Contact us at <strong>(555) 123-4567</strong></p>
      <p style="margin-top: 15px;">Cantina Añejo</p>
      <p>123 Main Street, Your City, State 12345</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { contactFormSchema } from '@/lib/validations/auth';
import { sanitizeFormData, createRateLimiter, applySecurityHeaders } from '@/lib/security/sanitization';

// Rate limiting: 5 submissions per hour per IP
const contactRateLimit = createRateLimiter(60 * 60 * 1000, 5);

// Get client IP for rate limiting
const getClientIP = async (request: NextRequest) => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
};

// Mock email service - replace with actual email service (SendGrid, Resend, etc.)
async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  urgency: string;
}) {
  // TODO: Implement actual email sending
  console.log('Sending contact email:', data);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, implement with your preferred email service:
  /*
  const emailData = {
    to: 'support@rentparlo.pk',
    from: 'noreply@rentparlo.pk',
    replyTo: data.email,
    subject: `Contact Form: ${data.subject} - ${data.urgency} Priority`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Priority:</strong> ${data.urgency}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007cba;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <hr>
      <p style="font-size: 12px; color: #666;">
        This message was sent from RentParLo.pk contact form.
      </p>
    `
  };
  
  // Send with your email service
  await emailService.send(emailData);
  */
}

// Send confirmation email to the user
async function sendConfirmationEmail(data: {
  name: string;
  email: string;
  subject: string;
}) {
  // TODO: Implement confirmation email
  console.log('Sending confirmation email to:', data.email);
  
  /*
  const confirmationData = {
    to: data.email,
    from: 'support@rentparlo.pk',
    subject: 'We received your message - RentParLo.pk',
    html: `
      <h2>Thank you for contacting us!</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your message regarding "<strong>${data.subject}</strong>" and will get back to you within 24 hours.</p>
      <p>If you have any urgent concerns, please call us at +92 300 123 4567.</p>
      <p>Best regards,<br>RentParLo.pk Support Team</p>
    `
  };
  
  await emailService.send(confirmationData);
  */
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = await getClientIP(request);
    if (!contactRateLimit(clientIP)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Too many submissions. Please try again in an hour.' },
          { status: 429 }
        )
      );
    }

    // Parse form data
    const formData = await request.formData();
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      urgency: formData.get('urgency') as string
    };

    // Sanitize input data
    const sanitizedData = sanitizeFormData(rawData);

    // Validate with Zod schema
    const validationResult = contactFormSchema.safeParse(sanitizedData);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message).join(', ');
      return applySecurityHeaders(
        NextResponse.json(
          { error: `Validation failed: ${errors}` },
          { status: 400 }
        )
      );
    }

    const validData = validationResult.data;

    // Check for spam indicators (basic implementation)
    const spamKeywords = ['viagra', 'casino', 'bitcoin', 'crypto', 'loan', 'investment'];
    const messageText = validData.message.toLowerCase();
    const hasSpam = spamKeywords.some(keyword => messageText.includes(keyword));
    
    if (hasSpam) {
      // Log potential spam but don't inform the user
      console.log('Potential spam detected:', { email: validData.email, message: validData.message });
      
      // Return success to prevent spam bots from knowing they were blocked
      return applySecurityHeaders(
        NextResponse.json({ success: true, message: 'Message sent successfully' })
      );
    }

    // Send emails
    await Promise.all([
      sendContactEmail(validData),
      sendConfirmationEmail(validData)
    ]);

    // Log successful submission (in production, use proper logging service)
    console.log('Contact form submission successful:', {
      email: validData.email,
      subject: validData.subject,
      urgency: validData.urgency,
      timestamp: new Date().toISOString(),
      ip: clientIP
    });

    return applySecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'Message sent successfully. We\'ll get back to you soon!'
      })
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return applySecurityHeaders(
      NextResponse.json(
        { error: 'An unexpected error occurred. Please try again later.' },
        { status: 500 }
      )
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return applySecurityHeaders(
    NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  );
}

export async function PUT() {
  return applySecurityHeaders(
    NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  );
}

export async function DELETE() {
  return applySecurityHeaders(
    NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  );
}
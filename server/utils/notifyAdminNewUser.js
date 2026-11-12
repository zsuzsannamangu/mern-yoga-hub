const sgMail = require('@sendgrid/mail');

/**
 * Notify admin when a new customer account is created.
 * Does not throw — registration should still succeed if this email fails.
 */
async function notifyAdminNewUser({ firstName, lastName, email, method = 'email' }) {
    const to = process.env.EMAIL_RECEIVER;
    const from = process.env.EMAIL_USER;

    if (!to || !from || !process.env.SENDGRID_API_KEY) {
        console.warn('Admin new-user email skipped: EMAIL_RECEIVER, EMAIL_USER, or SENDGRID_API_KEY missing');
        return false;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown';
    const methodLabel = method === 'google' ? 'Google sign-in' : 'Email registration';

    try {
        await sgMail.send({
            to,
            from,
            subject: `New customer account: ${name}`,
            text: `A new customer registered.\n\nName: ${name}\nEmail: ${email}\nMethod: ${methodLabel}\n`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="margin-bottom: 8px;">New customer account</h2>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Method:</strong> ${methodLabel}</p>
                </div>
            `,
        });
        console.log(`Admin notified of new user registration: ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send admin new-user email:', {
            message: error.message,
            sendGrid: error.response?.body,
            email,
        });
        return false;
    }
}

module.exports = { notifyAdminNewUser };

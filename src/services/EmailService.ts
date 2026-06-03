export class EmailService {
  private smtpHost = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  private smtpPort = parseInt(process.env.SMTP_PORT || '2525');
  private smtpUser = process.env.SMTP_USER;
  private smtpPassword = process.env.SMTP_PASSWORD;
  private from = process.env.SMTP_FROM || 'noreply@beercellar.com';

  async sendReminderEmail(to: string, beerName: string, brewery: string): Promise<void> {
    try {
      const subject = `Consumption Reminder: ${brewery} - ${beerName}`;
      const htmlContent = `
        <h2>Time to enjoy your beer!</h2>
        <p>Hi,</p>
        <p>This is a reminder that it's a good time to consume:</p>
        <p><strong>${brewery} - ${beerName}</strong></p>
        <p>Log in to your Beer Cellar to mark it as consumed.</p>
        <p>Cheers!</p>
      `;

      // TODO: replace with nodemailer or AWS SES in production
      console.log(`[EmailService] Reminder to ${to} | subject: ${subject} | smtp: ${this.smtpHost}:${this.smtpPort} | from: ${this.from}`, htmlContent);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const subject = 'Welcome to Beer Cellar!';
      const htmlContent = `
        <h2>Welcome to Beer Cellar!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created successfully.</p>
        <p>Start managing your beer collection today!</p>
      `;

      // TODO: replace with nodemailer or AWS SES in production
      console.log(`[EmailService] Welcome to ${to} | subject: ${subject} | smtp: ${this.smtpHost}:${this.smtpPort} | user: ${this.smtpUser}`, htmlContent);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}

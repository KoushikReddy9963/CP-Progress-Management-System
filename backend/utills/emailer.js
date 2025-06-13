import nodemailer from 'nodemailer';

class Emailer {
  constructor() {
    // Hardcoded credentials for direct testing
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'koushikreddy.ys@gmail.com',
        pass: 'ayze dusq infk horz'
      }
    });
  }

  async sendInactivityReminder(student) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Coding Activity Reminder - Time to Practice!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Hi ${student.name}! 👋</h2>
          
          <p>We noticed you haven't been active on Codeforces lately. It's been a while since your last submission!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Your Stats:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Current Rating:</strong> ${student.currentRating || 'Unrated'}</li>
              <li><strong>Max Rating:</strong> ${student.maxRating || 'Unrated'}</li>
              <li><strong>Codeforces Handle:</strong> ${student.cfHandle}</li>
            </ul>
          </div>
          
          <p>Remember, consistent practice is key to improving your programming skills! 💪</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://codeforces.com/contests" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Solving Problems
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            Keep coding and keep growing! 🚀<br>
            Student Progress Management System
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Inactivity email sent to ${student.email}`);
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${student.email}:`, error);
      return false;
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

const emailer = new Emailer();
export default emailer;
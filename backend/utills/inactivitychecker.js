import moment from 'moment';
import Student from '../models/student.js';
import emailer from './emailer.js';

const inactivityChecker = {
  async checkInactivity(studentId = null) {
    console.log('Checking for inactive students...');
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    try {
      let query = {
        emailDisabled: false,
        remindersSent: { $lt: 3 }
      };
      if (studentId) {
        query._id = studentId;
      } else {
        query.$or = [
          { lastActivity: { $lt: sevenDaysAgo } },
          { lastActivity: null }
        ];
      }
      const inactiveStudents = await Student.find(query);
      console.log(`Found ${inactiveStudents.length} inactive students`);
      for (const student of inactiveStudents) {
        let lastActiveLog = student.lastActivity ? moment(student.lastActivity).format('YYYY-MM-DD HH:mm:ss') : 'never';
        console.log(`Student: ${student.name} (${student.email}) | Last Active: ${lastActiveLog}`);
        // Send reminder email
        const emailSent = await emailer.sendInactivityReminder(student);
        if (emailSent) {
          console.log(`Email sent successfully to ${student.email}`);
          // Update reminder count
          await Student.findByIdAndUpdate(student._id, {
            $inc: { remindersSent: 1 }
          });
        } else {
          console.log(`Failed to send email to ${student.email}`);
        }
      }
    } catch (error) {
      console.error('Error checking inactivity:', error);
    }
  }
};

export default inactivityChecker;
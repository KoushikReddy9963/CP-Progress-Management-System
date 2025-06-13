import cron from 'node-cron';
import Student from '../models/student.js';
import cfFetcher from '../utills/fetcher.js';
import inactivityChecker from '../utills/inactivitychecker.js';

const dailySync = {
  start() {
    // Run daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Starting daily sync at', new Date().toISOString());
      await this.syncAllStudents();
      await inactivityChecker.checkInactivity();
      console.log('Daily sync completed');
    });

    console.log('Daily sync cron job started (2:00 AM)');
  },

  async syncAllStudents() {
    try {
      const students = await Student.find();
      console.log(`Starting sync for ${students.length} students`);

      for (const student of students) {
        try {
          await cfFetcher.syncStudent(student);
          await student.save();
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Failed to sync ${student.cfHandle}:`, error.message);
        }
      }
      
      console.log('All students synced successfully');
    } catch (error) {
      console.error('Error in daily sync:', error);
    }
  },

  // Manual sync method for testing
  async runManualSync() {
    console.log('Running manual sync...');
    await this.syncAllStudents();
    await inactivityChecker.checkInactivity();
  }
};

export default dailySync;
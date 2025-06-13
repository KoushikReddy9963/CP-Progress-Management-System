import express from 'express';
import Student from '../models/student.js';
import cfFetcher from '../utills/fetcher.js';

const router = express.Router();

// @desc    Manually sync all students
// @route   POST /api/sync/all
// @access  Public
router.post('/all', async (req, res) => {
  try {
    const dailySync = await import('../cron/dailySync.js');
    await dailySync.default.runManualSync();
    
    res.json({ message: 'All students synced successfully' });
  } catch (error) {
    console.error('Sync all error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Manually sync single student
// @route   POST /api/sync/:id
// @access  Public
router.post('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await cfFetcher.syncStudent(student);
    await student.save();

    res.json({ 
      message: 'Student synced successfully',
      student: student
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
import Student from '../models/student.js';
import cfFetcher from '../utills/fetcher.js';
import inactivityChecker from '../utills/inactivitychecker.js';
import moment from 'moment';
import emailer from '../utills/emailer.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Public
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-contests -submissions');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student 
// @route   GET /api/students/:id
// @access  Public
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Public
export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, cfHandle } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { cfHandle }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or Codeforces handle already exists' 
      });
    }

    const student = new Student({
      name,
      email,
      phone,
      cfHandle
    });

    // Fetch initial data from Codeforces
    try {
      await cfFetcher.syncStudent(student);
    } catch (cfError) {
      console.log('Warning: Could not sync CF data:', cfError.message);
    }

    const savedStudent = await student.save();
    // Trigger inactivity check for this student only
    await inactivityChecker.checkInactivity(savedStudent._id);
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
export const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, cfHandle } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldHandle = student.cfHandle;
    
    student.name = name || student.name;
    student.email = email || student.email;
    student.phone = phone || student.phone;
    student.cfHandle = cfHandle || student.cfHandle;

    // If handle changed, sync new data
    if (oldHandle !== student.cfHandle) {
      try {
        await cfFetcher.syncStudent(student);
      } catch (cfError) {
        console.log('Warning: Could not sync CF data:', cfError.message);
      }
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Public
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inactive students
// @route   GET /api/students/inactive
// @access  Public
export const getInactiveStudents = async (req, res) => {
  try {
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    const students = await Student.find({
      $or: [
        { lastActivity: { $lt: sevenDaysAgo } },
        { lastActivity: null }
      ],
      emailDisabled: false,
      remindersSent: { $lt: 3 }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send inactivity mail to a student
// @route   POST /api/students/:id/mail-inactive
// @access  Public
export const mailInactiveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const sent = await emailer.sendInactivityReminder(student);
    if (sent) {
      await Student.findByIdAndUpdate(student._id, { $inc: { remindersSent: 1 } });
      res.json({ message: 'Mail sent' });
    } else {
      res.status(500).json({ message: 'Failed to send mail' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send inactivity mail to all inactive students
// @route   POST /api/students/mail-inactive-all
// @access  Public
export const mailInactiveAll = async (req, res) => {
  try {
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    const students = await Student.find({
      $or: [
        { lastActivity: { $lt: sevenDaysAgo } },
        { lastActivity: null }
      ],
      emailDisabled: false,
      remindersSent: { $lt: 3 }
    });
    let count = 0;
    for (const student of students) {
      const sent = await emailer.sendInactivityReminder(student);
      if (sent) {
        await Student.findByIdAndUpdate(student._id, { $inc: { remindersSent: 1 } });
        count++;
      }
    }
    res.json({ message: `Mails sent to ${count} students` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
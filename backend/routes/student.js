import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getInactiveStudents,
  mailInactiveStudent,
  mailInactiveAll
} from '../controllers/studentcontroller.js';

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/inactive')
  .get(getInactiveStudents);

router.route('/mail-inactive-all')
  .post(mailInactiveAll);

router.route('/:id')
  .get(getStudent)
  .put(updateStudent)
  .delete(deleteStudent);

router.route('/:id/mail-inactive')
  .post(mailInactiveStudent);

export default router;
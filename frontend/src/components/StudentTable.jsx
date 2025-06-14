import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const isInactive = (student) => {
  if (!student.lastActivity) return true;
  const last = new Date(student.lastActivity);
  return (Date.now() - last.getTime()) > 7 * 24 * 3600 * 1000;
};

const StudentTable = ({ students, onEdit, onDelete, onView }) => (
  <Table striped bordered hover responsive className="align-middle">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>CF Handle</th>
        <th>Current Rating</th>
        <th>Max Rating</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {students.map(student => (
        <tr key={student._id}>
          <td>{student.name}</td>
          <td>{student.email}</td>
          <td>{student.phone}</td>
          <td>{student.cfHandle}</td>
          <td>{student.currentRating}</td>
          <td>{student.maxRating}</td>
          <td>
            {isInactive(student) ? <Badge bg="danger">Inactive</Badge> : <Badge bg="success">Active</Badge>}
          </td>
          <td>
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center align-items-center">
              <Button size="sm" variant="info" onClick={() => onView(student._id)}>
                View More
              </Button>
              <Button size="sm" variant="warning" onClick={() => onEdit(student)}>
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(student._id)}>
                Delete
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default StudentTable;

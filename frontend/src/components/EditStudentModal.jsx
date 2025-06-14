import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditStudentModal = ({ show, handleClose, handleEdit, student }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cfHandle: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) setForm(student);
  }, [student]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await handleEdit(form);
      handleClose();
    } catch (err) {
      setError(err.message || 'Error editing student');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Student</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Codeforces Handle</Form.Label>
            <Form.Control name="cfHandle" value={form.cfHandle} onChange={handleChange} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditStudentModal;

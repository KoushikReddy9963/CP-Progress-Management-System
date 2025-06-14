import React, { useEffect, useState } from 'react';
import api from '../api';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const InactiveStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mailing, setMailing] = useState(false);
  const [mailStatus, setMailStatus] = useState('');

  const fetchInactive = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students/inactive');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch inactive students');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInactive();
  }, []);

  const handleMail = async (id) => {
    setMailing(true);
    setMailStatus('');
    try {
      await api.post(`/students/${id}/mail-inactive`);
      setMailStatus('Mail sent successfully!');
      fetchInactive();
    } catch (err) {
      setMailStatus('Failed to send mail');
    }
    setMailing(false);
  };

  const handleMailAll = async () => {
    setMailing(true);
    setMailStatus('');
    try {
      await api.post('/students/mail-inactive-all');
      setMailStatus('Mails sent to all inactive students!');
      fetchInactive();
    } catch (err) {
      setMailStatus('Failed to send mails');
    }
    setMailing(false);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                <h2 className="mb-0">Inactive Students</h2>
                <Button variant="outline-primary" onClick={fetchInactive} disabled={loading}>
                  Refresh
                </Button>
              </div>
              {mailStatus && <Alert variant="info">{mailStatus}</Alert>}
              <div className="mb-3 d-flex flex-wrap gap-2">
                <Button variant="danger" onClick={handleMailAll} disabled={mailing || students.length === 0}>
                  Send All Mails
                </Button>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              {loading ? (
                <div>Loading...</div>
              ) : students.length === 0 ? (
                <div>No inactive students found.</div>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover responsive className="align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>CF Handle</th>
                        <th>Last Activity</th>
                        <th>Reminders Sent</th>
                        <th>Mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.phone}</td>
                          <td>{s.cfHandle}</td>
                          <td>{s.lastActivity ? new Date(s.lastActivity).toLocaleString() : 'Never'}</td>
                          <td>{s.remindersSent}</td>
                          <td>
                            <Button size="sm" variant="warning" onClick={() => handleMail(s._id)} disabled={mailing}>
                              Send Mail
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InactiveStudents;

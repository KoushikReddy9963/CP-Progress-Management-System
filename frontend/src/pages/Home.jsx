import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import StudentTable from '../components/StudentTable';
import AddStudentModal from '../components/AddStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';

const Home = ({ theme, toggleTheme }) => {
  const [students, setStudents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (data) => {
    const res = await api.post('/students', data);
    setStudents([...students, res.data]);
    window.alert('Student added successfully!');
  };

  const handleEdit = async (data) => {
    const res = await api.put(`/students/${data._id}`, data);
    setStudents(students.map(s => (s._id === data._id ? res.data : s)));
    window.alert('Student updated successfully!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await api.delete(`/students/${id}`);
    setStudents(students.filter(s => s._id !== id));
    window.alert('Student deleted successfully!');
  };

  const handleView = (id) => {
    navigate(`/student/${id}`);
  };

  const handleExport = () => {
    window.open('http://localhost:5000/api/export/csv', '_blank');
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={11} lg={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                <h2 className="mb-0">Student Progress Table</h2>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
              <div className="mb-3 d-flex flex-wrap gap-2">
                <Button variant="success" onClick={() => setShowAdd(true)}>
                  Add Student
                </Button>
                <Button variant="outline-primary" onClick={handleExport}>
                  Export CSV
                </Button>
                <Button variant="outline-info" onClick={() => navigate('/inactive')}>
                  Inactive Students
                </Button>
                <Button 
                  variant="danger" 
                  className={`sync-all-btn${theme === 'dark' ? ' theme-dark' : ''}`} 
                  onClick={async () => {
                    await api.post('/sync/all');
                    fetchStudents();
                    window.alert('All students synced successfully!');
                  }}
                >
                  Sync All
                </Button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <StudentTable
                    students={students}
                    onEdit={student => {
                      setEditStudent(student);
                      setShowEdit(true);
                    }}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </div>
              )}
              <AddStudentModal
                show={showAdd}
                handleClose={() => setShowAdd(false)}
                handleAdd={handleAdd}
              />
              <EditStudentModal
                show={showEdit}
                handleClose={() => setShowEdit(false)}
                handleEdit={handleEdit}
                student={editStudent}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

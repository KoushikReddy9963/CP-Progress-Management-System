import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import api from '../api';
import { Line, Bar } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const dayOptions = [30, 90, 365];
const problemDayOptions = [7, 30, 90];

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [contestDays, setContestDays] = useState(90);
  const [problemDays, setProblemDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        setError('Failed to fetch student');
      }
      setLoading(false);
    };
    fetchStudent();
  }, [id]);

  if (loading) return <Container className="py-4">Loading...</Container>;
  if (error) return <Container className="py-4"><div className="alert alert-danger">{error}</div></Container>;
  if (!student) return null;

  // Contest history chart data
  const contests = (student.contests || []).filter(c => {
    const cutoff = Date.now() / 1000 - contestDays * 24 * 3600;
    return c.ratingUpdateTimeSeconds > cutoff;
  });
  const contestLabels = contests.map(c => new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString());
  const contestRatings = contests.map(c => c.newRating);

  // Problem stats (simulate, as backend does not provide directly)
  const submissions = (student.submissions || []).filter(s => {
    const cutoff = Date.now() / 1000 - problemDays * 24 * 3600;
    return s.creationTimeSeconds > cutoff && s.verdict === 'OK';
  });
  const problems = {};
  submissions.forEach(s => {
    const key = s.problem.contestId + s.problem.index;
    problems[key] = s.problem;
  });
  const uniqueProblems = Object.values(problems);
  const ratings = uniqueProblems.map(p => p.rating).filter(Boolean);
  const mostDifficult = uniqueProblems.reduce((a, b) => (!a || (b.rating > a.rating)) ? b : a, null);
  const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  const avgPerDay = (uniqueProblems.length / problemDays).toFixed(1);

  // Bar chart data (problems solved by rating)
  const ratingBuckets = [
    { label: '<1200', min: 0, max: 1199 },
    { label: '1200-1399', min: 1200, max: 1399 },
    { label: '1400-1599', min: 1400, max: 1599 },
    { label: '1600-1899', min: 1600, max: 1899 },
    { label: '1900-2099', min: 1900, max: 2099 },
    { label: '2100-2399', min: 2100, max: 2399 },
    { label: '2400+', min: 2400, max: 3500 },
  ];
  const ratingDist = ratingBuckets.map(bucket =>
    ratings.filter(r => r >= bucket.min && r <= bucket.max).length
  );

  // Submission heatmap data
  const heatmapValues = submissions.map(s => ({
    date: new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10),
    count: 1,
  }));
  const heatmapMap = {};
  heatmapValues.forEach(v => {
    heatmapMap[v.date] = (heatmapMap[v.date] || 0) + 1;
  });
  const heatmapData = Object.keys(heatmapMap).map(date => ({ date, count: heatmapMap[date] }));

  return (
    <Container className="py-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>
        &larr; Back
      </Button>
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
              <div style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: '#f0f4f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 700,
                color: '#007bff',
                margin: '0 auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
              }}>{student.name[0]}</div>
            </Col>
            <Col xs={12} md={9}>
              <h2 className="fw-bold mb-1">{student.name} <small className="text-muted">({student.cfHandle})</small></h2>
              <div className="mb-2">
                <span className="me-3"><strong>Email:</strong> {student.email}</span>
                <span className="me-3"><strong>Phone:</strong> {student.phone}</span>
              </div>
              <div>
                <span className="me-3"><strong>Current Rating:</strong> <span className="badge bg-primary fs-6">{student.currentRating}</span></span>
                <span><strong>Max Rating:</strong> <span className="badge bg-success fs-6">{student.maxRating}</span></span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row>
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Contest History</h5>
                <div>
                  {dayOptions.map(days => (
                    <Button
                      key={days}
                      size="sm"
                      variant={contestDays === days ? 'primary' : 'outline-primary'}
                      className="me-2"
                      onClick={() => setContestDays(days)}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Line
                data={{
                  labels: contestLabels,
                  datasets: [{
                    label: 'Rating',
                    data: contestRatings,
                    fill: false,
                    borderColor: '#007bff',
                    tension: 0.2,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: false } },
                }}
                height={120}
              />
              <div className="mt-3">
                <h6>Contests</h6>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  <TableContestList contests={contests} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-white border-0 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Problem Solving Data</h5>
                <div>
                  {problemDayOptions.map(days => (
                    <Button
                      key={days}
                      size="sm"
                      variant={problemDays === days ? 'primary' : 'outline-primary'}
                      className="me-2"
                      onClick={() => setProblemDays(days)}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 text-center">
                <Col xs={4}><div className="fs-5 fw-bold">{uniqueProblems.length}</div><div className="text-muted">Total Solved</div></Col>
                <Col xs={4}><div className="fs-5 fw-bold">{avgRating}</div><div className="text-muted">Avg Rating</div></Col>
                <Col xs={4}><div className="fs-5 fw-bold">{avgPerDay}</div><div className="text-muted">Avg/Day</div></Col>
              </Row>
              <div className="mb-3">
                <strong>Most Difficult Problem:</strong> {mostDifficult ? `${mostDifficult.name} (${mostDifficult.rating})` : 'N/A'}
              </div>
              <Row>
                <Col xs={12} md={6} className="mb-4 mb-md-0">
                  <Bar
                    data={{
                      labels: ratingBuckets.map(b => b.label),
                      datasets: [{
                        label: 'Problems Solved',
                        data: ratingDist,
                        backgroundColor: '#28a745',
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                    height={180}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <h6>Submission Heatmap</h6>
                  <CalendarHeatmap
                    startDate={new Date(Date.now() - problemDays * 24 * 3600 * 1000)}
                    endDate={new Date()}
                    values={heatmapData}
                    classForValue={value => {
                      if (!value) return 'color-empty';
                      if (value.count >= 4) return 'color-github-4';
                      if (value.count === 3) return 'color-github-3';
                      if (value.count === 2) return 'color-github-2';
                      return 'color-github-1';
                    }}
                    showWeekdayLabels
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const TableContestList = ({ contests }) => (
  <table className="table table-sm table-bordered">
    <thead>
      <tr>
        <th>Date</th>
        <th>Name</th>
        <th>Rank</th>
        <th>Rating Change</th>
      </tr>
    </thead>
    <tbody>
      {contests.map(c => (
        <tr key={c.contestId}>
          <td>{new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}</td>
          <td>{c.contestName}</td>
          <td>{c.rank}</td>
          <td>{c.newRating - c.oldRating}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default StudentProfile;

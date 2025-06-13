import { Parser } from 'json2csv';
import Student from '../models/student.js';
import cfFetcher from '../utills/fetcher.js';

// @desc    Export all students to CSV
// @route   GET /api/export/csv
// @access  Public
export const exportCSV = async (req, res) => {
    try {
        const students = await Student.find();

        const exportData = students.map(student => {
            const stats30 = cfFetcher.getProblemsStats(student, 30);
            const stats90 = cfFetcher.getProblemsStats(student, 90);

            return {
                name: student.name,
                email: student.email,
                phone: student.phone,
                cfHandle: student.cfHandle,
                currentRating: student.currentRating || 0,
                maxRating: student.maxRating || 0,
                totalContests: student.contests.length,
                totalSubmissions: student.submissions.length,
                problemsSolved30Days: stats30.totalSolved,
                avgRating30Days: stats30.avgRating,
                problemsSolved90Days: stats90.totalSolved,
                avgRating90Days: stats90.avgRating,
                lastSynced: student.lastSynced,
                lastActivity: student.lastActivity,
                remindersSent: student.remindersSent
            };
        });

        const fields = [
            'name',
            'email',
            'phone',
            'cfHandle',
            'currentRating',
            'maxRating',
            'totalContests',
            'totalSubmissions',
            'problemsSolved30Days',
            'avgRating30Days',
            'problemsSolved90Days',
            'avgRating90Days',
            'lastSynced',
            'lastActivity',
            'remindersSent'
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(exportData);

        res.header('Content-Type', 'text/csv');
        res.attachment('students-report.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error exporting data' });
    }
};
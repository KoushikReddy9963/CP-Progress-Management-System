import axios from 'axios';
import moment from 'moment';

const CF_API_BASE = 'https://codeforces.com/api';

class CFError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CFError';
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cfFetcher = {
  async fetchUserRating(handle) {
    try {
      await delay(1000); // Rate limiting
      const response = await axios.get(`${CF_API_BASE}/user.rating`, {
        params: { handle },
        timeout: 10000
      });
      
      if (response.data.status !== 'OK') {
        throw new CFError(`CF API Error: ${response.data.comment}`);
      }
      
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new CFError('User not found or has no rating');
      }
      throw new CFError(`Failed to fetch rating: ${error.message}`);
    }
  },

  async fetchUserSubmissions(handle, from = 1, count = 10000) {
    try {
      await delay(1000); // Rate limiting
      const response = await axios.get(`${CF_API_BASE}/user.status`, {
        params: { handle, from, count },
        timeout: 15000
      });
      
      if (response.data.status !== 'OK') {
        throw new CFError(`CF API Error: ${response.data.comment}`);
      }
      
      return response.data.result;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new CFError('User not found');
      }
      throw new CFError(`Failed to fetch submissions: ${error.message}`);
    }
  },

  async syncStudent(student) {
    console.log(`Syncing data for ${student.cfHandle}...`);
    
    try {
      // Fetch rating history (contests)
      const contests = await this.fetchUserRating(student.cfHandle);
      student.contests = contests;
      
      // Update current and max rating
      if (contests.length > 0) {
        const latestContest = contests[contests.length - 1];
        student.currentRating = latestContest.newRating;
        student.maxRating = Math.max(...contests.map(c => c.newRating));
      }
      
      // Fetch submissions
      const submissions = await this.fetchUserSubmissions(student.cfHandle);
      // Filter out submissions with invalid or missing problem field
      student.submissions = submissions.filter(s => s.problem && typeof s.problem === 'object' && s.problem.contestId && s.problem.index);
      
      // Update last activity
      if (student.submissions.length > 0) {
        const latestSubmission = student.submissions.reduce((latest, current) => 
          current.creationTimeSeconds > latest.creationTimeSeconds ? current : latest
        );
        student.lastActivity = new Date(latestSubmission.creationTimeSeconds * 1000);
      } else {
        student.lastActivity = null;
      }
      
      student.lastSynced = new Date();
      console.log(`Successfully synced ${student.cfHandle}`);
      
    } catch (error) {
      console.error(`Error syncing ${student.cfHandle}:`, error.message);
      throw error;
    }
  },

  // Helper methods for data analysis
  getContestHistory(student, days = 365) {
    const cutoffDate = moment().subtract(days, 'days');
    return student.contests.filter(contest => 
      moment.unix(contest.ratingUpdateTimeSeconds).isAfter(cutoffDate)
    );
  },

  getSubmissions(student, days = 30) {
    const cutoffDate = moment().subtract(days, 'days');
    return student.submissions.filter(submission => 
      moment.unix(submission.creationTimeSeconds).isAfter(cutoffDate)
    );
  },

  getAcceptedSubmissions(student, days = 30) {
    return this.getSubmissions(student, days).filter(s => s.verdict === 'OK');
  },

  getProblemsStats(student, days = 30) {
    const accepted = this.getAcceptedSubmissions(student, days);
    const problems = new Map();
    
    accepted.forEach(submission => {
      const key = `${submission.problem.contestId}-${submission.problem.index}`;
      if (!problems.has(key)) {
        problems.set(key, submission.problem);
      }
    });
    
    const uniqueProblems = Array.from(problems.values());
    const ratingsArray = uniqueProblems
      .filter(p => p.rating)
      .map(p => p.rating);
    
    return {
      totalSolved: uniqueProblems.length,
      avgRating: ratingsArray.length > 0 ? 
        Math.round(ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length) : 0,
      maxRating: ratingsArray.length > 0 ? Math.max(...ratingsArray) : 0,
      avgPerDay: Math.round(uniqueProblems.length / days * 10) / 10,
      ratingDistribution: this.getRatingDistribution(uniqueProblems)
    };
  },

  getRatingDistribution(problems) {
    const distribution = {};
    const ranges = [
      { min: 0, max: 1199, label: '< 1200' },
      { min: 1200, max: 1399, label: '1200-1399' },
      { min: 1400, max: 1599, label: '1400-1599' },
      { min: 1600, max: 1899, label: '1600-1899' },
      { min: 1900, max: 2099, label: '1900-2099' },
      { min: 2100, max: 2399, label: '2100-2399' },
      { min: 2400, max: 3500, label: '2400+' }
    ];
    
    ranges.forEach(range => {
      distribution[range.label] = problems.filter(p => 
        p.rating && p.rating >= range.min && p.rating <= range.max
      ).length;
    });
    
    return distribution;
  }
};

export default cfFetcher;
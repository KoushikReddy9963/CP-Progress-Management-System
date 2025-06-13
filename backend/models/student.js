import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  type: String,
  rating: Number,
  tags: [String]
}, { _id: false });

const ContestSchema = new mongoose.Schema({
  contestId: Number,
  contestName: String,
  handle: String,
  rank: Number,
  oldRating: Number,
  newRating: Number,
  ratingUpdateTimeSeconds: Number
});

const SubmissionSchema = new mongoose.Schema({
  id: Number,
  contestId: Number,
  creationTimeSeconds: Number,
  relativeTimeSeconds: Number,
  problem: ProblemSchema,
  author: {
    contestId: Number,
    members: [{
      handle: String
    }],
    participantType: String,
    ghost: Boolean,
    startTimeSeconds: Number
  },
  programmingLanguage: String,
  verdict: String,
  testset: String,
  passedTestCount: Number,
  timeConsumedMillis: Number,
  memoryConsumedBytes: Number
});

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  cfHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  contests: [ContestSchema],
  submissions: [SubmissionSchema],
  lastSynced: {
    type: Date,
    default: Date.now
  },
  emailDisabled: {
    type: Boolean,
    default: false
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', StudentSchema);
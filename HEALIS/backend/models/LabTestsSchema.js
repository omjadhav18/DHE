const mongoose = require('mongoose')

const LabTestSchema = new mongoose.Schema({
  userId: {  // Added userId field
    type: String,
    required: true,
    ref: 'User'
  },
  patient: {
    patientId: {
      type: String,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  tests: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time in HH:MM format']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', LabTestSchema);
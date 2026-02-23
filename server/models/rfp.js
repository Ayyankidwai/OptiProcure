const mongoose = require('mongoose');

const RFPSchema = new mongoose.Schema({
  title: { type: String, required: true },
  budget: { type: String },
  deadline: { type: String },
  items: { type: Array },
  paymentTerms: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Closed'], 
    default: 'Draft' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RFP', RFPSchema);
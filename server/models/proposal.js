const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorEmail: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  proposedItems: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    notes: String
  }],
  paymentTerms: {
    type: String
  },
  rawEmailBody: {
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Proposal', proposalSchema);
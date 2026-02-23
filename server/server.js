require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5001;

// Models
const RFP = require('./models/rfp'); 
const Vendor = require('./models/vendor');
const Proposal = require('./models/proposal'); 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// ROUTES
// ==========================================

app.get('/', (req, res) => {
  res.send('🚀 Backend Server is running on Port 5001!');
});

// 1. GENERATE & SAVE NEW RFP (FIXED ROUTE)
app.post('/api/rfps', async (req, res) => {   
  try {
    const { prompt } = req.body;
    console.log("🤖 Asking Gemini to generate RFP from prompt:", prompt);

    const aiPrompt = `
      You are an expert procurement manager. The user needs to buy the following: "${prompt}"
      
      Generate a professional Request for Proposal (RFP).
      You MUST respond with ONLY a valid JSON object. Do not include markdown formatting, code blocks, or extra text.
      Use exactly these lowercase keys:
      {
        "title": "<A professional title for this RFP>",
        "budget": "<Estimated budget as a string, e.g., '$10,000 USD'>",
        "deadline": "<A logical deadline date as a string YYYY-MM-DD>",
        "items": [
          { "name": "<Item name>", "quantity": <Number>, "specs": "<brief spec>" }
        ],
        "paymentTerms": "<e.g. Net 30>"
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(aiPrompt);
    
    // Strip markdown formatting to ensure clean JSON parsing
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const rfpData = JSON.parse(responseText);
    
    console.log("✅ AI Parsed Data successfully:", rfpData.title);

    // Now save the structured AI data to MongoDB
    const newRFP = new RFP(rfpData);
    await newRFP.save();
    
    res.status(201).json({ success: true, rfp: newRFP });
  } catch (error) {
    console.error("❌ RFP Generation/Save Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate and save RFP." });
  }
});

// 2. GET ALL RFPs
app.get('/api/rfps', async (req, res) => {
  try {
    const rfps = await RFP.find().lean();
    for (let rfp of rfps) {
      const count = await Proposal.countDocuments({ rfpId: rfp._id });
      rfp.proposalCount = count;
    }
    res.json(rfps);
  } catch (error) {
    console.error("❌ Fetch RFPs Error:", error);
    res.status(500).json({ error: "Failed to fetch RFPs" });
  }
});

// 3. DELETE RFP
app.delete('/api/rfps/:id', async (req, res) => {
  try {
    console.log("🗑️ Attempting to delete ID:", req.params.id);
    const deletedRFP = await RFP.findByIdAndDelete(req.params.id);
    if (!deletedRFP) {
      return res.status(404).json({ message: "RFP not found" });
    }
    res.json({ success: true, message: "RFP deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. CREATE VENDOR
app.post('/api/vendors', async (req, res) => { 
  try {
    console.log("💾 Saving new vendor:", req.body.name);
    const newVendor = new Vendor(req.body);
    await newVendor.save();
    res.json({ success: true, vendor: newVendor });
  } catch (error) {
    console.error("❌ Vendor Save Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET VENDORS
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    console.error("❌ Vendor Fetch Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. SEND EMAIL TO VENDORS
app.post('/api/rfps/:id/send', async (req, res) => {
  try {
    const { vendorEmails } = req.body;
    const rfp = await RFP.findById(req.params.id);
    if (!rfp) return res.status(404).json({ error: "RFP not found" });
    
    const itemsList = rfp.items.map(item => 
      `- ${item.quantity}x ${item.name} (${item.specs || 'N/A'})`
    ).join('\n');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: vendorEmails,
      subject: `Request for Proposal: ${rfp.title}`,
      text: `Hello,\n\nWe are currently accepting proposals for the following procurement request:\n\nProject Title: ${rfp.title}\nEstimated Budget: ${rfp.budget}\nSubmission Deadline: ${rfp.deadline}\nPayment Terms: ${rfp.paymentTerms || 'Standard'}\n\n**Items Required:**\n${itemsList}\n\nPlease reply directly to this email with your pricing and proposal.\nThank you!`
    };
    
    await transporter.sendMail(mailOptions);
    rfp.status = 'Sent';
    await rfp.save();
    console.log(`✅ RFP sent to: ${vendorEmails.join(', ')}`);
    res.json({ success: true, message: "Emails sent successfully!", rfp });
  } catch (error) {
    console.error("❌ Email Send Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// 7. PARSE VENDOR PROPOSAL VIA AI
app.post('/api/proposals/parse', async (req, res) => {
  try {
    const { rfpId, vendorEmail, emailBody } = req.body;
    console.log(`🤖 Asking Gemini to parse email from ${vendorEmail}...`);
    
    const prompt = `
      You are an expert procurement assistant. Extract the proposal details from the following vendor email.
      The user is responding to an RFP. 
      
      Vendor Email:
      "${emailBody}"
      
      Return ONLY a valid JSON object with no markdown formatting or code blocks. Use this exact structure:
      {
        "totalPrice": <Number, the total cost estimated. Strip out $ and commas>,
        "paymentTerms": "<String, the proposed payment terms>",
        "proposedItems": [
          {
            "name": "<String, item name>",
            "quantity": <Number>,
            "unitPrice": <Number>,
            "notes": "<String, any specific specs or caveats mentioned>"
          }
        ]
      }
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(responseText);
    
    const newProposal = new Proposal({
      rfpId,
      vendorEmail,
      totalPrice: parsedData.totalPrice,
      paymentTerms: parsedData.paymentTerms,
      proposedItems: parsedData.proposedItems,
      rawEmailBody: emailBody
    });
    
    await newProposal.save();
    console.log("💾 Saved parsed proposal to database!");
    res.json({ success: true, proposal: newProposal });
  } catch (error) {
    console.error("❌ Parsing Error:", error);
    res.status(500).json({ error: "Failed to parse proposal" });
  }
});

// 8. EVALUATE PROPOSALS VIA AI
app.get('/api/rfps/:id/evaluate', async (req, res) => {
  try {
    const rfpId = req.params.id;
    const rfp = await RFP.findById(rfpId);
    if (!rfp) return res.status(404).json({ error: "RFP not found" });
    
    const proposals = await Proposal.find({ rfpId: rfpId });
    if (proposals.length === 0) {
      return res.status(400).json({ error: "No proposals received yet for this RFP." });
    }
    
    console.log(`⚖️ AI is evaluating ${proposals.length} proposals for RFP: ${rfp.title}`);
    
    const prompt = `
      You are an expert procurement manager. Evaluate these vendor proposals for the following RFP.
      RFP Title: ${rfp.title}
      RFP Budget: ${rfp.budget}
      RFP Items Requested: ${JSON.stringify(rfp.items)}
      Vendor Proposals:
      ${JSON.stringify(proposals.map(p => ({
        vendorEmail: p.vendorEmail,
        totalPrice: p.totalPrice,
        paymentTerms: p.paymentTerms,
        proposedItems: p.proposedItems
      })))}

      Based on pricing, alignment with requested items, and payment terms, provide an evaluation.
      Return ONLY a valid JSON object with no markdown formatting. Use this exact structure:
      {
        "recommendedVendor": "<Vendor Email>",
        "reasoning": "<A 2-3 sentence explanation of why they won>",
        "rankings": [
          {
            "vendorEmail": "<Vendor Email>",
            "score": <Number out of 100>,
            "pros": "<1 short sentence>",
            "cons": "<1 short sentence>"
          }
        ]
      }
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(responseText);
    
    res.json({ success: true, evaluation, proposals });
  } catch (error) {
    console.error("❌ Evaluation Error:", error);
    res.status(500).json({ error: "Failed to evaluate proposals." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
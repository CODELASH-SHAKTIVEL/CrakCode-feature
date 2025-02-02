import express from 'express';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file uploads
const upload = multer({
    dest: './uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function analyzeResume(resumeText, jobDescription) {
    try {
        console.log("Analyzing resume with AI...");

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
        You are an AI Resume Evaluator. Compare the following resume with the given job description. 
        Provide a detailed analysis, including:
        - Skill match percentage
        - Missing skills
        - Strengths
        - Areas for improvement

        Resume Text:
        ${resumeText}

        Job Description:
        ${jobDescription}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log("AI Response:", response);

        return response;
    } catch (error) {
        console.error('Error analyzing resume:', error);
        return 'Error processing resume.';
    }
}

// ✅ **Test Route for Debugging**
app.get('/test', (req, res) => {
    console.log("Test route hit!");
    res.status(200).json({ message: "Test route is working!" });
});

// ✅ **Analytics Route with Debugging Logs**
app.post('/analytics', upload.single('resume'), async (req, res) => {
    console.log("Analytics endpoint hit!");

    try {
        if (!req.file) {
            console.error("Error: Resume file is missing.");
            return res.status(400).json({ error: 'Resume file is required' });
        }

        const { jobdescription } = req.body;
        if (!jobdescription) {
            console.error("Error: Job description is missing.");
            return res.status(400).json({ error: 'Job description is required' });
        }

        console.log("Job Description:", jobdescription);
        console.log("Processing resume file:", req.file.path);

        // Read PDF file
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        const resumeText = pdfData.text;

        console.log("Extracted Resume Text:", resumeText.substring(0, 500)); // Print first 500 characters for debug

        // Analyze the resume using AI
        const aiAnalysis = await analyzeResume(resumeText, jobdescription);

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);
        console.log("File deleted successfully:", req.file.path);

        return res.json({ analysis: aiAnalysis });
    } catch (error) {
        console.error('Error processing resume:', error);
        return res.status(500).json({ error: 'Failed to process resume' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});


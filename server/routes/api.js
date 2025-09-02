const express = require("express");
const router = express.Router();
const axios = require("axios");

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error("Failed to get response from AI");
  }
}

// Resume Helper endpoint
router.post("/resume-feedback", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const prompt = `
Analyze this resume and provide specific feedback in Markdown format:

## Grammar and Spelling
- Identify any errors

## Strengths
- Highlight strong points with bullet points

## Areas for Improvement
- Suggest improvements with bullet points

## Keyword Recommendations
- Suggest relevant keywords for ATS optimization

Resume:
${resumeText}
`;

    const feedback = await callGeminiAPI(prompt);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job Description Analyzer endpoint
router.post("/analyze-job", async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const prompt = `
      Analyze this job description and provide:
      1. Key required skills (list the top 5-7 most important skills)
      2. Recommended keywords to include in a resume/application
      3. A suitability rating (0-100%) based on typical requirements for this role
      
      For the suitability rating, provide a percentage and brief explanation.
      
      Job Description:
      ${jobDescription}
      
      Format your response as JSON with these keys: skills, keywords, suitability, explanation.
    `;

    const analysis = await callGeminiAPI(prompt);

    try {
      // Try to parse the JSON response
      const parsedAnalysis = JSON.parse(analysis);
      res.json(parsedAnalysis);
    } catch (parseError) {
      // If parsing fails, return as text
      res.json({ analysis });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Career Insights endpoint
router.post("/career-insights", async (req, res) => {
  try {
    const { stats, jobTitles } = req.body;

    const prompt = `
Based on these job application statistics, provide a motivational summary and career insights in Markdown format:

**Statistics:**
- Applied: ${stats.applied}
- Interviews: ${stats.interview}
- Rejected: ${stats.rejected}
- Hired: ${stats.hired}
- Common job titles: ${jobTitles.join(", ")}

Provide encouraging feedback, highlight positive trends, and suggest areas for improvement. Use bold text for emphasis and bullet points for lists.
`;

    const insights = await callGeminiAPI(prompt);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Career Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const context = chatHistory
      ? `Previous conversation context: ${JSON.stringify(
          chatHistory.slice(-5)
        )}\n\n`
      : "";

    const prompt = `
${context}
You are a career advisor AI assistant. Provide helpful, professional advice about career topics. Format your response using Markdown with:

- **Bold** for important concepts
- Bullet points for lists
- Clear section headings

User's question: ${message}
`;

    const response = await callGeminiAPI(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

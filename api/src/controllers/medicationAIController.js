const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * Get medication suggestions from Google AI
 */
exports.getMedicationSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ data: [] });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(500).json({ 
        error: 'Google AI API key not configured. Please add GOOGLE_AI_API_KEY to .env file' 
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create prompt for medication suggestions
    const prompt = `You are a medical assistant. Given the medication search query "${query}", provide a list of related medications with their common dosages and uses.

Return ONLY a JSON array (no markdown, no explanation) with this exact format:
[
  {
    "name": "Medication Name",
    "genericName": "Generic name if different",
    "commonDosages": ["500mg", "1000mg"],
    "commonUses": "Brief description of common uses",
    "frequency": "Typical frequency (e.g., Twice daily)"
  }
]

Provide 5-10 most relevant medications. If the query is too vague, provide common medications starting with those letters.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let medications = [];
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      medications = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      // Fallback: return empty array
      medications = [];
    }

    res.json({ 
      data: medications,
      query: query,
      source: 'Google AI (Gemini)'
    });

  } catch (error) {
    console.error('Error getting medication suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get medication suggestions',
      details: error.message 
    });
  }
};

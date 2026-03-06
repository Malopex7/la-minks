import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build the system prompt for the AI
const buildPrompt = (serviceName, userRequest) => `You are La-Minks, a premium South African cleaning and maintenance company's quoting assistant.

CONTEXT:
- The customer has selected the "${serviceName}" service.
- They are now requesting an ADDITIONAL extra service: "${userRequest}"

YOUR TASK:
1. Determine if the requested extra is RELEVANT to the "${serviceName}" service category. Only approve extras that are directly related. For example:
   - "Hedge trimming" IS relevant to "Gardening & Landscaping"
   - "Pool cleaning" is NOT relevant to "Gardening & Landscaping"
   - "Inside fridge cleaning" IS relevant to "Home Cleaning"
   - "Garden work" is NOT relevant to "Home Cleaning"

2. If RELEVANT: Suggest a fair market price in South African Rand (ZAR) for this extra service. Base this on standard South African cleaning/maintenance industry rates. Also estimate the additional hours needed.

3. If NOT RELEVANT: Politely decline and explain which service category would be more appropriate.

RESPOND WITH ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "approved": true/false,
  "message": "A short, friendly message to the customer explaining your decision",
  "extra": {
    "name": "Clean display name for the extra",
    "price": 0,
    "estimatedAdditionalHours": 0
  }
}

If declined, set "extra" to null.`;

// Parse an AI response string to JSON
const parseAiResponse = (text) => {
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
};

// Strategy 1: Google Gemini (using flash-lite for separate quota pool)
const tryGemini = async (serviceName, userRequest) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(buildPrompt(serviceName, userRequest));
    return parseAiResponse(result.response.text().trim());
};

// Strategy 2: GitHub Models (OpenAI-compatible endpoint)
const tryGitHubModels = async (serviceName, userRequest) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not configured');

    const response = await fetch('https://models.github.ai/inference/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful quoting assistant. Always respond with only valid JSON, no markdown.' },
                { role: 'user', content: buildPrompt(serviceName, userRequest) }
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`GitHub Models error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response from GitHub Models');

    return parseAiResponse(text);
};

// @desc    Use AI to suggest an extra service add-on
// @route   POST /api/quote/suggest-extra
// @access  Public
export const suggestExtra = async (req, res) => {
    try {
        const { serviceName, userRequest } = req.body;

        if (!serviceName || !userRequest) {
            return res.status(400).json({ message: 'serviceName and userRequest are required.' });
        }

        let parsed;

        // Try Gemini first, fall back to GitHub Models
        try {
            console.log('🤖 Trying Gemini...');
            parsed = await tryGemini(serviceName, userRequest);
            console.log('✅ Gemini succeeded');
        } catch (geminiError) {
            console.warn('⚠️ Gemini failed:', geminiError.message?.substring(0, 100));
            console.log('🔄 Falling back to GitHub Models...');

            try {
                parsed = await tryGitHubModels(serviceName, userRequest);
                console.log('✅ GitHub Models succeeded');
            } catch (githubError) {
                console.error('❌ GitHub Models also failed:', githubError.message?.substring(0, 100));
                return res.status(503).json({
                    approved: false,
                    message: 'Both AI services are temporarily unavailable. Please try again in a moment.',
                    extra: null
                });
            }
        }

        res.json(parsed);
    } catch (error) {
        console.error('AI Suggest Extra Error:', error.message);
        res.status(500).json({
            approved: false,
            message: 'Sorry, I\'m having trouble right now. Please try again in a moment.',
            extra: null
        });
    }
};

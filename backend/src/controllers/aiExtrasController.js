import { GoogleGenerativeAI } from '@google/generative-ai';

// Build the prompt for AI evaluation
const buildPrompt = (serviceName, userRequest) => `You are La-Minks, a premium South African cleaning and property maintenance company's quoting assistant.

CONTEXT:
- The customer has selected the "${serviceName}" service package.
- They are now requesting an ADDITIONAL custom extra service: "${userRequest}"

YOUR TASK:
1. Determine if the requested extra is RELEVANT or compatible with the "${serviceName}" service category.
   - For example:
     - "Burglar bars wiping" or "Window sill detailing" IS relevant to "Window Cleaning"
     - "Cutlery washing" or "Oven cleaning" is NOT relevant to "Window Cleaning" (suggest Home/Kitchen Cleaning instead)
     - "Hedge trimming" or "Weed removal" IS relevant to "Gardening & Outdoor Care"
     - "Inside fridge cleaning" IS relevant to "Home Cleaning"
     - "Carpet stain treatment" IS relevant to "Carpet Cleaning"

2. If RELEVANT: Suggest a fair market price in South African Rand (ZAR) for this extra service (typical extras range from R120 to R450 depending on complexity). Also estimate the additional hours needed (0.5 to 2.0 hrs). Set approved to true.

3. If NOT RELEVANT: Politely decline and explain why, mentioning which service category would be more appropriate. Set approved to false and extra to null.

RESPOND WITH ONLY valid JSON in this exact structure (no markdown fences, no formatting text):
{
  "approved": true,
  "message": "A helpful, friendly explanation for the South African customer",
  "extra": {
    "name": "Clean display title for the extra",
    "price": 180,
    "estimatedAdditionalHours": 0.5
  }
}`;

// Robust JSON extraction and normalization
const parseAndNormalizeAiResponse = (text) => {
    let clean = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    // Extract first JSON object block if there is surrounding text
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        clean = jsonMatch[0];
    }

    const parsed = JSON.parse(clean);

    // Normalize field variations if model returns slightly different keys
    if (parsed.approved && parsed.extra) {
        const price = parsed.extra.price || parsed.extra.price_zar || parsed.extra.cost || 150;
        const hours = parsed.extra.estimatedAdditionalHours || parsed.extra.additional_hours || parsed.extra.hours || 0.5;

        parsed.extra = {
            name: parsed.extra.name || 'Custom Add-on Service',
            price: Number(price),
            estimatedAdditionalHours: Number(hours),
        };
    } else {
        parsed.extra = null;
        parsed.approved = Boolean(parsed.approved);
    }

    return parsed;
};

// Strategy 1: Google Gemini with multi-model fallback
const tryGemini = async (serviceName, userRequest) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-3.7-flash',
        'gemini-2.5-flash-lite'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(buildPrompt(serviceName, userRequest));
            const rawText = result.response.text();
            return parseAndNormalizeAiResponse(rawText);
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message?.substring(0, 100));
        }
    }

    throw lastError || new Error('All Gemini models failed');
};

// Strategy 2: Smart Rule-Based Fallback if all external AI services are unavailable
const fallbackHeuristic = (serviceName, userRequest) => {
    const sName = (serviceName || '').toLowerCase();
    const req = (userRequest || '').toLowerCase();

    // Cleaning / Home terms
    const isKitchenDish = /cutlery|dish|plate|pot|pan|utensil/i.test(req);
    const isWindowRelated = /window|sill|frame|glass|burglar|blind|curtain/i.test(req);
    const isGardenRelated = /garden|lawn|grass|hedge|weed|tree|leaf|outdoor/i.test(req);
    const isCarpetRelated = /carpet|rug|mat|stain|steam/i.test(req);
    const isFridgeOven = /fridge|oven|stove|microwave|refrigerator|freezer/i.test(req);

    if (sName.includes('window')) {
        if (isKitchenDish) {
            return {
                approved: false,
                message: `Cutlery and dish washing is not part of Window Cleaning. Please add this item under our Home Cleaning or Deep Cleaning service instead!`,
                extra: null
            };
        }
        if (isWindowRelated || /frame|track|lintel|screen/i.test(req)) {
            return {
                approved: true,
                message: `We can certainly include ${userRequest} alongside your Window Cleaning!`,
                extra: { name: userRequest, price: 180, estimatedAdditionalHours: 0.5 }
            };
        }
    }

    if (sName.includes('home') || sName.includes('house') || sName.includes('cleaning')) {
        if (isGardenRelated) {
            return {
                approved: false,
                message: `Outdoor garden work isn't included with Home Cleaning. Please check our Gardening & Grass Cutting services for outdoor care.`,
                extra: null
            };
        }
        return {
            approved: true,
            message: `We'd be glad to handle ${userRequest} during your cleaning session!`,
            extra: {
                name: userRequest.charAt(0).toUpperCase() + userRequest.slice(1),
                price: isFridgeOven ? 250 : isKitchenDish ? 150 : 200,
                estimatedAdditionalHours: 0.75
            }
        };
    }

    return {
        approved: false,
        message: `We've noted your request for "${userRequest}". Please check with our team or select one of our tailored service categories.`,
        extra: null
    };
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

        try {
            console.log(`🤖 Evaluating extra "${userRequest}" for "${serviceName}" with Gemini...`);
            parsed = await tryGemini(serviceName, userRequest);
            console.log('✅ Gemini evaluation succeeded');
        } catch (geminiError) {
            console.warn('⚠️ Gemini error:', geminiError.message?.substring(0, 120));
            console.log('🔄 Engaging smart assistant fallback...');
            parsed = fallbackHeuristic(serviceName, userRequest);
        }

        res.json(parsed);
    } catch (error) {
        console.error('AI Suggest Extra Error:', error.message);
        const fallback = fallbackHeuristic(req.body.serviceName, req.body.userRequest);
        res.json(fallback);
    }
};

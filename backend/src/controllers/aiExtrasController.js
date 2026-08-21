import { GoogleGenerativeAI } from '@google/generative-ai';

// Build the prompt for AI evaluation with gracious cross-service bundling
const buildPrompt = (serviceName, userRequest) => `You are La-Minks, an intelligent quoting assistant for a premier South African cleaning and property care company.

CONTEXT:
- The customer is currently configuring a quote for: "${serviceName}".
- They are asking for a custom add-on or task: "${userRequest}".

OUR COMPREHENSIVE SERVICE CATALOG:
1. Home Cleaning (Kitchen, cutlery/dishes, fridge, oven, ironing, laundry, bedrooms, dusting, mopping)
2. Office Cleaning (Desks, common areas, boardrooms, trash disposal)
3. Window Cleaning (Glass, frames, sills, burglar bars, tracks)
4. Carpet Cleaning (Steam extraction, rug washing, stain treatment)
5. Move Out Cleaning (Deep property sanitization, deposit guarantee clean)
6. Upholstery Cleaning (Couches, armchairs, mattresses, fabric sanitization)
7. Afterparty Cleaning (Post-event cleanup, venue trash removal, sanitizing)
8. New House Cleaning (Post-construction, paint residue, deep scrubbing)
9. Bedroom Cleaning (Linen changes, mattress vacuuming, wardrobes)
10. Painting (Interior/exterior touch-ups, wall repainting)
11. Gardening & Grass Cutting (Lawn mowing, edging, weeding, hedge trimming, garden maintenance)

YOUR TASK:
1. Determine if "${userRequest}" is related to ANY cleaning, home care, maintenance, outdoor, or property service:
   - CASE A: It directly fits "${serviceName}" (e.g. burglar bars or window frames for Window Cleaning).
     -> "approved": true, "isCrossService": false, "category": "${serviceName}"
     -> Suggest a fair South African Rand (ZAR) price (e.g. R80 - R300) and hours (0.5 - 1.5h).
     -> Write a welcoming confirmation message.

   - CASE B: It fits a DIFFERENT La-Minks service department (e.g. cutlery shining or oven cleaning when they selected Window Cleaning; or lawn mowing when they selected Home Cleaning).
     -> GRACIOUS UPSELL: Enable the customer to seamlessly bundle it into THIS SAME QUOTE without needing a separate request!
     -> "approved": true, "isCrossService": true, "category": "Relevant Service (e.g. Home Cleaning Add-on, Garden Care Add-on)"
     -> Suggest a fair South African Rand (ZAR) price (e.g. R120 - R350) and hours (0.5 - 2.0h).
     -> Write a gracious, encouraging message: explain that while this is normally part of our other service department, La-Minks can gladly bundle it right here into this quote so they get everything taken care of together!

   - CASE C: Completely unrelated to home/property/cleaning care (e.g. car mechanics, pet surgery, legal advice).
     -> "approved": false, "isCrossService": false, "extra": null.
     -> Politely decline and explain that La-Minks specializes in residential, commercial, and property care services.

RESPOND WITH ONLY valid JSON in this exact structure (no markdown code fences):
{
  "approved": true,
  "isCrossService": true,
  "message": "Friendly, welcoming explanation for the customer",
  "extra": {
    "name": "Clean display title (e.g. Cutlery & Dish Detailing Add-on)",
    "category": "Home Cleaning",
    "price": 140,
    "estimatedAdditionalHours": 0.5
  }
}`;

// Robust JSON extraction and normalization
const parseAndNormalizeAiResponse = (text, userRequest, serviceName) => {
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
        const category = parsed.extra.category || parsed.suggestedCategory || (parsed.isCrossService ? 'Cross-Service Add-on' : serviceName);

        parsed.extra = {
            name: parsed.extra.name || (userRequest.charAt(0).toUpperCase() + userRequest.slice(1)),
            category: String(category),
            price: Number(price),
            estimatedAdditionalHours: Number(hours),
            isCrossService: Boolean(parsed.isCrossService),
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
            return parseAndNormalizeAiResponse(rawText, userRequest, serviceName);
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message?.substring(0, 100));
        }
    }

    throw lastError || new Error('All Gemini models failed');
};

// Strategy 2: Smart Rule-Based Fallback with cross-service bundling
const fallbackHeuristic = (serviceName, userRequest) => {
    const sName = (serviceName || '').toLowerCase();
    const req = (userRequest || '').toLowerCase();

    // Match service types
    const isKitchenDish = /cutlery|dish|plate|pot|pan|utensil|silverware/i.test(req);
    const isFridgeOven = /fridge|oven|stove|microwave|refrigerator|freezer/i.test(req);
    const isLaundryIron = /laundry|iron|ironing|wash clothes|folding/i.test(req);
    const isWindowRelated = /window|sill|frame|glass|burglar|blind|curtain/i.test(req);
    const isGardenRelated = /garden|lawn|grass|hedge|weed|tree|leaf|mowing|outdoor/i.test(req);
    const isCarpetRelated = /carpet|rug|mat|stain|steam|deep extraction/i.test(req);
    const isPaintRelated = /paint|wall|touch up|repaint/i.test(req);

    // Cross-service upsell for Window Cleaning
    if (sName.includes('window')) {
        if (isKitchenDish) {
            return {
                approved: true,
                isCrossService: true,
                message: `While cutlery and dish washing is typically part of our Home Cleaning department, we can gladly bundle this into your Window Cleaning quote today!`,
                extra: {
                    name: 'Cutlery & Dish Detailing Add-on',
                    category: 'Home Cleaning',
                    price: 140,
                    estimatedAdditionalHours: 0.5,
                    isCrossService: true
                }
            };
        }
        if (isFridgeOven) {
            return {
                approved: true,
                isCrossService: true,
                message: `Oven and fridge detailing is part of our Home Deep Cleaning catalog, but we can easily add it right to your Window Cleaning appointment!`,
                extra: {
                    name: 'Inside Appliance Deep Clean Add-on',
                    category: 'Home Cleaning',
                    price: 220,
                    estimatedAdditionalHours: 1.0,
                    isCrossService: true
                }
            };
        }
        if (isGardenRelated) {
            return {
                approved: true,
                isCrossService: true,
                message: `Lawn and garden care is managed by our Outdoor Maintenance team. We can bundle this task into this same quote so our teams coordinate seamlessly!`,
                extra: {
                    name: `${userRequest.charAt(0).toUpperCase() + userRequest.slice(1)} (Outdoor Care)`,
                    category: 'Gardening & Outdoor Care',
                    price: 250,
                    estimatedAdditionalHours: 1.0,
                    isCrossService: true
                }
            };
        }
        if (isWindowRelated || /frame|track|lintel|screen/i.test(req)) {
            return {
                approved: true,
                isCrossService: false,
                message: `We can certainly include ${userRequest} alongside your Window Cleaning!`,
                extra: {
                    name: userRequest.charAt(0).toUpperCase() + userRequest.slice(1),
                    category: 'Window Cleaning',
                    price: 180,
                    estimatedAdditionalHours: 0.5,
                    isCrossService: false
                }
            };
        }
    }

    // Cross-service upsell for Home Cleaning
    if (sName.includes('home') || sName.includes('house') || sName.includes('cleaning')) {
        if (isGardenRelated) {
            return {
                approved: true,
                isCrossService: true,
                message: `Garden care is normally managed by our outdoor team, but we can happily bundle this into your home cleaning quote!`,
                extra: {
                    name: `${userRequest.charAt(0).toUpperCase() + userRequest.slice(1)} (Garden Add-on)`,
                    category: 'Gardening',
                    price: 250,
                    estimatedAdditionalHours: 1.0,
                    isCrossService: true
                }
            };
        }
        if (isWindowRelated) {
            return {
                approved: true,
                isCrossService: true,
                message: `Exterior window detailing can be bundled directly into your home cleaning quote!`,
                extra: {
                    name: `${userRequest.charAt(0).toUpperCase() + userRequest.slice(1)} (Window Care)`,
                    category: 'Window Cleaning',
                    price: 200,
                    estimatedAdditionalHours: 0.75,
                    isCrossService: true
                }
            };
        }
        return {
            approved: true,
            isCrossService: false,
            message: `We'd be glad to handle ${userRequest} during your cleaning session!`,
            extra: {
                name: userRequest.charAt(0).toUpperCase() + userRequest.slice(1),
                category: 'Home Cleaning',
                price: isFridgeOven ? 250 : isKitchenDish ? 140 : isLaundryIron ? 120 : 180,
                estimatedAdditionalHours: 0.75,
                isCrossService: false
            }
        };
    }

    // General fallback for any other service
    if (isKitchenDish || isFridgeOven || isLaundryIron || isWindowRelated || isGardenRelated || isCarpetRelated || isPaintRelated) {
        return {
            approved: true,
            isCrossService: true,
            message: `We can bundle ${userRequest} into your current ${serviceName} booking as a custom add-on!`,
            extra: {
                name: `${userRequest.charAt(0).toUpperCase() + userRequest.slice(1)} Add-on`,
                category: 'Custom Property Care',
                price: 200,
                estimatedAdditionalHours: 0.75,
                isCrossService: true
            }
        };
    }

    return {
        approved: false,
        isCrossService: false,
        message: `We've noted your request for "${userRequest}". Please check with our team or select one of our standard property service packages.`,
        extra: null
    };
};

// @desc    Use AI to suggest an extra service add-on with cross-service upsell support
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
            console.log('✅ Gemini evaluation succeeded:', parsed.extra?.name || 'Declined');
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

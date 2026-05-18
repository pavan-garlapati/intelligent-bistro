import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

let groqClient = null;
function getClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const FALLBACK_RESPONSE = {
  reply: "Sorry, I didn't catch that. Could you try again?",
  actions: [],
  suggestions: [],
};

export function buildSystemPrompt(menuData, currentCart) {
  const menuJson = JSON.stringify(menuData, null, 2);
  const cartJson = JSON.stringify(currentCart || [], null, 2);

  return `You are Bistro AI, a warm and helpful ordering assistant for The Intelligent Bistro, an upscale-casual restaurant. You guide guests through the menu, recommend dishes, and update their cart for them.

MENU (the complete list of items you can order — every itemId you use MUST come from here):
${menuJson}

CURRENT CART:
${cartJson}

RESPONSE FORMAT — you MUST respond with ONLY valid JSON in this exact schema, no prose outside the JSON:
{
  "reply": "friendly conversational message to the user",
  "actions": [
    {
      "type": "add_item" | "remove_item" | "update_qty" | "clear_cart" | "no_action",
      "itemId": "menu-item-id",
      "quantity": 1,
      "reason": "brief reason"
    }
  ],
  "suggestions": ["short follow-up suggestion 1", "short follow-up suggestion 2"]
}

RULES:
- The "actions" array can be empty for purely conversational responses (e.g., menu questions, recommendations the user hasn't accepted yet).
- For "add_item", "remove_item", or "update_qty", the "itemId" MUST exactly match an "id" from the MENU above. Never invent ids.
- For "clear_cart" and "no_action", "itemId" and "quantity" may be omitted or set to null.
- Be warm, concise, and genuinely helpful. The "reply" field is hard-capped at 2 sentences.
- If the user asks what's popular or what you recommend, prioritize items whose tags include "Popular".
- Respect dietary tags ("Vegan", "Gluten-free", "Spicy") when the user mentions preferences or restrictions.
- ALWAYS confirm in the "reply" what you added, removed, or updated — e.g., "Added the Truffle Arancini to your cart."
- Provide 2 short, contextual "suggestions" the user might tap next (e.g., "Add a drink?", "See desserts").
- Never quote prices the user can't verify — if you mention a price, take it from the MENU.
- If the user's request is ambiguous, ask a brief clarifying question in "reply" and leave "actions" empty.`;
}

export async function processMessage(userMessage, conversationHistory, menuData, currentCart) {
  try {
    const client = getClient();
    const systemPrompt = buildSystemPrompt(menuData, currentCart);

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) return { ...FALLBACK_RESPONSE };

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ...FALLBACK_RESPONSE };
    }

    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : FALLBACK_RESPONSE.reply,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (err) {
    console.error('aiService.processMessage error:', err.message);
    return { ...FALLBACK_RESPONSE };
  }
}

export function validateAndEnrichActions(actions, menuData) {
  if (!Array.isArray(actions)) return [];
  const menuById = new Map(menuData.map((item) => [item.id, item]));
  const validTypes = new Set(['add_item', 'remove_item', 'update_qty', 'clear_cart', 'no_action']);

  const cleaned = [];
  for (const action of actions) {
    if (!action || !validTypes.has(action.type)) continue;

    if (action.type === 'clear_cart' || action.type === 'no_action') {
      cleaned.push({
        type: action.type,
        reason: typeof action.reason === 'string' ? action.reason : '',
      });
      continue;
    }

    const item = menuById.get(action.itemId);
    if (!item) continue;

    const qty = Number.isFinite(action.quantity) ? Math.max(0, Math.floor(action.quantity)) : 1;

    cleaned.push({
      type: action.type,
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      reason: typeof action.reason === 'string' ? action.reason : '',
    });
  }
  return cleaned;
}

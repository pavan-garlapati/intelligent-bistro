import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';
const RETRY_DELAY_MS = 500;

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

function formatMenuList(menu) {
  return menu
    .map((item) => {
      const tags = item.tags && item.tags.length > 0 ? item.tags.join(', ') : 'none';
      return `ID: ${item.id} | Name: ${item.name} | Price: $${item.price.toFixed(2)} | Tags: ${tags}`;
    })
    .join('\n');
}

function formatCartList(cart) {
  if (!cart || cart.length === 0) return '(empty)';
  return cart
    .map(
      (line) =>
        `- ${line.quantity}x ${line.name} ($${Number(line.price).toFixed(2)} each)`,
    )
    .join('\n');
}

export function buildSystemPrompt(menuData, currentCart) {
  const menuList = formatMenuList(menuData);
  const cartList = formatCartList(currentCart);

  return `You are Bistro AI, a warm and helpful ordering assistant for The Intelligent Bistro, an upscale-casual restaurant. You guide guests through the menu, recommend dishes, and update their cart for them.

MENU (every itemId you use MUST come from this list):
${menuList}

CURRENT CART:
${cartList}

RESPONSE FORMAT — respond with ONLY valid JSON in this exact schema, no prose outside the JSON:
{
  "reply": "friendly conversational message to the user",
  "actions": [
    {
      "type": "add_item" | "remove_item" | "update_qty" | "clear_cart" | "place_order" | "no_action",
      "itemId": "menu-item-id",
      "quantity": 1,
      "reason": "brief reason"
    }
  ],
  "suggestions": ["short follow-up suggestion 1", "short follow-up suggestion 2"]
}

RULES:
- The "actions" array can be empty for purely conversational responses.
- For "add_item", "remove_item", or "update_qty", the "itemId" MUST exactly match an ID from the MENU above. Never invent IDs.
- For "clear_cart", "place_order", and "no_action", "itemId" and "quantity" may be omitted or null.
- When the user wants to place/submit/finalize/confirm their order ("place my order", "order it", "I'm done", "submit"), return a "place_order" action AND a confirming reply (e.g. "Your order has been placed!"). Do NOT also include add_item/remove_item actions in the same turn — confirm any pending changes first.
- If the user asks to place an order but the CURRENT CART is empty, do NOT return a place_order action. Reply asking them to add something first.
- Keep your "reply" field under 40 words. Be warm but efficient.
- When the user says "make that two" or any similar follow-up, use the conversation history to determine which item they mean.
- When asked "what's in my cart" (or similar), list the current cart items from the CURRENT CART state above.
- When asked for recommendations, pick 2-3 items from the MENU and explain briefly why you like them.
- Never invent items not in the menu. If asked for something unavailable, suggest the closest alternative from the menu.
- If the user asks what's popular, prioritize items tagged "Popular".
- Respect dietary tags ("Vegan", "Gluten-free", "Spicy") when the user mentions preferences or restrictions.
- ALWAYS confirm in the "reply" what you added, removed, or updated (e.g., "Added the Truffle Arancini to your cart.").
- Provide 2 short, contextual "suggestions" the user might tap next.
- Never quote prices the user can't verify; take any price from the MENU.
- If the user's request is ambiguous, ask a brief clarifying question in "reply" and leave "actions" empty.`;
}

async function createCompletion(client, messages) {
  return client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });
}

async function callGroqWithRetry(client, messages) {
  try {
    const completion = await createCompletion(client, messages);
    return completion.choices?.[0]?.message?.content ?? '';
  } catch (err) {
    console.warn(
      `[aiService] Groq call failed (${err.message}). Retrying in ${RETRY_DELAY_MS}ms...`,
    );
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    const completion = await createCompletion(client, messages);
    return completion.choices?.[0]?.message?.content ?? '';
  }
}

export async function processMessage(
  userMessage,
  conversationHistory,
  menuData,
  currentCart,
) {
  try {
    const client = getClient();
    const systemPrompt = buildSystemPrompt(menuData, currentCart);

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    let raw = await callGroqWithRetry(client, messages);
    if (!raw) return { ...FALLBACK_RESPONSE };

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn(
        '[aiService] JSON parse failed. Retrying with explicit instruction...',
      );
      const retryMessages = [
        ...messages,
        { role: 'assistant', content: raw },
        {
          role: 'user',
          content:
            'Your previous response was not valid JSON. Respond with only JSON, no other text.',
        },
      ];
      try {
        raw = await callGroqWithRetry(client, retryMessages);
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error('[aiService] JSON retry also failed:', err.message);
        return { ...FALLBACK_RESPONSE };
      }
    }

    return {
      reply:
        typeof parsed.reply === 'string' ? parsed.reply : FALLBACK_RESPONSE.reply,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (err) {
    console.error('[aiService] processMessage error:', err.message);
    return { ...FALLBACK_RESPONSE };
  }
}

export function validateAndEnrichActions(actions, menuData) {
  if (!Array.isArray(actions)) return [];
  const menuById = new Map(menuData.map((item) => [item.id, item]));
  const validTypes = new Set([
    'add_item',
    'remove_item',
    'update_qty',
    'clear_cart',
    'place_order',
    'no_action',
  ]);

  const cleaned = [];
  for (const action of actions) {
    if (!action || !validTypes.has(action.type)) continue;

    if (
      action.type === 'clear_cart' ||
      action.type === 'place_order' ||
      action.type === 'no_action'
    ) {
      cleaned.push({
        type: action.type,
        reason: typeof action.reason === 'string' ? action.reason : '',
      });
      continue;
    }

    const item = menuById.get(action.itemId);
    if (!item) continue;

    const qty = Number.isFinite(action.quantity)
      ? Math.max(0, Math.floor(action.quantity))
      : 1;

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

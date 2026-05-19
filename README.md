# The Intelligent Bistro

A premium restaurant ordering app with an AI server that takes orders by voice or text.

The repo contains two workspaces:

- `bistro-backend` — Node.js + Express API, Groq-backed AI agent, in-memory session/cart store.
- `bistro-app` — Expo SDK 54 (React Native 0.81) client with expo-router, NativeWind, Reanimated, and voice input via `expo-speech-recognition`.

## Screens

_Screenshots placeholder — drop images into `/docs/screenshots` and link them here:_

- `Menu` — searchable, category-filtered, with detail bottom sheet
- `Cart` — swipe-to-delete, order summary, place-order flow
- `AI Chat` — conversational ordering with voice input and live action confirmations

## Tech stack

| Layer | Tooling |
| --- | --- |
| Mobile runtime | Expo SDK 54, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| Styling | NativeWind v4 (Tailwind utility classes) |
| Animations | react-native-reanimated 4 |
| Gestures | react-native-gesture-handler 2 |
| Bottom sheets | @gorhom/bottom-sheet 5 |
| State | Zustand 5 (cart, menu, chat stores) |
| Voice | expo-speech-recognition |
| Haptics | expo-haptics |
| Backend | Node 20, Express 4, express-rate-limit |
| AI | Groq SDK (`llama-3.3-70b-versatile`) with JSON-mode responses |

## Features

### AI ordering
The chat tab is a full conversational interface backed by Groq. The model is given the live menu and current cart as context, and replies in a strict JSON schema: `{ reply, actions, suggestions }`. Actions like `add_item` / `remove_item` are validated against the menu (the AI can't invent items or prices) and applied to the cart immediately. Suggestions become tappable chips above the input bar.

### Voice input
Tap the mic in the chat input to open a full-screen voice overlay with a pulsing ring, animated waveform, and a live transcript that updates as you speak. The transcript is sent to the same chat endpoint and flagged so the message bubble shows a "Voice" badge.

### Cart UX
Swipe a cart row left to delete it (with a red reveal). Items collapse smoothly via `LinearTransition`. Quantity changes are local-first and fire-and-forget to the backend. The "Place order" button shows a spinner during processing and a success modal that animates in with a spring.

### Polished details
- Skeleton shimmer while menu loads
- Cart badge with color flash on increment
- Toast notifications slide down from the top
- Error boundary catches render errors with a friendly retry screen
- Network failures surface as a toast and a "Retry" suggestion chip

## Setup

### Prerequisites
- Node.js 20+
- A [Groq API key](https://console.groq.com/keys)
- Expo CLI (`npx expo` works, no global install needed)
- iOS Simulator or Android emulator (or a physical device with Expo Go)

### Backend

```bash
cd bistro-backend
npm install
cp .env.example .env
# edit .env and paste your GROQ_API_KEY
npm run dev
```

The API starts on `http://localhost:3001`. Health check: `GET /health`.

### Mobile app

```bash
cd bistro-app
npm install
npx expo start
```

If you're running on a physical device or Android emulator, `localhost` won't resolve to your laptop. Create `bistro-app/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3001/api
```

Then restart `npx expo start`.

## Project structure

```
intelligent-bistro/
├── bistro-backend/
│   ├── index.js              # Express server, routes, rate limits
│   └── src/
│       ├── data/menu.json    # The 21-item menu
│       ├── routes/           # /menu, /chat, /cart
│       ├── services/         # aiService (Groq), sessionService
│       └── middleware/       # cors, error handler
└── bistro-app/
    ├── app/
    │   ├── _layout.tsx       # Providers (gesture, safe-area, error boundary, toast, bottom sheet)
    │   └── (tabs)/           # menu, cart, chat
    ├── components/
    │   ├── ui/               # Themed primitives, Tag, Stepper, Toast, Cart badge, …
    │   ├── menu/             # MenuItemCard, CategoryHeader, ItemDetailSheet
    │   └── chat/             # MessageBubble, VoiceOverlay
    ├── hooks/                # useVoiceInput
    ├── services/api.ts       # Typed fetch client
    ├── store/                # cartStore, menuStore, chatStore (Zustand)
    └── types/                # Shared TS types
```

## Environment variables

### `bistro-backend/.env`
| Var | Purpose |
| --- | --- |
| `PORT` | Backend port (default 3001) |
| `GROQ_API_KEY` | Required for the chat endpoint |
| `NODE_ENV` | `development` enables permissive CORS |

### `bistro-app/.env` (optional)
| Var | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Override the default `http://localhost:3001/api` |

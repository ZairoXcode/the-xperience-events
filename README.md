# The Xperience — Event Operations Assistant

An event management assistant that turns natural-language conversations into structured event data — tasks, requirements, vendors, deadlines, and risk alerts — and keeps a dashboard up to date as those conversations happen.

---

## What I Built

Event managers spend a lot of time tracking things that are described in conversation but never make it into a proper system. Someone says "the photographer is unavailable for the Reception" and that ends up in a WhatsApp thread instead of a risk log. This project is an attempt to fix that specific problem.

The way it works: an event manager opens an event dashboard, describes what's happening through a chat panel, and the system extracts structured information from that description. Vendor statuses, task lists, requirements, deadlines, and risks are all updated directly from the conversation. There's no separate form-filling step — the chat is the input.

The LLM handles the understanding part. The backend handles what actually gets stored.

---

## Core Flow

```
Event Manager types a message
        ↓
  LLM reads the message + current event context
        ↓
  LLM returns structured JSON (entities to create/update, risks detected)
        ↓
  Backend validates the JSON (Zod)
        ↓
  Domain services apply changes to MongoDB
        ↓
  Dashboard refreshes with the updated state
        ↓
  Activity timeline records what changed
```

The LLM does not have write access to the database. It produces structured intent — the backend decides what gets persisted, validates the data, and runs any business logic that should not be delegated to a language model (date arithmetic, capacity gaps, deduplication).

---

## What It Handles

- Creating and managing events (name, type, dates, location, guest count, sub-events/activities)
- Natural-language event updates via chat
- Requirements tracking (venue, catering, décor, photography, accommodation, transportation, etc.)
- Task creation and status management (TODO / IN_PROGRESS / COMPLETED / BLOCKED)
- Vendor tracking with status (PENDING / CONTACTED / CONFIRMED / UNAVAILABLE / CANCELLED)
- Relative deadline calculation ("one week before the event" → actual date from event start)
- Risk detection based on evidence in the conversation — not based on requirements being pending
- Transportation capacity gap detection (needed vs. available → gap → risk)
- Guest count updates with deduplication (updating 400 → 450 modifies the event, not creates a second one)
- Activity timeline — every state change is logged
- AI clarification for vague messages instead of guessing and creating junk data
- JWT authentication with per-event ownership — users can only access their own events

---

## Examples

**Vendor status update:**

> "Sangeet venue has been finalised, but the décor vendor is still pending."

Result:
- Venue vendor → `CONFIRMED`, linked to Sangeet
- Decoration vendor → `PENDING`
- No duplicate vendors created

---

**Photographer unavailable:**

> "The photographer is unavailable for the Reception."

Result:
- Photography vendor → `UNAVAILABLE`
- Risk created: `Photographer unavailable for Reception` (severity: HIGH)
- Affected area: Photography / Reception
- Suggested action: find replacement photographer

---

**Transportation capacity gap:**

> "The transport vendor can provide vehicles for only 150 employees, but we have 200."

Result:
- Required: 200 | Available: 150 | Gap: 50
- Risk created: `Transportation capacity shortage` (severity: HIGH)
- Task created: arrange supplemental transport for 50 attendees

---

**Ambiguous message:**

> "We may need some additional arrangements later."

Result:
- No entities created
- Assistant asks for clarification

---

## AI Approach

The LLM receives the current event context alongside the user's message — existing tasks, vendors, open risks, deadlines, requirements, and the last few chat messages. It returns a JSON object describing what should be created or updated.

That JSON goes through Zod validation before anything touches the database. If the schema is wrong, the change is rejected.

For things that require reliable arithmetic or deduplication logic, the backend handles it directly:
- Relative date calculation (`"one week before"` → `event.startDate - 7 days`)
- Capacity gap math (required guests vs. vendor capacity)
- Duplicate detection for tasks, vendors, requirements, and risks

The model also runs with temperature set to `0.1` to reduce hallucinations. The prompt explicitly tells it not to create risks, vendors, quantities, or dates that the user has not mentioned.

If no API key is configured, a deterministic fallback engine handles the common scenarios (guest count changes, accommodation requirements, catering deadlines, photographer risks, transport capacity). The app works without an LLM key for most standard event operations.

---

## Risk Detection

This was one of the more important design decisions.

A requirement being `PENDING` does not mean there is a risk. Pending means it has not been arranged yet — that is normal for an event in planning. Treating every pending item as a risk would flood the dashboard with noise on day one.

A risk is created when the conversation contains evidence of an actual problem:

| User says | Result |
|---|---|
| "We need accommodation for guests." | Accommodation requirement → PENDING. No risk. |
| "150 guests need accommodation and airport transfers." | Requirement created with quantity 150. No risk. |
| "We haven't arranged accommodation and the event is in two weeks." | Accommodation risk created. |
| "The photographer is unavailable for the Reception." | Photography risk — vendor unavailable for a specific activity. |
| "Transport can only cover 150 of our 200 employees." | Transportation capacity risk — deterministic gap calculation. |

The distinction is: a requirement captures what is needed. A risk captures that something is wrong or blocked.

---

## Architecture

**Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
**Backend:** Node.js + Express + TypeScript
**Database:** MongoDB + Mongoose
**Auth:** JWT (bcrypt password hashing, token verified on every protected request)
**AI:** OpenAI-compatible API (configurable endpoint — works with OpenAI, Groq, Ollama, OpenRouter)
**Validation:** Zod (API inputs + AI structured output)

### Backend structure

```
Controller → Service → Model
```

Controllers handle HTTP. Services contain the business logic. Models define the schema. Controllers do not touch the database directly.

### AI flow

```
POST /api/events/:id/chat
  → ChatController
  → AIService.processMessage
    → buildEventContext (loads current event state)
    → LLM call (or deterministic fallback)
    → Zod validation
    → processUpdates (domain services: Task, Vendor, Deadline, etc.)
    → RiskService (deduplication, capacity checks)
    → ActivityService.log
    → getDashboardSummary
  → Response includes updated summary + applied changes list
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| AI | OpenAI SDK (OpenAI-compatible endpoint) |
| Validation | Zod |
| Dev tooling | ts-node-dev, ESLint |

---

## Project Structure

```
/
├── backend/
│   └── src/
│       ├── config/         # Environment config
│       ├── controllers/    # HTTP layer (auth, events, chat, tasks, vendors, deadlines, requirements, risks, activity)
│       ├── middleware/      # authenticate, requireEventAccess, validate, errorHandler
│       ├── models/         # Mongoose schemas (9 collections)
│       ├── routes/         # Express routers
│       ├── services/       # Business logic (AI, event, task, vendor, deadline, requirement, risk, activity)
│       ├── types/          # Shared TypeScript types
│       ├── utils/          # Enum normalizers, param helpers
│       ├── validators/     # Zod schemas for API inputs and AI output
│       └── scripts/        # testAI.ts — AI connection diagnostic
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages (/, /login, /register, /events, /events/new, /events/[id])
        ├── components/
        │   ├── chat/       # ChatPanel
        │   ├── common/     # Header, Badge
        │   └── dashboard/  # TasksPanel, VendorsPanel, DeadlinesPanel, RequirementsPanel, RisksPanel, ActivityFeed, SummaryMetrics, EventHeader
        ├── context/        # AuthContext
        ├── lib/            # API client
        └── types/          # Frontend type definitions
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)

### Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/xperience_events

# Required — use a real random string, not the placeholder
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d

# Optional — leave blank to run the deterministic fallback engine instead
AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1

# Works with any OpenAI-compatible provider: Groq, OpenRouter, Ollama
# AI_BASE_URL=https://api.groq.com/openai/v1
# AI_MODEL=llama3-8b-8192

FRONTEND_URL=http://localhost:3000
```

`AI_API_KEY` is optional. Without it, the built-in fallback handles guest count updates, accommodation requirements, catering deadlines, photographer risks, and transport capacity gaps.

### Run

```bash
# Backend (http://localhost:5000)
cd backend && npm run dev

# Frontend (http://localhost:3000)
cd frontend && npm run dev
```

### Typecheck

```bash
cd backend && npx tsc --noEmit
```

### AI connection check

```bash
cd backend && npm run test:ai
```

Confirms whether the configured API key and model endpoint are reachable. If no key is set, it tells you the fallback engine is active.

### Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

---

## Testing

No automated test suite. These scenarios were manually tested against a running stack:

- **Wedding scenario** — 400 guests, 4 activities, 8 requirements extracted as PENDING with no unsupported risks created
- **Accommodation requirement** — "150 guests need accommodation" → requirement with quantity 150, zero risks
- **Sangeet venue confirmed** — vendor set to CONFIRMED, décor to PENDING, no duplicate vendors
- **Catering deadline** — relative phrase resolved to a concrete date using backend date arithmetic, not LLM arithmetic
- **Photographer unavailable** — HIGH risk created with correct affected area and suggested action
- **Guest count update** — 400 → 450 updates the event, activity log records the change, no duplicate event created
- **Transport capacity gap** — deterministic calculation (200 needed, 150 available, gap 50) → HIGH risk
- **Duplicate risk** — sending the same risk-triggering message twice deduplicates at the service layer
- **Ambiguous message** — no entities or risks created, assistant asks for clarification
- **Auth isolation** — user A cannot access user B's events, chat history, or activity feed
- **Unauthorized request** — 401 returned before any data is touched
- **TypeScript typecheck** — `tsc --noEmit` passes with zero errors

---

## Assumptions

- Calendar dates are handled deterministically by the backend. The LLM identifies date-related requirements, while the backend performs relative date calculations and persists the resulting calendar date consistently.
- The backend owns all state decisions. The LLM communicates what the user intends; the backend validates, deduplicates, and persists.
- Ambiguous input should trigger clarification, not guessing. Creating a risk or vendor that the user never mentioned is worse than asking a follow-up question.
- Each user's events and chat history are isolated. Cross-user access is blocked at the middleware level and enforced again inside each service.

---

## Known Limitations

- **LLM consistency** — extraction quality depends on the model. Models served via OpenAI-compatible endpoints (such as Groq or OpenAI) handle the tested scenarios well. Smaller or less capable models may return incomplete structured output.
- **No automated tests** — scenarios were verified manually. There are no integration or unit tests beyond the AI connection diagnostic.
- **Scope** — this covers event planning state management. Calendar integrations, email notifications, file uploads, and multi-user event collaboration are outside the intended scope.

---

## Demo

No live deployment. Run locally following the instructions above.

# AgroGuardian AI — Complete Setup Guide

## 🐛 Bugs Fixed in This Version

### 1. Auth Loop (Dashboard ↔ Login Bouncing) ✅
**Root Cause**: Zustand `persist` rehydrates from localStorage asynchronously. On the very first React render `isAuthenticated = false` (store not yet loaded), so `PrivateRoute` redirected to `/login`. Then hydration completed, `isAuthenticated = true`, and the app bounced back — causing an infinite loop.

**Fix**: Added `_hasHydrated` flag + `onRehydrateStorage` callback to the Zustand store. A `<HydrationGate>` component in `App.jsx` shows a spinner until hydration completes, so **no routing decisions are made before the store is ready**.

### 2. Language Translation — All 3 Languages Complete ✅
- All keys for all pages (Dashboard, Disease, Pest, Yield, Weather, Risk, Schemes, History, Profile, Chatbot, Help, Nav, Auth) are present in **English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)**.
- Hindi was previously ~20% complete with `[HI]` placeholders — now fully translated.
- Switching language changes **every text element** across all tabs/pages instantly.

### 3. Help Icon + Farmer Guide ✅ (NEW)
- Floating "Help & Guide" button appears above the chatbot FAB (bottom-right).
- Opens a side panel with:
  - **6-step Getting Started guide** (translated in all 3 languages)
  - **FAQ accordion** (3 questions, collapsible)
  - **"Ask Assistant"** button that directly opens the AI chatbot
- All guide text is fully translated in EN/KN/HI.

### 4. Weather Page — Real Backend API ✅
- Now fetches from `/weather?days=7&city=Mysore,IN` (was previously all hardcoded dummy data).
- City selector dropdown with 12 Indian cities.
- Refresh button.
- Demo-data badge shown when backend ARIMA model isn't trained yet.
- Farming advisory cards dynamically generated from actual forecast data.

- Composite AI risk score: Weather (30%) + Pest (40%) + Disease (30%).
- Gauge meter, animated breakdown bars, AI recommendations.
- City + crop selectors.
- Calls `/risk/analyse` backend endpoint (falls back to client-side calculation if backend unavailable).
- Added to Sidebar navigation with `ShieldAlert` icon.

### 6. Chatbot ✅
- Fixed `openRef` prop — HelpWidget's "Ask Assistant" now directly opens the chatbot.
- Welcome message updates when language is changed.
- Voice input/output works with correct language (`kn-IN`, `hi-IN`, `en-IN`).
- Clear chat button added.

### 7. Backend Risk Routes ✅
- `routes/risk_routes.py` — new file
- `controllers/risk_controller.py` — new file
- `app.py` — `risk_bp` now registered (was commented out before)

---

## 🚀 Running the Project

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Make sure MongoDB is running:
# macOS:  brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod

python app.py
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment Variables

Copy `backend/.env` — it already has all keys filled in.
For the frontend, create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

---

## 🏗 Architecture

```
AgroAI/
├── frontend/                    # React + Vite + Tailwind
│   └── src/
│       ├── App.jsx              # ← FIXED: HydrationGate stops auth loop
│       ├── store/
│       │   └── useAppStore.js   # ← FIXED: _hasHydrated flag added
│       ├── utils/
│       │   └── translations.js  # ← FIXED: all 3 languages complete
│       ├── pages/
│       │   ├── WeatherPage.jsx  # ← FIXED: wired to real API
│       │   └── RiskPage.jsx     # ← NEW: risk management dashboard
│       └── components/
│           ├── layout/
│           │   ├── AppShell.jsx # ← FIXED: HelpWidget + openRef
│           │   ├── Sidebar.jsx  # ← FIXED: Risk nav item added
│           │   └── Navbar.jsx   # ← FIXED: correct translation keys
│           ├── chatbot/
│           │   └── ChatbotWidget.jsx  # ← FIXED: openRef prop
│           └── ui/
│               ├── HelpWidget.jsx     # ← NEW: help icon + guide
│               └── LanguageSwitcher.jsx  # ← FIXED: 3-lang dropdown
└── backend/                     # Flask REST API
    ├── app.py                   # ← FIXED: risk_bp now registered
    ├── routes/
    │   └── risk_routes.py       # ← NEW
    └── controllers/
        └── risk_controller.py   # ← NEW
```

---

## 🌐 Language Support

| Feature | English | Kannada (ಕನ್ನಡ) | Hindi (हिन्दी) |
|---------|---------|-----------------|----------------|
| Landing page | ✅ | ✅ | ✅ |
| Auth pages | ✅ | ✅ | ✅ |
| All dashboard tabs | ✅ | ✅ | ✅ |
| Help guide | ✅ | ✅ | ✅ |
| Chatbot welcome | ✅ | ✅ | ✅ |

Switch language using the 🌐 button in the top navigation bar. Every text element updates instantly across all tabs.

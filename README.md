# iPark Internal Chatbot

An AI-powered internal assistant for the iPark team at the Talal and Madiha Zein AUB Innovation Park.  
Built with OpenAI GPT-4o, deployed on Vercel, and fed by documents stored in this repository.

---

## How It Works

1. Documents are stored in the `/docs` folder of this repo
2. On every chat request, the bot fetches all listed documents in parallel from GitHub raw URLs
3. Each document is trimmed to its individual character limit to stay within GPT-4o's context window
4. The documents are injected into the GPT-4o system prompt
5. The bot answers strictly based on those documents

---

## Folder Structure

```
iPark_Chatbot/
├── api/
│   └── chat.js                                        # Backend serverless function (Vercel)
├── docs/                                              # All knowledge base documents
│   ├── 260404 BCP1
│   ├── 260404 BCP2
│   ├── 260404 BCP3
│   ├── 260404 Risk Assessment Matrix -1.csv
│   ├── 260404 Risk Assessment Matrix -2.csv
│   ├── Business Service Providers -1.csv
│   ├── Investors Outreach, Onboarding and Matching.csv
│   ├── Mentors Onboarding and Due Diligence.csv
│   ├── Partners.csv
│   ├── Roar_car_deck
│   ├── Roar_presentation
│   ├── Zoho Workflows - B&A Workflow.csv
│   ├── Zoho Workflows - GTM Workflow.csv
│   ├── Zoho Workflows - Growth Program.csv
│   ├── Zoho Workflows - IVP Workflow.csv
│   ├── Zoho Workflows - Onboarding flows.csv
│   ├── Zoho Workflows - PIC Workflow.csv
│   ├── iPark Operational Roadmap rev1 .csv
│   └── 251120 iPark Operational Roadmap Rev 4.csv
├── index.html                                         # Frontend chat interface
├── package.json                                       # Must include "type":"module"
├── vercel.json                                        # Vercel routing + headers config
└── README.md                                          # This file
```

---

## Current Knowledge Base (19 Documents)

| Document | Type | Char Limit | Description |
|----------|------|------------|-------------|
| 260404 BCP1 | Text | 3000 | Business Continuity Plan 1 |
| 260404 BCP2 | Text | 3000 | Business Continuity Plan 2 |
| 260404 BCP3 | Text | 3000 | Business Continuity Plan 3 |
| 260404 Risk Assessment Matrix -1.csv | CSV | 3000 | Risk Assessment Matrix Part 1 |
| 260404 Risk Assessment Matrix -2.csv | CSV | 3000 | Risk Assessment Matrix Part 2 |
| Business Service Providers -1.csv | CSV | 3000 | Business Service Providers list |
| Investors Outreach, Onboarding and Matching.csv | CSV | 3000 | Investor workflows |
| Mentors Onboarding and Due Diligence.csv | CSV | 3000 | Mentor onboarding process |
| Partners.csv | CSV | 3000 | Partners directory |
| Roar_car_deck | Text | 4000 | ROAR card deck (12 behavioral cards) |
| Roar_presentation | Text | 4000 | ROAR full presentation (Feb 2026) |
| Zoho Workflows - B&A Workflow.csv | CSV | 3000 | B&A Zoho workflow |
| Zoho Workflows - GTM Workflow.csv | CSV | 3000 | Go-to-Market Zoho workflow |
| Zoho Workflows - Growth Program.csv | CSV | 3000 | Growth Program Zoho workflow |
| Zoho Workflows - IVP Workflow.csv | CSV | 3000 | IVP Zoho workflow |
| Zoho Workflows - Onboarding flows.csv | CSV | 3000 | Onboarding Zoho workflow |
| Zoho Workflows - PIC Workflow.csv | CSV | 3000 | PIC Zoho workflow |
| iPark Operational Roadmap rev1 .csv | CSV | 6000 | iPark Operational Roadmap Version 1 |
| 251120 iPark Operational Roadmap Rev 4.csv | CSV | 6000 | iPark Operational Roadmap Version 4 |

**Total prompt cap: 100,000 characters** — safe ceiling for GPT-4o without crashing.

---

## How to Add a New Document

### Step 1 — Prepare the file
| File Type | What to Do |
|-----------|------------|
| `.txt` / `.csv` | Upload directly — no changes needed |
| `.pdf` | Convert to `.txt` first (ask Claude to extract content) |
| `.pptx` | Convert to `.txt` first (ask Claude to extract slide text) |
| `.docx` | Convert to `.txt` first (copy-paste content) |
| `.xlsx` | Save As CSV first, then upload |

> ⚠️ Binary files (PDF, PPT, DOCX, XLSX) cannot be read directly by the bot. Always convert to `.txt` or `.csv` before uploading.

### Step 2 — Upload to GitHub
1. Go to the `/docs` folder in this repo
2. Click **Add file → Upload files**
3. Upload your `.txt` or `.csv` file
4. Click **Commit changes**

### Step 3 — Register the file in `chat.js`
1. Go to `api/chat.js`
2. Click the pencil icon to edit
3. Find the `docFiles` array at the top
4. Add a new entry with the exact filename and an appropriate character limit:

```javascript
const docFiles = [
  // ... existing files ...
  { name: 'Your New File.csv', limit: 3000 },  // use 6000 for large files
];
```

5. Click **Commit changes** → Vercel auto-redeploys in ~30 seconds

### Character Limit Guidelines
| File Size | Recommended Limit |
|-----------|-------------------|
| Small (< 50 rows) | 3000 |
| Medium (50–200 rows) | 4000 |
| Large (200+ rows) | 6000 |

---

## Environment Variables (Vercel — Project Level)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key — must be set at **project level** in Vercel settings |

> ⚠️ Must be added under the specific project settings, not team settings. After adding or changing, always redeploy.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (`index.html`)
- **Backend:** Vercel Serverless Function (`api/chat.js`)
- **AI Model:** OpenAI GPT-4o
- **Document Storage:** GitHub raw URLs (`/docs` folder)
- **Hosting:** Vercel
- **Module System:** ES Modules (`"type": "module"` in `package.json`)

---

## Bot Behavior Rules

The bot is configured to:
- Answer **only** based on uploaded documents
- Say *"This information is not available in the current knowledge base"* if the answer isn't in the docs
- Reference the document/section the answer came from
- Never fabricate information
- Maintain internal confidentiality

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Bot says "Sorry, something went wrong" | API key missing or context too large | Check project-level env var + character limits |
| Bot says "No documents loaded" | File not in `docFiles` array | Add `{ name, limit }` entry to `chat.js` |
| Bot can't find info you uploaded | Wrong filename or limit too small | Check exact name + increase limit |
| Bot not responding at all | Missing API key at project level | Add `OPENAI_API_KEY` in Vercel project settings |
| Deployment not updating | Commit not pushed to `main` | Make sure you committed to `main` branch |
| PDF/PPT/XLSX content not loading | Binary file uploaded directly | Convert to `.txt` or `.csv` first |
| 500 error in console | Function crash — context overflow | Reduce character limits or total doc count |

---

## Important Configuration Notes

- `package.json` must have `"type": "module"` — without it, `export default` fails
- `vercel.json` must have `maxDuration: 30` — default 10s timeout is too short for 19 files
- All docs are fetched in **parallel** using `Promise.all` for speed
- The API key must be set at **project level**, not team level in Vercel

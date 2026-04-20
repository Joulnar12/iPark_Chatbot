# iPark Internal Chatbot

An AI-powered internal assistant for the iPark team at the Talal and Madiha Zein AUB Innovation Park.  
Built with OpenAI GPT-4o, deployed on Vercel, and fed by documents stored in this repository.

---

## How It Works

1. Documents are stored in the `/docs` folder of this repo
2. On every chat request, the bot fetches all listed documents from GitHub raw URLs
3. The documents are injected into the GPT-4o system prompt
4. The bot answers strictly based on those documents

## How to Add a New Document

### Step 1 — Prepare the file
| File Type | What to Do |
|-----------|------------|
| `.txt` / `.csv` | Upload directly — no changes needed |
| `.pdf` | Convert to `.txt` first (copy-paste content or ask Claude to convert) |
| `.pptx` | Convert to `.txt` first (ask Claude to extract slide text) |
| `.docx` | Convert to `.txt` first (copy-paste content) |

> Binary files (PDF, PPT, DOCX) cannot be read directly by the bot. Always convert to `.txt` or `.csv` before uploading.

### Step 2 — Upload to GitHub
1. Go to the `/docs` folder in this repo
2. Click **Add file → Upload files**
3. Upload your `.txt` or `.csv` file
4. Click **Commit changes**

### Step 3 — Register the file in `chat.js`
1. Go to `api/chat.js`
2. Click the pencil icon to edit
3. Find the `docFiles` array at the top of the file
4. Add the **exact filename** as it appears in GitHub (including extension if it has one):

```javascript
const docFiles = [
  // ... existing files ...
  'Your New File.txt'   // ← add here
];
```
5. Click **Commit changes** → Vercel auto-redeploys in ~30 seconds

---

## Current Knowledge Base (17 documents)

| Document | Type | Description |
|----------|------|-------------|
| 260404 BCP1 | Text | Business Continuity Plan 1 |
| 260404 BCP2 | Text | Business Continuity Plan 2 |
| 260404 BCP3 | Text | Business Continuity Plan 3 |
| 260404 Risk Assessment Matrix -1.csv | CSV | Risk Assessment Matrix Part 1 |
| 260404 Risk Assessment Matrix -2.csv | CSV | Risk Assessment Matrix Part 2 |
| Business Service Providers -1.csv | CSV | Business Service Providers list |
| Investors Outreach, Onboarding and Matching.csv | CSV | Investor workflows |
| Mentors Onboarding and Due Diligence.csv | CSV | Mentor onboarding process |
| Partners.csv | CSV | Partners directory |
| Roar_car_deck | Text | ROAR card deck (12 behavioral cards) |
| Roar_presentation | Text | ROAR full presentation (Feb 2026) |
| Zoho Workflows - B&A Workflow.csv | CSV | B&A Zoho workflow |
| Zoho Workflows - GTM Workflow.csv | CSV | Go-to-Market Zoho workflow |
| Zoho Workflows - Growth Program.csv | CSV | Growth Program Zoho workflow |
| Zoho Workflows - IVP Workflow.csv | CSV | IVP Zoho workflow |
| Zoho Workflows - Onboarding flows.csv | CSV | Onboarding Zoho workflow |
| Zoho Workflows - PIC Workflow.csv | CSV | PIC Zoho workflow |

---

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key — set in Vercel project settings |

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (`index.html`)
- **Backend:** Vercel Serverless Function (`api/chat.js`)
- **AI Model:** OpenAI GPT-4o
- **Document Storage:** GitHub raw URLs (`/docs` folder)
- **Hosting:** Vercel

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
| Bot says "No documents loaded" | File not in `docFiles` array | Add filename to `chat.js` |
| Bot can't find info you uploaded | Wrong filename in `docFiles` | Check exact name matches GitHub |
| Bot not responding | Missing API key | Check `OPENAI_API_KEY` in Vercel |
| Deployment not updating | Commit not pushed to `main` | Make sure you committed to `main` branch |
| PDF/PPT content not loading | Binary file uploaded directly | Convert to `.txt` first |


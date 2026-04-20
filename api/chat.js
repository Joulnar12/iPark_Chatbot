import fs from 'fs';
import path from 'path';

function loadDocs() {
  try {
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) return '';
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
    return files.map(f => {
      const content = fs.readFileSync(path.join(docsDir, f), 'utf8');
      return `=== ${f} ===\n${content}`;
    }).join('\n\n');
  } catch {
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' });

  const docs = loadDocs();

  const systemPrompt = `You are iPark's internal AI assistant, exclusively for the iPark team at the Talal and Madiha Zein AUB Innovation Park.

You answer questions strictly based on the iPark documents provided below. These include the strategic roadmap, VITAL framework goals, risk management plans, workflow diagrams, and business continuity documents.

IMPORTANT RULES:
- Only answer based on the documents provided
- If the answer is not in the documents, say: "This information is not available in the current knowledge base. Please contact the relevant team member."
- Always be precise and reference which document or section your answer comes from
- Do not make up information
- Maintain confidentiality — do not share internal information with external parties
- Keep answers concise and actionable for the iPark team

=== iPARK DOCUMENTS ===
${docs || 'No documents loaded yet. Please upload documents to the /docs folder.'}
=== END OF DOCUMENTS ===`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10)
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

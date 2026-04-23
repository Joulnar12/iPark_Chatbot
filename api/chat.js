async function loadDocs() {
  const docFiles = [
    { name: '260404 BCP1', limit: 3000 },
    { name: '260404 BCP2', limit: 3000 },
    { name: '260404 BCP3', limit: 3000 },
    { name: '260404 Risk Assessment Matrix -1.csv', limit: 3000 },
    { name: '260404 Risk Assessment Matrix -2.csv', limit: 3000 },
    { name: 'Business Service Providers -1.csv', limit: 3000 },
    { name: 'Investors Outreach, Onboarding and Matching.csv', limit: 3000 },
    { name: 'Mentors Onboarding and Due Diligence.csv', limit: 3000 },
    { name: 'Partners.csv', limit: 3000 },
    { name: 'Roar_car_deck', limit: 4000 },
    { name: 'Roar_presentation', limit: 4000 },
    { name: 'Zoho Workflows - B&A Workflow.csv', limit: 3000 },
    { name: 'Zoho Workflows - GTM Workflow.csv', limit: 3000 },
    { name: 'Zoho Workflows - Growth Program.csv', limit: 3000 },
    { name: 'Zoho Workflows - IVP Workflow.csv', limit: 3000 },
    { name: 'Zoho Workflows - Onboarding flows.csv', limit: 3000 },
    { name: 'Zoho Workflows - PIC Workflow.csv', limit: 3000 },
    { name: 'iPark Operational Roadmap rev1 .csv', limit: 6000 },
    { name: '251120 iPark Operational Roadmap Rev 4.csv', limit: 6000 }
  ];

  const repoOwner = 'Joulnar12';
  const repoName = 'iPark_Chatbot';

  const results = await Promise.all(
    docFiles.map(async ({ name, limit }) => {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/docs/${encodeURIComponent(name)}`
        );
        if (res.ok) {
          const text = await res.text();
          return `\n\n=== ${name} ===\n${text.slice(0, limit)}`;
        }
        return '';
      } catch (e) {
        return '';
      }
    })
  );

  // Total cap at 100000 characters — safe for gpt-4o without crashing
  const combined = results.join('');
  return combined.slice(0, 100000);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const docs = await loadDocs();

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
${docs || 'No documents loaded yet.'}
=== END OF DOCUMENTS ===`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

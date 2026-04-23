async function loadDocs() {
  const docFiles = [
    '260404 BCP1',
    '260404 BCP2',
    '260404 BCP3',
    '260404 Risk Assessment Matrix -1.csv',
    '260404 Risk Assessment Matrix -2.csv',
    'Business Service Providers -1.csv',
    'Investors Outreach, Onboarding and Matching.csv',
    'Mentors Onboarding and Due Diligence.csv',
    'Partners.csv',
    'Roar_car_deck',
    'Roar_presentation',
    'Zoho Workflows - B&A Workflow.csv',
    'Zoho Workflows - GTM Workflow.csv',
    'Zoho Workflows - Growth Program.csv',
    'Zoho Workflows - IVP Workflow.csv',
    'Zoho Workflows - Onboarding flows.csv',
    'Zoho Workflows - PIC Workflow.csv'
  ];

  const repoOwner = 'Joulnar12';
  const repoName = 'iPark_Chatbot';

  const results = await Promise.all(
    docFiles.map(async (file) => {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/docs/${encodeURIComponent(file)}`
        );
        if (res.ok) {
          const text = await res.text();
          // Limit each file to 2000 characters to avoid context overflow
          return `\n\n=== ${file} ===\n${text.slice(0, 2000)}`;
        }
        return '';
      } catch (e) {
        return '';
      }
    })
  );

  // Limit total docs to 60000 characters
  const combined = results.join('');
  return combined.slice(0, 60000);
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

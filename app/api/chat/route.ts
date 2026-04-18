import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = "https://api.x.ai/v1/responses";

if (!XAI_API_KEY) {
  console.error('XAI_API_KEY environment variable is not set');
}

// Official DIM Guide Book Context for MIT/IT programs
const GUIDE_BOOK_CONTEXT = `
Department of Industrial Management (DIM), Faculty of Science.
Programs: B.Sc. Honours in MIT and B.Sc. Honours in IT (SLQF Level 6, 4-year).

Academic Structure:
- Level 1 (L1): Common modules. Transition to MIT or IT pathway for L2.
- MIT Pathway (L2-L4): Specialization tracks in BSE (Business Systems Engineering), OSCM (Operations & Supply Chain Management), IS (Information Systems).
- IT Pathway (L2-L4): Structured technical curriculum, no separate specializations.

Graduation Requirements:
- Total Credits: 132 (aggregating at least 30 from each year L3 and L4).
- Minimum GPA: 2.00 (Pass), 3.00 (Lower Second), 3.30 (Upper Second), 3.70 (First Class).
- Grade Distribution: At least 105 credits must be C or better. All compulsory modules must be D or better.

Core Level-specific Modules:
- Software Development Project (INTE 31356) - 6 Credits
- Internship (GNCT 32216) - 6 Credits
- Research Project (INTE 43216/MGTE 43216) - 6 Credits
- L1 Core: Fundamentals of Computing (INTE 11213), Programming Concepts (INTE 11223), Business Statistics (MGTE 11233), Principles of Management (MGTE 11243).
`;

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHAT API DEBUG START (GROK) ===');

    if (!XAI_API_KEY) {
      console.error('XAI_API_KEY is not configured');
      return NextResponse.json({
        error: 'AI service is not configured. Please contact administrator.'
      }, { status: 500 });
    }

    const { message, userContext } = await request.json();
    console.log('Request body:', { message, userContext });

    if (!message || typeof message !== 'string') {
      console.log('ERROR: Invalid message format');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prompt = `You are the SEES Official Academic Virtual Assistant for the Department of Industrial Management (DIM). Answer within 180 words. 
    Use plain text formatting - NO markdown syntax like **bold**, *italic*, or ### headers. Use simple bullet points with • or - instead. 
    
    Academic Guidance Guidelines:
    1. Pathway Selection: Map interests to MIT (Management centric) or IT (Technical centric). Direct students based on L1 module performance (INTE vs MGTE).
    2. Specialization (MIT): Suggest BSE (Business Systems), OSCM (Operations/Supply), or IS (Data/Strategy). Cite specific modules from the guide book.
    3. Graduation: Always mention the 132 credit / 105-C-grade rule if asked about eligibility.
    4. Persona: Helpful, authoritative, and professional. Use "Department of Industrial Management" context.
    
    If demand thresholds for pathways/specializations are reached, mention GPA-based allocation importance.`;

    const fullInput = `${GUIDE_BOOK_CONTEXT}\n\n${prompt}\n\nUser: ${userContext?.user ? `${userContext.user.name} (${userContext.user.role})` : 'Anonymous'}\n\nQuestion: ${message}`;

    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-beta",
        input: fullInput
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API error response:', errorData);
      return NextResponse.json({
        error: 'Failed to get AI response',
        details: errorData,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data?.output?.[0]?.content?.[0]?.text || '';

    if (!aiResponse) {
      console.warn('Empty Grok response');
    }

    // Clean up any remaining markdown syntax
    const cleanedResponse = aiResponse
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/### (.*)/g, '$1') // Remove header
      .replace(/## (.*)/g, '$1')
      .replace(/# (.*)/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    const finalText = cleanedResponse || "I'm sorry, I couldn't generate a response at this time.";
    console.log('=== CHAT API DEBUG END (SUCCESS) ===');

    return NextResponse.json({
      response: finalText,
      debug: {
          model: data.model,
          status: data.status
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 });
  }
}

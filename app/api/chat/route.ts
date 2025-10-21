import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
}

// Guide book context for MIT/IT programs - REDUCED
const GUIDE_BOOK_CONTEXT = `
MIT/IT Programs:
- 4-year Honours Degree
- L1: Choose MIT or IT pathway
- MIT L2: Specialize in BSE/OSCM/IS
- IT: No specialization

Key Modules:
L1: DELT 11232, INTE 11213, INTE 11223, MGTE 11233, MGTE 11243, PMAT 11212, MGTE 12253, INTE 12243, INTE 12213, INTE 12223, MGTE 12263, MGTE 12273, PMAT 12212
L2: INTE 21213, INTE 21313, INTE 21323, INTE 21333, MGTE 21243, MGTE 21233, INTE 21343, MGTE 22273, INTE 22343, INTE 22303, MGTE 22263, INTE 22283, GNCT 24212a
L3 MIT: INTE 31356, MGTE 31393, MGTE 31293, MGTE 31403, MGTE 31373, MGTE 31423, MGTE 31413, MGTE 31303, INTE 31423, INTE 31413, INTE 31393

Credits: 132 total (24-30 per year)
GPA: First Class ≥3.70, Upper ≥3.30, Lower ≥3.00, Pass ≥2.00
`;

export async function POST(request: NextRequest) {
  try {
    console.log('=== CHAT API DEBUG START ===');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
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

    const prompt = `You are SEES academic assistant for MIT/IT. Answer within 180 words. Use plain text formatting - NO markdown syntax like **bold**, *italic*, or ### headers. Use simple bullet points with • or - instead. If pathway/specialization is asked, map interests to MIT/IT and BSE/OSCM/IS (MIT only). Avoid generic advice; cite relevant module codes/titles if applicable. If demand thresholds are reached, mention GPA-based allocation.`;

    console.log('Prompt length:', prompt.length);
    console.log('API URL:', GEMINI_API_URL);
    console.log('API Key configured:', !!GEMINI_API_KEY);

    const requestBody = {
      contents: [{
        parts: [{
          text: `${GUIDE_BOOK_CONTEXT}\n\n${prompt}\n\nStudent: ${userContext?.student ? `${userContext.student.academicYear} ${userContext.student.degreeProgram || ''} ${userContext.student.specialization || ''}` : 'none'}\n\nQuestion: ${message}`
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 512,
      }
    };

    console.log('Request body size:', JSON.stringify(requestBody).length);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      console.log('=== CHAT API DEBUG END (ERROR) ===');
      return NextResponse.json({ 
        error: 'Failed to get AI response', 
        details: errorData,
        status: response.status 
      }, { status: 500 });
    }

    const data = await response.json();
    const first = data?.candidates?.[0];
    const parts = first?.content?.parts;
    const joinedFromParts = Array.isArray(parts)
      ? parts
          .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
          .filter(Boolean)
          .join('\n\n')
          .trim()
      : '';
    const fallbackField = (first?.content?.text || first?.text || '').trim();
    const aiResponse = (joinedFromParts || fallbackField || '').trim();

    console.log('Gemini API response structure:', {
      hasCandidates: !!data?.candidates,
      candidatesLength: data?.candidates?.length,
      finishReason: first?.finishReason,
      safetyRatings: first?.safetyRatings,
      promptFeedback: data?.promptFeedback,
      partsArray: Array.isArray(parts),
      partsCount: Array.isArray(parts) ? parts.length : 0,
      usedJoinedFromParts: Boolean(joinedFromParts),
      hasFallbackField: Boolean(fallbackField),
    });

    if (!aiResponse) {
      console.warn('Empty AI response. Debug fields:', {
        finishReason: first?.finishReason,
        safetyRatings: first?.safetyRatings,
        promptFeedback: data?.promptFeedback,
      });
    }

    // Clean up any remaining markdown syntax
    const cleanedResponse = aiResponse
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/### (.*)/g, '$1') // Remove header markdown
      .replace(/## (.*)/g, '$1') // Remove header markdown
      .replace(/# (.*)/g, '$1') // Remove header markdown
      .replace(/`(.*?)`/g, '$1') // Remove code markdown
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markdown, keep text
      .trim();

    const finalText = cleanedResponse || (`No text returned (finishReason=${first?.finishReason ?? 'unknown'}). Please try rephrasing or shortening your question.`);
    console.log('Final AI response length:', finalText.length);
    console.log('Final AI response preview:', finalText.substring(0, 100) + '...');
    console.log('=== CHAT API DEBUG END (SUCCESS) ===');

    return NextResponse.json({ 
      response: finalText,
      debug: {
        finishReason: first?.finishReason,
        promptFeedback: data?.promptFeedback,
        safetyRatings: first?.safetyRatings,
        rawPreview: (() => { try { const s = JSON.stringify(data); return s.length > 1000 ? s.slice(0, 1000) + '…' : s; } catch { return 'unserializable'; } })()
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    console.log('Error stack:', (error as Error).stack);
    console.log('=== CHAT API DEBUG END (EXCEPTION) ===');
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as Error).message,
      stack: (error as Error).stack 
    }, { status: 500 });
  }
}

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  try {
    const body = await request.json()
    const { subject } = body

    // Input guardrail
    if (!subject || subject.trim().length === 0) {
      return Response.json({ error: 'Subject is required' }, { status: 400 })
    }

    const safeSubject = subject.trim().slice(0, 500)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a helpful student assistant. When given a subject or topic, suggest exactly 3 specific study tasks.
Reply ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Format: [{"title":"task description","priority":"high|medium|low"}]`,
      messages: [
        {
          role: 'user',
          content: `Subject: ${safeSubject}\nSuggest 3 specific study tasks for this subject.`,
        },
      ],
    })

    const raw = message.content[0].text.trim()

    // Parse and validate
    let suggestions
    try {
      suggestions = JSON.parse(raw)
      if (!Array.isArray(suggestions)) throw new Error('Not an array')
    } catch {
      // Fallback: extract JSON array from response
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        suggestions = JSON.parse(match[0])
      } else {
        return Response.json({ error: 'Could not parse AI response' }, { status: 500 })
      }
    }

    return Response.json({ suggestions })
  } catch (err) {
    console.error('AI route error:', err)
    return Response.json({ error: 'AI service unavailable. Try again.' }, { status: 500 })
  }
}

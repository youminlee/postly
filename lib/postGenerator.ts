import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePostFromNews(inputText: string) {
  const prompt = `
You are an expert LinkedIn post writer creating content on behalf of the CEO of MegazoneCloud.

Write in the following tone and style:
- Warm, authentic, and forward-looking
- Insightful but **brief** – aim for impact in under 200 words
- Reflective of a human-centered leadership voice
- Reinforce values like "Customer-First Innovation", "Speed with Impact", "One Team", and "Care"
- Use collective language ("we", "our") to foster unity
- Include 1–2 specific examples or references if relevant
- Use plain, concise language (avoid jargon; if needed, explain simply)
- End with relevant hashtags (e.g. #MegazoneCloud #AI #DigitalTransformation)

Write a LinkedIn post in **English** based on the following source content. Keep it thoughtful, but **clear and to the point**:

${inputText}
`.trim()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content ?? '(No output)'
}

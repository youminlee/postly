// lib/postGenerator.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePostFromNews(inputText: string) {
  const prompt = `
당신은 MegazoneCloud의 CEO를 대신하여 LinkedIn 포스팅을 작성하는 전문가입니다.

다음과 같은 스타일로 작성해주세요:
- 따뜻하고 비전적인 톤
- 디지털 전환과 혁신에 대한 통찰
- 파트너나 팀에 대한 감사 표현
- 전문적이면서도 인간적인 접근
- 해시태그 포함 (예: #DigitalTransformation #Innovation #MegazoneCloud)
- 링크는 포함하지 않음

다음 내용을 바탕으로 LinkedIn 포스팅을 작성해주세요:

${inputText}

포스팅은 한국어로 작성하고, CEO의 관점에서 작성해주세요.
`.trim()

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content ?? '(No output)'
}

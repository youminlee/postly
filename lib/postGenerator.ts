// lib/postGenerator.ts
import OpenAI from "openai";

let openai: OpenAI | null = null;

function getClient(): OpenAI {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.");
	}
	if (!openai) {
		openai = new OpenAI({ apiKey });
	}
	return openai;
}

// 반환 타입
export type DualPost = {
	ko: string;
	en: string;
};

/**
 * 입력 텍스트(뉴스/요약/아이디어 등)를 기반으로
 * 국문/영문 LinkedIn용 게시글을 동시에 생성합니다.
 */
export async function generatePostsFromNews(inputText: string): Promise<DualPost> {
	const model = process.env.OPENAI_MODEL || "gpt-4o";

	const system = `
You are an expert B2B executive copywriter.
Return ONLY valid JSON with keys "ko" and "en". Do not include code fences or any extra text.
  `.trim();

	const user = `
Write TWO LinkedIn-ready posts from the same source:
- One in Korean ("ko"), one in English ("en").
- Tone: warm, authentic, forward-looking leadership voice.
- Be concise and insight-first (80–180 words each; Korean 5–8 short sentences).
- Use collective language ("we", "our") when natural.
- Reflect these values naturally: "Customer-First Innovation", "Speed with Impact", "One Team", "Care".
- Offer one concrete takeaway or POV (no hype, no sales pitch).
- Use plain, concise language (avoid jargon; if needed, explain simply)
- Keep it thoughtful, but clear and to the point.
- End with 3–5 relevant hashtags (e.g., #MegazoneCloud #AI #DigitalTransformation).

Source:
${inputText}

Return STRICT JSON ONLY:
{"ko":"...","en":"..."}
  `.trim();

	const client = getClient();
	const completion = await client.chat.completions.create({
		model,
		temperature: 0.7,
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: user },
		],
	});

	const raw = completion.choices[0]?.message?.content?.trim() || "{}";

	let parsed: any = {};
	try {
		parsed = JSON.parse(raw);
	} catch {
		try {
			const fixed = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
			parsed = JSON.parse(fixed);
		} catch {
			parsed = { ko: "", en: "" };
		}
	}

	return {
		ko: (parsed.ko || "").trim(),
		en: (parsed.en || "").trim(),
	};
}

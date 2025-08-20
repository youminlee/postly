// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generatePostsFromNews } from "@/lib/postGenerator";

export async function POST(req: Request) {
	try {
		const { articles } = await req.json();
		const result = await generatePostsFromNews(articles || "");

		// 국문/영문 둘 다 반환
		return NextResponse.json(result);
	} catch (error: any) {
		const message = typeof error?.message === "string" ? error.message : "콘텐츠 생성 실패";
		const isMissingKey = message.includes("OPENAI_API_KEY");
		console.error("[API] 콘텐츠 생성 실패:", error);
		return NextResponse.json(
			{ error: isMissingKey ? "서버 설정 누락: OPENAI_API_KEY가 설정되어 있지 않습니다." : "콘텐츠 생성 실패" },
			{ status: 500 }
		);
	}
}

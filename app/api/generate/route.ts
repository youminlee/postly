// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generatePostsFromNews } from "@/lib/postGenerator";

export async function POST(req: Request) {
  try {
    const { articles } = await req.json();
    const result = await generatePostsFromNews(articles || "");

    // 국문/영문 둘 다 반환
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] 콘텐츠 생성 실패:", error);
    return NextResponse.json({ error: "콘텐츠 생성 실패" }, { status: 500 });
  }
}

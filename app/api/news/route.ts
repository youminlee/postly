// app/api/news/route.ts
import { NextResponse } from 'next/server';
import { fetchNewsArticles } from '@/lib/rssFetcher';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keywords: string[] = body.keywords;

    const results = await Promise.all(
      keywords.map((kw) => fetchNewsArticles(kw))
    );

    const articles = results.flat().map((article) => ({
      title: article.title,
      url: article.url,
      summary: article.description, // 요약은 이미 처리됨
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('[API] 뉴스 fetch 오류:', error);
    return NextResponse.json(
      { error: '뉴스를 가져오는 중 오류 발생' },
      { status: 500 }
    );
  }
}

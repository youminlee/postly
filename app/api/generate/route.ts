// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { generatePostFromNews } from '@/lib/postGenerator';

export async function POST(req: Request) {
  try {
    const { articles } = await req.json();
    const post = await generatePostFromNews(articles);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('[API] 콘텐츠 생성 실패:', error);
    return NextResponse.json({ error: '콘텐츠 생성 실패' }, { status: 500 });
  }
} 
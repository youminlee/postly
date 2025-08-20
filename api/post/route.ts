// api/post/route.ts
import { NextResponse } from 'next/server';
import { generatePostsFromNews } from '@/lib/postGenerator';

export async function POST(req: Request) {
  try {
    const { articles } = await req.json();
    const result = await generatePostsFromNews(articles || '');
    return NextResponse.json(result); // { ko, en }
  } catch (error) {
    console.error('[API] /api/post 생성 실패:', error);
    return NextResponse.json({ error: '콘텐츠 생성 실패' }, { status: 500 });
  }
}

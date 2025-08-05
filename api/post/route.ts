import { NextResponse } from 'next/server';
import { generatePostFromNews } from '@/lib/postGenerator';

export async function POST(req: Request) {
  try {
    const { summaries } = await req.json(); // ['title: description', '...']
    const post = await generatePostFromNews(summaries);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('❌ 포스트 생성 오류:', error);
    return NextResponse.json({ error: '포스트 생성 실패' }, { status: 500 });
  }
}

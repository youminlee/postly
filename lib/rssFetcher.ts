// lib/rssFetcher.ts
import Parser from 'rss-parser';

export interface NewsArticle {
  title: string;
  url: string;
  description: string;
}

const parser = new Parser();

export async function fetchNewsArticles(keyword: string): Promise<NewsArticle[]> {
  try {
    const googleFeed = await parser.parseURL(
      `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`
    );

    const articles = googleFeed.items
      .slice(0, 5)
      .map((item) => {
        const title = item.title?.trim() || '';
        const rawContent = (item.contentSnippet || item.content || '').trim();
        const content = rawContent.replace(/\s+/g, ' '); // 공백 정리

        // 유효하지 않은 기사 제거 조건
        if (
          !content ||
          content.length < 30 ||
          content === title ||
          content.replace(/\s+/g, '') === title.replace(/\s+/g, '')
        ) {
          return null;
        }

        // 첫 3문장 추출
        const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const description = sentences.slice(0, 3).join('. ') + '.';

        return {
          title,
          url: item.link || '',
          description
        };
      })
      .filter((article): article is NewsArticle => article !== null);

    return articles;
  } catch (error) {
    console.error('RSS 피드 가져오기 실패:', error);
    return [];
  }
}

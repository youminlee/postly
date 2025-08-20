'use client';

import { useState, useMemo } from 'react';

type GenerateResp = { ko?: string; en?: string; post?: string };

export default function Page() {
  const [keywords, setKeywords] = useState('');
  const [inputContent, setInputContent] = useState('');

  // 출력 분리: 국문/영문
  const [koContent, setKoContent] = useState('생성된 국문 게시글이 없습니다.');
  const [enContent, setEnContent] = useState('No English post yet.');

  const [isLoading, setIsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<{ title: string; url: string; summary: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [koCopied, setKoCopied] = useState(false);
  const [enCopied, setEnCopied] = useState(false);

  const canGenerate = useMemo(() => !!inputContent.trim() && !isLoading, [inputContent, isLoading]);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywords.split(',') }),
      });
      const data = await response.json();
      setNewsArticles(data.articles);
    } catch (error) {
      console.error('뉴스 불러오기 실패', error);
    }
  };

  const generateContent = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setKoContent('생성 중…');
    setEnContent('Generating…');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 서버에서 국/영문 둘 다 만들어서 JSON으로 반환하도록 구현되어 있어야 함
        body: JSON.stringify({ articles: inputContent }),
      });

      if (!response.ok) {
        const t = await response.text();
        try {
          const j = JSON.parse(t);
          throw new Error(j.error || `API ${response.status}`);
        } catch {
          throw new Error(`API ${response.status}: ${t}`);
        }
      }

      const data: GenerateResp = await response.json();

      // ① 새 구조({ko,en}) 우선 사용
      if (data.ko || data.en) {
        setKoContent((data.ko ?? '').trim() || '생성된 국문 게시글이 없습니다.');
        setEnContent((data.en ?? '').trim() || 'No English post was returned.');
      } else {
        // ② 구 구조({post}) 호환: 한 결과를 두 칸에 그대로 넣기
        const one = (data.post ?? '').trim();
        if (one) {
          setKoContent(one);
          setEnContent(one);
        } else {
          setKoContent('생성 결과가 없습니다.');
          setEnContent('No content returned.');
        }
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error?.message || '생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setKoContent('생성 실패');
      setEnContent('Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // noop
    }
  };

  const handleCopyKo = async () => {
    await copyToClipboard(koContent);
    setKoCopied(true);
    setTimeout(() => setKoCopied(false), 1500);
  };

  const handleCopyEn = async () => {
    await copyToClipboard(enContent);
    setEnCopied(true);
    setTimeout(() => setEnCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#f4ebff] via-[#e3f2fd] to-[#fffaf0] p-8 pb-16 font-sans">
      <div className="text-3xl font-extrabold mb-6 text-purple-800">Postly</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽 영역 */}
        <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md h-full">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">키워드 입력</label>
            <input
              type="text"
              placeholder="예: AI, 마케팅 자동화"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            onClick={fetchNews}
            className="w-fit px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition text-sm font-medium"
          >
            🔎 뉴스 불러오기
          </button>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">최신 뉴스</label>
            <div className="w-full h-52 overflow-y-scroll border border-gray-300 rounded-xl p-3 bg-gray-50 text-sm">
              {newsArticles.length === 0 ? (
                <p className="text-gray-400">불러온 뉴스가 없습니다.</p>
              ) : (
                newsArticles.map((a, idx) => (
                  <div key={idx} className="mb-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {idx + 1}
                      </span>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 font-semibold hover:underline text-sm leading-tight flex-1"
                      >
                        {a.title}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">콘텐츠 소스 입력</label>
            <textarea
              placeholder="뉴스 내용, 요약문, 아이디어 등을 여기에 붙여넣기..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="w-full h-80 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
            />
          </div>

          <button
            onClick={generateContent}
            disabled={!canGenerate}
            className="mt-2 w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold text-lg disabled:opacity-50"
          >
            {isLoading ? '생성 중…' : '✨ LinkedIn 게시물 작성하기'}
          </button>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        </div>

        {/* 오른쪽 영역: 상단=국문, 하단=영문 */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-5">
          <div className="text-xl font-semibold text-purple-700">📝 생성된 콘텐츠</div>

          {/* 국문 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">국문 버전</h3>
              <button
                onClick={handleCopyKo}
                className="text-xs rounded-lg border px-3 py-1 hover:bg-slate-50"
              >
                {koCopied ? '✅' : '복사'}
              </button>
            </div>
            <textarea
              readOnly
              value={koContent}
              className="w-full h-56 p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap"
            />
          </section>

          {/* 영문 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">영문 버전</h3>
              <button
                onClick={handleCopyEn}
                className="text-xs rounded-lg border px-3 py-1 hover:bg-slate-50"
              >
                {enCopied ? '✅' : '복사'}
              </button>
            </div>
            <textarea
              readOnly
              value={enContent}
              className="w-full h-56 p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from "react";

export default function Page() {
  const [keywords, setKeywords] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [generatedContent, setGeneratedContent] = useState("콘텐츠 생성 결과가 없습니다.");
  const [isLoading, setIsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<{ title: string; url: string; summary: string }[]>([]);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.split(",") }),
      });

      const data = await response.json();
      setNewsArticles(data.articles);


    } catch (error) {
      console.error("뉴스 불러오기 실패", error);
    }
  };

  const generateContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: inputContent }),
      });

      const data = await response.json();
      setGeneratedContent(data.post);
    } catch (error) {
      setGeneratedContent("콘텐츠 생성 실패 😢");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#f4ebff] via-[#e3f2fd] to-[#fffaf0] p-8 pb-16 font-sans">
      <div className="text-3xl font-extrabold mb-6 text-purple-800">Postly</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽 영역 */}
        <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md h-full">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">키워드</label>
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
            <label className="block text-sm font-semibold text-gray-600 mb-1">뉴스 요약</label>
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
            <label className="block text-sm font-semibold text-gray-600 mb-1">콘텐츠 입력</label>
            <textarea
              placeholder="뉴스 내용, 요약문, 아이디어 등을 여기에 붙여넣기..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="w-full h-80 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
            />
          </div>

          <button
            onClick={generateContent}
            disabled={isLoading}
            className="mt-2 w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-bold text-lg disabled:opacity-50"
          >
            ✨ Generate Content
          </button>
        </div>

        {/* 오른쪽 영역 */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="text-xl font-semibold text-purple-700 mb-3 flex items-center gap-2">
            📝 생성된 콘텐츠
            </div>
            <div
            className="w-full h-[32rem] overflow-y-scroll p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
            </div>
      </div>
    </main>
  );
}

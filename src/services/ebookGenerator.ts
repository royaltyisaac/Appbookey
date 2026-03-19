import { Book, BookChapter, GenerationConfig, GenerationProgress } from '../types';
import { generateText, generateCoverImage } from './pollinations';

type ProgressCallback = (progress: GenerationProgress) => void;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function generateOutline(
  config: GenerationConfig,
): Promise<{ chapters: { title: string; summary: string }[] }> {
  const prompt = `You are a professional book author. Create a detailed chapter outline for a ${config.genre} book.

Title: "${config.title}"
Description: ${config.description}
Number of chapters: ${config.chapterCount}
Target pages per chapter: approximately ${Math.floor(config.targetPages / config.chapterCount)}

Return ONLY a JSON object with this exact format, no other text:
{
  "chapters": [
    {"title": "Chapter Title", "summary": "Brief 2-sentence summary of what happens in this chapter"}
  ]
}`;

  const response = await generateText(
    [{ role: 'user', content: prompt }],
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to generate outline');

  return JSON.parse(jsonMatch[0]);
}

async function generateChapterContent(
  config: GenerationConfig,
  chapterTitle: string,
  chapterSummary: string,
  chapterNumber: number,
  previousChapterSummaries: string[],
): Promise<string> {
  const wordsPerPage = 250;
  const targetWords = Math.floor(config.targetPages / config.chapterCount) * wordsPerPage;

  const previousContext = previousChapterSummaries.length > 0
    ? `\n\nPrevious chapters summary:\n${previousChapterSummaries.map((s, i) => `Chapter ${i + 1}: ${s}`).join('\n')}`
    : '';

  const prompt = `You are a professional ${config.genre} author. Write Chapter ${chapterNumber} of "${config.title}".

Chapter Title: "${chapterTitle}"
Chapter Brief: ${chapterSummary}
Author name: ${config.author}
${previousContext}

Write approximately ${targetWords} words of compelling, professional prose for this chapter. Include vivid descriptions, dialogue where appropriate, and maintain a consistent voice. Start with the chapter title as a heading.

Write the full chapter content now:`;

  return generateText(
    [
      {
        role: 'system',
        content: `You are a bestselling ${config.genre} author known for engaging, vivid prose. Write in a professional, published-book quality style.`,
      },
      { role: 'user', content: prompt },
    ],
  );
}

function estimatePageCount(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
}

export async function generateEbook(
  config: GenerationConfig,
  isWatermarked: boolean,
  onProgress: ProgressCallback,
): Promise<Book> {
  const bookId = generateId();

  // Stage 1: Generate outline
  onProgress({
    stage: 'outline',
    currentChapter: 0,
    totalChapters: config.chapterCount,
    message: 'Creating book outline...',
    progress: 5,
  });

  const outline = await generateOutline(config);

  // Stage 2: Generate chapters
  const chapters: BookChapter[] = [];
  const chapterSummaries: string[] = [];

  for (let i = 0; i < outline.chapters.length; i++) {
    const chapterInfo = outline.chapters[i];
    const progressPercent = 10 + ((i / outline.chapters.length) * 75);

    onProgress({
      stage: 'chapters',
      currentChapter: i + 1,
      totalChapters: outline.chapters.length,
      message: `Writing chapter ${i + 1}: ${chapterInfo.title}...`,
      progress: progressPercent,
    });

    const content = await generateChapterContent(
      config,
      chapterInfo.title,
      chapterInfo.summary,
      i + 1,
      chapterSummaries,
    );

    chapters.push({
      title: chapterInfo.title,
      content,
      pageCount: estimatePageCount(content),
    });

    chapterSummaries.push(chapterInfo.summary);
  }

  // Stage 3: Generate cover
  onProgress({
    stage: 'cover',
    currentChapter: outline.chapters.length,
    totalChapters: outline.chapters.length,
    message: 'Generating book cover...',
    progress: 88,
  });

  const coverPrompt = `Professional book cover design, ${config.coverStyle} style, for a ${config.genre} book titled "${config.title}" by ${config.author}. ${config.description}. High quality, print-ready, dramatic lighting, professional typography layout area at top.`;

  const coverUrl = await generateCoverImage(
    coverPrompt,
    config.coverModel,
  );

  // Stage 4: Finalize
  onProgress({
    stage: 'finalizing',
    currentChapter: outline.chapters.length,
    totalChapters: outline.chapters.length,
    message: 'Finalizing your ebook...',
    progress: 95,
  });

  const totalPages = chapters.reduce((sum, ch) => sum + ch.pageCount, 0);

  const book: Book = {
    id: bookId,
    title: config.title,
    author: config.author,
    genre: config.genre,
    description: config.description,
    chapters,
    coverUrl,
    coverModel: config.coverModel,
    createdAt: Date.now(),
    totalPages,
    isWatermarked,
  };

  onProgress({
    stage: 'complete',
    currentChapter: outline.chapters.length,
    totalChapters: outline.chapters.length,
    message: 'Your ebook is ready!',
    progress: 100,
  });

  return book;
}

export function generateBookHtml(book: Book): string {
  const watermarkCss = book.isWatermarked
    ? `
    .page::after {
      content: 'EBOOKMAGIC FREE';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80px;
      color: rgba(155, 89, 182, 0.08);
      pointer-events: none;
      z-index: 1000;
      font-weight: bold;
      white-space: nowrap;
    }`
    : '';

  const chaptersHtml = book.chapters
    .map(
      (ch, i) => `
    <div class="chapter page">
      <h2>Chapter ${i + 1}</h2>
      <h3>${ch.title}</h3>
      <div class="chapter-content">${ch.content.replace(/\n/g, '<br/>')}</div>
    </div>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${book.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.8;
      color: #2c2c2c;
      background: #faf9f6;
    }
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #120A1E 0%, #1E1230 50%, #2A1B40 100%);
      color: white;
      text-align: center;
      padding: 40px 20px;
      page-break-after: always;
    }
    .cover img {
      max-width: 60%;
      max-height: 50vh;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      margin-bottom: 40px;
    }
    .cover h1 { font-size: 42px; margin-bottom: 16px; letter-spacing: 2px; }
    .cover .author { font-size: 22px; opacity: 0.8; font-style: italic; }
    .cover .genre { font-size: 14px; opacity: 0.5; margin-top: 20px; text-transform: uppercase; letter-spacing: 4px; }
    .toc { padding: 60px 40px; max-width: 700px; margin: 0 auto; page-break-after: always; }
    .toc h2 { font-size: 28px; margin-bottom: 30px; color: #1E1230; border-bottom: 2px solid #9B59B6; padding-bottom: 10px; }
    .toc-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dotted #ccc; font-size: 16px; }
    .chapter { padding: 60px 40px; max-width: 700px; margin: 0 auto; page-break-before: always; }
    .chapter h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #9B59B6; margin-bottom: 8px; }
    .chapter h3 { font-size: 28px; margin-bottom: 30px; color: #1E1230; }
    .chapter-content { font-size: 16px; text-align: justify; }
    ${watermarkCss}
    @media print {
      .cover { page-break-after: always; }
      .chapter { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="cover">
    ${book.coverUrl ? `<img src="${book.coverUrl}" alt="Book Cover" />` : ''}
    <h1>${book.title}</h1>
    <div class="author">by ${book.author}</div>
    <div class="genre">${book.genre}</div>
  </div>

  <div class="toc">
    <h2>Table of Contents</h2>
    ${book.chapters.map((ch, i) => `<div class="toc-item"><span>Chapter ${i + 1}: ${ch.title}</span><span>${ch.pageCount} pages</span></div>`).join('\n')}
  </div>

  ${chaptersHtml}
</body>
</html>`;
}

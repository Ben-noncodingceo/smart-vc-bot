import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParseResult {
  text: string;
  pageCount?: number;
  metadata?: any;
}

/**
 * Parse PDF file and extract text
 */
async function parsePDF(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(`\n--- Page ${i} ---\n${pageText}`);
  }

  return {
    text: textParts.join('\n'),
    pageCount,
    metadata: await pdf.getMetadata()
  };
}

/**
 * Parse DOCX file and extract text
 */
async function parseDOCX(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return {
    text: result.value,
    metadata: {
      messages: result.messages
    }
  };
}

/**
 * Parse PPTX file and extract text from slides
 */
async function parsePPTX(file: File): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideTexts: string[] = [];
  let slideNumber = 1;

  // Get all slide files
  const slideFiles = Object.keys(zip.files)
    .filter(filename => filename.match(/ppt\/slides\/slide\d+\.xml/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
      return numA - numB;
    });

  for (const slideFile of slideFiles) {
    const slideXml = await zip.file(slideFile)?.async('text');
    if (!slideXml) continue;

    // Extract text from XML (simple regex approach)
    const textMatches = slideXml.matchAll(/<a:t>([^<]+)<\/a:t>/g);
    const slideText = Array.from(textMatches)
      .map(match => match[1])
      .join(' ');

    if (slideText.trim()) {
      slideTexts.push(`\n--- Slide ${slideNumber} ---\n${slideText}`);
      slideNumber++;
    }
  }

  return {
    text: slideTexts.join('\n'),
    pageCount: slideFiles.length
  };
}

/**
 * Main file parser function
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return parsePDF(file);
    case 'docx':
      return parseDOCX(file);
    case 'pptx':
      return parsePPTX(file);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

/**
 * Validate file before parsing
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  const supportedFormats = ['pdf', 'docx', 'pptx'];
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !supportedFormats.includes(extension)) {
    return {
      valid: false,
      error: `不支持的文件格式。请上传 PDF、DOCX 或 PPTX 文件。`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制（最大 10 MB）。当前文件大小：${(file.size / 1024 / 1024).toFixed(2)} MB`
    };
  }

  return { valid: true };
}

/**
 * Truncate text if too long (for LLM context limits)
 */
export function truncateText(text: string, maxChars: number = 20000): string {
  if (text.length <= maxChars) {
    return text;
  }

  const halfChars = Math.floor(maxChars / 2);
  return text.substring(0, halfChars) + '\n\n[... 中间内容已省略 ...]\n\n' + text.substring(text.length - halfChars);
}

/**
 * Get summary of parsed result for display
 */
export function getFileSummary(file: File, parseResult: ParseResult): string {
  const size = (file.size / 1024).toFixed(2);
  const charCount = parseResult.text.length;
  const pageInfo = parseResult.pageCount ? ` | ${parseResult.pageCount} 页` : '';

  return `文件：${file.name} (${size} KB${pageInfo}) | 提取字符数：${charCount}`;
}

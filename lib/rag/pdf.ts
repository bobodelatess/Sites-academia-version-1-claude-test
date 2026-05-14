/**
 * Parsing PDF avec unpdf — extraction par page conservée.
 * unpdf fonctionne dans Node et en serverless (Vercel).
 */

import { extractText, getDocumentProxy } from "unpdf";

export type PdfPage = {
  page: number; // 1-indexed
  text: string;
};

export type ParsedPdf = {
  pages: PdfPage[];
  pageCount: number;
};

export async function parsePdf(buffer: ArrayBuffer): Promise<ParsedPdf> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const result = await extractText(pdf, { mergePages: false });

  const rawPages = Array.isArray(result.text) ? result.text : [result.text];
  const pages: PdfPage[] = [];
  rawPages.forEach((raw, idx) => {
    const text = normalize(raw);
    if (text.length > 0) {
      pages.push({ page: idx + 1, text });
    }
  });

  return { pages, pageCount: result.totalPages };
}

/**
 * Nettoyage léger : espaces multiples, sauts de ligne en trop.
 * On ne touche pas au LaTeX / symboles math, on laisse passer.
 */
function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

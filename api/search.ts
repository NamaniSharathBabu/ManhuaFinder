import { GoogleGenAI } from "@google/genai";
import { Recommendation, ContentType, ReadingLink } from "../types";

// Vercel Serverless function to proxy requests to the Google GenAI API.
// Keeps API_KEY server-side so it is never exposed to the client.
export default async function handler(req: any, res: any) {
  try {
    // Support both POST (with JSON body) and GET (query params)
    let body: any = {};
    if (req.method === 'POST') {
      if (req.body && Object.keys(req.body).length > 0) body = req.body;
      else {
        // Parse raw body if not pre-parsed
        let data = '';
        for await (const chunk of req) data += chunk;
        body = data ? JSON.parse(data) : {};
      }
    } else {
      body = req.query || {};
    }

    const description: string = body.description || '';
    const page: number = Number(body.page || 1);

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: 'Missing description' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'Missing API_KEY on server' });

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
      Search for exactly 12 different manga, manhwa, or manhua that best match this description: "${description}". 
      This is PAGE ${page} of the results. 

      Target these domains for reading links: 
      - mgeko.cc
      - manhuafast.com 
      - asurascans.com 
      - mangaread.org 
      - aquamanga.com 
      - reaperscans.com
      - mangadex.org

      For each of the 12 recommendations, follow this structure exactly:
      TITLE: [Full Official Title]
      TYPE: [Manga/Manhwa/Manhua]
      SUMMARY: [2-sentence explanation of the plot and why it matches the user request]
      LINKS: [Source Name 1: URL 1, Source Name 2: URL 2, Source Name 3: URL 3]
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = response.text || '';
    const recommendations = parseGeminiResponse(text);

    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
}

// Copy of the parser logic used on the client to convert text -> structured data
const parseGeminiResponse = (text: string): Recommendation[] => {
  const blocks = text.split(/---\n?/).filter(b => b.trim().length > 20);
  return blocks.map((block, index) => {
    const title = extractValue(block, "TITLE:");
    const typeStr = extractValue(block, "TYPE:").toLowerCase();
    const summary = extractValue(block, "SUMMARY:");
    const linksStr = extractValue(block, "LINKS:");

    let type = ContentType.UNKNOWN;
    if (typeStr.includes('manhwa')) type = ContentType.MANHWA;
    else if (typeStr.includes('manhua')) type = ContentType.MANHUA;
    else if (typeStr.includes('manga')) type = ContentType.MANGA;

    const links: ReadingLink[] = linksStr
      .replace(/\[|\]/g, '')
      .split(',')
      .map(part => {
        const httpIndex = part.indexOf('http');
        if (httpIndex === -1) return null;

        const sourcePart = part.substring(0, part.lastIndexOf(':', httpIndex)).trim();
        const urlPart = part.substring(httpIndex).trim();
        return { source: sourcePart || 'Source', url: urlPart };
      })
      .filter((l): l is ReadingLink => l !== null && l.url.startsWith('http'));

    return {
      id: `rec-${index}-${Date.now()}`,
      title: title || 'Unknown Title',
      type,
      summary: summary || 'No summary provided.',
      links: links.length > 0 ? links : [{ source: 'Search', url: `https://www.google.com/search?q=read+${encodeURIComponent(title || '')}` }],
      imageQuery: title || ''
    };
  });
};

const extractValue = (block: string, key: string): string => {
  const lines = block.split('\n');
  const line = lines.find(l => l.trim().startsWith(key));
  if (!line) return '';
  const value = line.substring(line.indexOf(key) + key.length).trim();
  return value;
};

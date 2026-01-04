import { Recommendation, ContentType, ReadingLink } from "../types";

export const searchManga = async (description: string, page: number = 1): Promise<Recommendation[]> => {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, page })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || 'Failed to fetch recommendations');
  }

  const data = await res.json();
  return data.recommendations || [];
};

// (client keeps parsing helpers in case we need to parse text locally in future)
const extractValue = (block: string, key: string): string => {
  const lines = block.split('\n');
  const line = lines.find(l => l.trim().startsWith(key));
  if (!line) return "";
  const value = line.substring(line.indexOf(key) + key.length).trim();
  return value;
};

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
        return { source: sourcePart || "Source", url: urlPart };
      })
      .filter((l): l is ReadingLink => l !== null && l.url.startsWith('http'));

    return {
      id: `rec-${index}-${Date.now()}`,
      title: title || "Unknown Title",
      type,
      summary: summary || "No summary provided.",
      links: links.length > 0 ? links : [{ source: "Search", url: `https://www.google.com/search?q=read+${encodeURIComponent(title || "")}` }],
      imageQuery: title || ""
    };
  });
};

export const parseTextToRecommendations = parseGeminiResponse;

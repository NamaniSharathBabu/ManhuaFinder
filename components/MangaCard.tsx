
import React from 'react';
import { Recommendation, ContentType } from '../types';

interface MangaCardProps {
  data: Recommendation;
}

const MangaCard: React.FC<MangaCardProps> = ({ data }) => {
  const typeColors = {
    [ContentType.MANGA]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [ContentType.MANHWA]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [ContentType.MANHUA]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [ContentType.UNKNOWN]: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <div className="group relative glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full border border-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeColors[data.type]}`}>
          {data.type}
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-lexend font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
        {data.title}
      </h3>
      
      <p className="text-slate-400 text-sm mb-6 line-clamp-5 leading-relaxed flex-grow">
        {data.summary}
      </p>

      <div className="space-y-3 mt-auto pt-5 border-t border-white/5">
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Available Sources:</p>
        <div className="flex flex-wrap gap-2">
          {data.links.map((link, idx) => (
            <a 
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800/40 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 text-[11px] font-semibold rounded-lg transition-all border border-white/5 hover:border-indigo-500/30"
            >
              <span className="max-w-[100px] truncate">{link.source}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MangaCard;

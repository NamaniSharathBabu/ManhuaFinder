
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import MangaCard from './components/MangaCard';
import SkeletonLoader from './components/SkeletonLoader';
import { searchManga } from './services/geminiService';
import { Recommendation, SearchState } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    results: [],
  });
  
  // Cache to store results for all pages fetched in the current search session
  const [pageCache, setPageCache] = useState<Record<number, Recommendation[]>>({});
  const [isPrefetching, setIsPrefetching] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // Background pre-fetcher that saves directly to the cache
  const prefetchNextPage = useCallback(async (searchQuery: string, pageNum: number) => {
    // Avoid pre-fetching if we already have it in cache or are currently pre-fetching
    if (isPrefetching || pageCache[pageNum]) return;
    
    setIsPrefetching(true);
    try {
      const results = await searchManga(searchQuery, pageNum);
      setPageCache(prev => ({ ...prev, [pageNum]: results }));
    } catch (err) {
      console.warn("Background prefetch failed:", err);
    } finally {
      setIsPrefetching(false);
    }
  }, [isPrefetching, pageCache]);

  const fetchResults = useCallback(async (searchQuery: string, pageNum: number) => {
    // 1. Check if the page is already in our persistent cache
    if (pageCache[pageNum]) {
      setState({ loading: false, error: null, results: pageCache[pageNum] });
      
      // Still need to trigger scroll if moving between pages
      if (pageNum > 1) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // 2. If not in cache, perform a standard load
    setState(prev => ({ ...prev, loading: true, error: null, results: pageNum === 1 ? [] : prev.results }));
    
    try {
      const results = await searchManga(searchQuery, pageNum);
      
      // Update cache and current state
      setPageCache(prev => ({ ...prev, [pageNum]: results }));
      setState({ loading: false, error: null, results });
      
      if (pageNum > 1) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      setState({ 
        loading: false, 
        error: err.message || "An unexpected error occurred.", 
        results: [] 
      });
    }
  }, [pageCache]);

  // Sequential loading effect: 
  // Once the current page is done loading, start fetching the next page in background.
  useEffect(() => {
    const shouldPrefetch = 
      !state.loading && 
      state.results.length > 0 && 
      query && 
      !isPrefetching && 
      !pageCache[currentPage + 1];

    if (shouldPrefetch) {
      prefetchNextPage(query, currentPage + 1);
    }
  }, [state.loading, state.results, currentPage, query, isPrefetching, pageCache, prefetchNextPage]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    // Reset cache and pagination for a fresh search
    setPageCache({}); 
    setCurrentPage(1);
    fetchResults(query, 1);
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchResults(query, nextPage);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchResults(query, prevPage);
  };

  const suggestions = [
    "Action manhua on Manhuafast",
    "Solo leveling style manhwa",
    "Romance manhua CEO",
    "Isekai manga 200+ chapters"
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-lexend font-extrabold text-white mb-6 leading-tight">
            Fast <span className="text-indigo-500">Manga Search</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Deep searching Mgeko, Manhuafast, Asura, and more. Pages are cached so you can browse back and forth instantly.
          </p>
          
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you want to read in detail..."
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl px-6 py-5 pr-36 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg shadow-xl"
            />
            <button 
              type="submit"
              disabled={state.loading}
              className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              {state.loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Find
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-slate-500 text-sm flex items-center">Try:</span>
            {suggestions.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setQuery(s);
                  setPageCache({});
                  setCurrentPage(1);
                  fetchResults(s, 1);
                }}
                className="text-xs bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white border border-slate-700/50 rounded-full px-4 py-1.5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-24" />

        {state.error && (
          <div className="max-w-xl mx-auto mb-12 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-1">Search Failed</h3>
            <p className="text-red-400 text-sm">{state.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {state.loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonLoader key={idx} />
            ))
          ) : (
            state.results.map((item) => (
              <MangaCard key={item.id} data={item} />
            ))
          )}
        </div>

        {!state.loading && state.results.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-6 mt-16 py-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm uppercase font-bold tracking-widest">Page</span>
                <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20">
                  {currentPage}
                </span>
              </div>

              <button 
                onClick={handleNextPage}
                className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <span>Next Page</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {isPrefetching && (
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
                Current results cached. Pre-loading next page...
              </p>
            )}
          </div>
        )}

        {!state.loading && state.results.length === 0 && !state.error && (
          <div className="text-center py-20 bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-700">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-lexend font-bold text-white mb-2">Ready to explore?</h3>
            <p className="text-slate-400">Search for a plot or genre to get dozen of matches from Mgeko, Asura, and more!</p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-white/5 pt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MangaQuest AI. Ultra-fast text-based discovery across top sources.</p>
        <p className="mt-1">Pages are cached locally for zero-lag navigation.</p>
      </footer>
    </div>
  );
};

export default App;

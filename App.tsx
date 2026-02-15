
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { enrichRecipeWithAutoTags, RECIPE_SCHEMA_PROMPT, getBookCategory } from './services/recipeService';
import { loadLibraryFromDrive, saveLibraryToDrive } from './services/driveService';
import { Recipe, RecipeBook, UserSession } from './types';
import RecipePage from './components/RecipePage';
import CoverPage from './components/CoverPage';

const GOOGLE_CLIENT_ID = "634563853153-f7pgho436skv0v2p958e94h0be9pbtat.apps.googleusercontent.com";

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('kawaii_session_v7');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [library, setLibrary] = useState<RecipeBook[]>([]);
  const [currentBook, setCurrentBook] = useState<RecipeBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<'library' | 'import'>('library');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [importTitle, setImportTitle] = useState('');
  const [importJson, setImportJson] = useState('');
  
  const tokenClient = useRef<any>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        tokenClient.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file email profile',
          callback: (response: any) => {
            if (response.access_token) {
              const newSession = { accessToken: response.access_token, email: "user@drive.com" };
              setSession(newSession);
              localStorage.setItem('kawaii_session_v7', JSON.stringify(newSession));
              loadInitialData(response.access_token);
            }
          },
        });
      }
    };
    initGoogle();
  }, []);

  const loadInitialData = async (token: string) => {
    setLoading(true);
    try {
      const driveData = await loadLibraryFromDrive(token);
      if (driveData) setLibrary(driveData);
    } catch (err) {
      console.warn("Iniciando biblioteca vacía.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && library.length > 0) {
      const timer = setTimeout(async () => {
        setSyncing(true);
        try {
          await saveLibraryToDrive(session.accessToken!, library);
        } catch (err) {
          console.error("Error Drive Sync");
        } finally {
          setSyncing(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [library, session?.accessToken]);

  const filteredLibrary = useMemo(() => {
    return library.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
      const category = getBookCategory(book.recipes);
      const matchesFilter = activeFilter === 'TODOS' || category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [library, searchQuery, activeFilter]);

  const categories = useMemo(() => {
    const cats = new Set(['TODOS']);
    library.forEach(b => cats.add(getBookCategory(b.recipes)));
    return Array.from(cats);
  }, [library]);

  const handleImport = () => {
    if (!importTitle || !importJson) return alert("Completa el título y pega el JSON.");
    try {
      const parsedRecipes: any[] = JSON.parse(importJson);
      const newBook: RecipeBook = {
        id: `book-${Date.now()}`,
        title: importTitle.toUpperCase(),
        subtitle: "EDICIÓN ESPECIAL SIN AZÚCAR ✨",
        recipes: parsedRecipes.map((r, i) => ({
          ...enrichRecipeWithAutoTags(r),
          id: `rcp-${Date.now()}-${i}`
        })),
        createdAt: Date.now()
      };
      setLibrary(prev => [newBook, ...prev]);
      setCurrentBook(newBook);
      setView('library');
      setImportTitle('');
      setImportJson('');
    } catch (e) {
      alert("Error en el formato JSON. Asegúrate de copiar el código exacto de la IA.");
    }
  };

  const copyPrompt = () => {
    const prompt = `Actúa como un Chef y Nutricionista. Crea un recetario profesional sobre "${importTitle || 'Alimentación Saludable'}".
Debes devolver UNICAMENTE un array JSON con este esquema (SIN TEXTO EXTRA):
${JSON.stringify(RECIPE_SCHEMA_PROMPT, null, 2)}
Genera 6 recetas detalladas incluyendo macros exactos para detección de filtros.`;
    navigator.clipboard.writeText(prompt);
    alert("¡Comando Copiado! 🧁 Pégalo en ChatGPT o Gemini.");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9fb] p-6">
        <div className="bg-white rounded-[4rem] p-10 shadow-2xl max-w-md w-full text-center border-8 border-pink-50 relative overflow-hidden">
          <div className="text-7xl mb-6 floating">📔</div>
          <h1 className="font-display text-4xl text-pink-700 mb-2">Recipe Cloud</h1>
          <p className="text-pink-400 font-bold mb-10 text-[10px] uppercase tracking-widest">
            Tus libros, tu Drive, 100% Gratis
          </p>
          <button 
            onClick={() => tokenClient.current?.requestAccessToken()} 
            className="kawaii-btn w-full bg-pink-500 text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] border-pink-700 shadow-xl"
          >
            Entrar con Google Drive 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-kawaii bg-[#fffbfc]">
      <nav className="no-print bg-white/90 backdrop-blur-md border-b-2 border-pink-50 sticky top-0 z-[100] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('library'); setCurrentBook(null); }}>
          <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">🧁</div>
          <h1 className="font-display text-xl text-pink-700">Kawaii Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          {syncing && <span className="text-[8px] font-black text-green-500 uppercase">Sincronizado</span>}
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] font-black uppercase text-pink-200 hover:text-red-400">Salir</button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {currentBook ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="no-print flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-xl border-4 border-pink-50">
               <button onClick={() => setCurrentBook(null)} className="text-pink-500 font-bold text-sm px-4 hover:scale-110 transition-transform">← Biblioteca</button>
               <button onClick={() => window.print()} className="px-8 py-3 bg-pink-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest border-b-4 border-pink-700 shadow-lg hover:bg-pink-400 transition-all">Imprimir / PDF</button>
            </div>
            <div className="flex flex-col items-center gap-12 pb-32">
               <CoverPage title={currentBook.title} subtitle={currentBook.subtitle} recipes={currentBook.recipes} />
               {currentBook.recipes.map(recipe => (
                 <RecipePage key={recipe.id} recipe={recipe} />
               ))}
            </div>
          </div>
        ) : view === 'library' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setActiveFilter(cat)}
                     className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-300 border border-pink-100 hover:border-pink-300'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
              <input 
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full md:w-64 px-6 py-3 rounded-full border-2 border-pink-50 bg-white text-[10px] font-bold outline-none focus:border-pink-300"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div 
                 onClick={() => setView('import')}
                 className="aspect-[3/4] bg-white rounded-[3rem] border-4 border-dashed border-pink-100 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-pink-300 transition-all group shadow-sm"
               >
                 <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📔</div>
                 <p className="text-pink-400 font-black text-[9px] uppercase tracking-widest">Añadir Recetario</p>
               </div>

               {filteredLibrary.map(book => (
                 <div key={book.id} onClick={() => setCurrentBook(book)} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border-[6px] border-white shadow-xl relative transition-all group-hover:-translate-y-2">
                      <img src={book.coverImage || "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                         <span className="bg-pink-500/80 text-white text-[6px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">{getBookCategory(book.recipes)}</span>
                         <h3 className="text-white font-display text-lg leading-tight truncate">{book.title}</h3>
                         <p className="text-white/60 text-[8px] font-bold uppercase mt-1">{book.recipes.length} Recetas</p>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-8 bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300">
             <div className="text-center">
                <h2 className="font-display text-3xl text-pink-700">Nuevo Ebook</h2>
                <p className="text-pink-300 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Crea tu contenido gratis con IA</p>
             </div>

             <div className="space-y-6">
                <label className="block">
                   <span className="text-[9px] font-black text-pink-400 uppercase ml-4 mb-2 block">1. Nombre del Recetario</span>
                   <input 
                     value={importTitle} 
                     onChange={e => setImportTitle(e.target.value)}
                     placeholder="Ej: KETO DELICIAS 🍓" 
                     className="w-full px-8 py-5 rounded-full border-2 border-pink-50 bg-pink-50/20 font-bold outline-none focus:border-pink-300"
                   />
                </label>

                <div className="bg-pink-50/30 p-6 rounded-[2.5rem] border-2 border-dashed border-pink-100">
                   <button 
                    onClick={copyPrompt}
                    className="w-full py-4 bg-white text-pink-500 rounded-full font-black text-[9px] uppercase tracking-widest border-2 border-pink-100 hover:bg-pink-50 transition-all shadow-sm"
                   >
                     📋 Copiar Comando Maestro
                   </button>
                   <p className="text-[7px] text-pink-300 mt-4 italic text-center uppercase tracking-widest">Pégalo en tu IA favorita y obtén el JSON</p>
                </div>

                <label className="block">
                   <span className="text-[9px] font-black text-pink-400 uppercase ml-4 mb-2 block">2. Pegar JSON de la IA</span>
                   <textarea 
                     value={importJson}
                     onChange={e => setImportJson(e.target.value)}
                     placeholder='[ { "title": ... } ]'
                     className="w-full h-32 px-6 py-4 rounded-[2.5rem] border-2 border-pink-50 bg-stone-50 font-mono text-[9px] outline-none focus:border-pink-300 resize-none"
                   />
                </label>

                <div className="flex gap-4 pt-4">
                   <button onClick={() => setView('library')} className="flex-1 py-4 text-pink-300 font-black text-[9px] uppercase">Atrás</button>
                   <button 
                    onClick={handleImport}
                    className="flex-[2] py-4 bg-pink-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest border-b-4 border-pink-700 shadow-xl"
                   >
                     Construir Libro ✨
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="text-6xl animate-bounce">🍦</div>
           <p className="font-display text-pink-700 text-xl mt-4">Conectando...</p>
        </div>
      )}
    </div>
  );
};

export default App;

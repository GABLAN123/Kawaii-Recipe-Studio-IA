
import React, { useState, useEffect, useRef } from 'react';
import { RECIPE_SCHEMA_PROMPT, enrichRecipeWithAutoTags } from './services/recipeService.ts';
import { loadLibraryFromDrive, saveLibraryToDrive } from './services/driveService.ts';
import { Recipe, RecipeBook, UserSession } from './types.ts';
import RecipePage from './components/RecipePage.tsx';
import CoverPage from './components/CoverPage.tsx';

const GOOGLE_CLIENT_ID = "634563853153-f7pgho436skv0v2p958e94h0be9pbtat.apps.googleusercontent.com";

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('kawaii_session_v4');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [library, setLibrary] = useState<RecipeBook[]>([]);
  const [currentBook, setCurrentBook] = useState<RecipeBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<'library' | 'editor' | 'manual'>('library');
  const [topic, setTopic] = useState('');
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
              const newSession = { accessToken: response.access_token, email: "mi-cocina-ia@personal.com" };
              setSession(newSession);
              localStorage.setItem('kawaii_session_v4', JSON.stringify(newSession));
              loadInitialData(response.access_token);
            }
          },
        });
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();
  }, []);

  const loadInitialData = async (token: string) => {
    setLoading(true);
    setLoadingMsg('Sincronizando con tu nube personal... ☁️');
    try {
      const driveData = await loadLibraryFromDrive(token);
      if (driveData && Array.isArray(driveData)) {
        setLibrary(driveData);
      }
    } catch (err) {
      console.warn("Nueva biblioteca iniciada o error en Drive.");
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
          console.error("Error sincronizando con Drive");
        } finally {
          setSyncing(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [library, session?.accessToken]);

  const createNewBook = (title: string, recipes: Recipe[]) => {
    const newBook: RecipeBook = {
      id: `book-${Date.now()}`,
      title: title.toUpperCase(),
      subtitle: "EDICIÓN DE AUTOR IA ✨",
      recipes: recipes.map(enrichRecipeWithAutoTags),
      createdAt: Date.now()
    };
    setLibrary(prev => [newBook, ...prev]);
    setCurrentBook(newBook);
    setView('editor');
    setTopic('');
  };

  const handleManualImport = () => {
    try {
      const jsonStr = importJson.trim();
      const cleaned = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
      const recipes = JSON.parse(cleaned);
      
      if (!Array.isArray(recipes)) throw new Error("Debe ser un array de recetas");
      
      const sanitizedRecipes = recipes.map((r, i) => ({
        ...r,
        id: `rcp-manual-${Date.now()}-${i}`,
        difficulty: r.difficulty || 'Media',
        cost: r.cost || 'Medio'
      }));

      createNewBook(topic || "NUEVO RECETARIO", sanitizedRecipes);
      setImportJson('');
      setView('editor');
    } catch (e) {
      alert("JSON no válido. Asegúrate de copiar solo el bloque de código JSON que te dio la IA.");
    }
  };

  const copyPromptBuilder = () => {
    if (!topic.trim()) {
      alert("Escribe un tema para el recetario primero 🌸");
      return;
    }
    const prompt = `Actúa como un Chef de Alta Cocina y Nutricionista. Genera un recetario profesional de 6 recetas creativas sobre "${topic}".
REGLA CRÍTICA: Debes responder ÚNICAMENTE con un bloque de código JSON puro que siga este esquema exacto:
${JSON.stringify(RECIPE_SCHEMA_PROMPT, null, 2)}

No incluyas introducciones ni explicaciones. Solo el JSON.`;
    
    navigator.clipboard.writeText(prompt);
    alert("📋 COMANDO COPIADO. \n\n1. Ve a tu IA favorita (Gemini, ChatGPT, Claude).\n2. Pega el comando.\n3. Copia el JSON que te devuelva.\n4. Regresa aquí y pégalo.");
    setView('manual');
  };

  const copyADN = () => {
    if (!currentBook) return;
    const adn = `DNA_REPLICATION_PROMPT:
FORMAT: JSON_RECIPE_V1
STYLE: KAWAII_GURMET
SAMPLE_DATA: ${JSON.stringify(currentBook.recipes[0])}
INSTRUCTION: Follow this exact structure and nutrition logic for any new generation.`;
    navigator.clipboard.writeText(adn);
    alert("🧬 ADN DE CLONACIÓN COPIADO. Pégalo en otra IA para que replique este estilo exacto.");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9fb] p-6">
        <div className="bg-white rounded-[4rem] p-12 shadow-2xl max-w-md w-full text-center border-8 border-pink-50 relative overflow-hidden">
          <div className="text-7xl mb-6 floating">📔</div>
          <h1 className="font-display text-4xl text-pink-700 mb-2">My CookBook</h1>
          <p className="text-pink-400 font-bold mb-10 text-[10px] uppercase tracking-widest leading-relaxed">
            Privacidad Total • Almacenamiento Seguro • Sin Intermediarios • Gratis
          </p>
          <button 
            onClick={() => tokenClient.current?.requestAccessToken()} 
            className="kawaii-btn w-full bg-pink-500 text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] border-pink-700 shadow-xl"
          >
            Sincronizar mi Drive 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-kawaii bg-[#fffbfc]">
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[300] flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-pink-500 rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce mb-6">
            <span className="text-4xl">✨</span>
          </div>
          <p className="text-pink-700 font-display text-2xl">{loadingMsg}</p>
        </div>
      )}

      <nav className="no-print bg-white/90 backdrop-blur-md border-b-2 border-pink-50 sticky top-0 z-[100] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('library')}>
          <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center">
            <span className="text-xl">🍱</span>
          </div>
          <h1 className="font-display text-xl text-pink-700">Recipe Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          {syncing && <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter animate-pulse">Guardando...</span>}
          <button onClick={() => { localStorage.removeItem('kawaii_session_v4'); window.location.reload(); }} className="text-[10px] font-black uppercase text-pink-200 hover:text-red-500 transition-colors">Salir</button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {view === 'library' ? (
          <div className="space-y-12 fade-in">
            <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
               <h2 className="font-display text-3xl text-pink-700 mb-2">Crear Nuevo Recetario</h2>
               <p className="text-pink-300 font-bold text-sm mb-8 uppercase tracking-widest">Estudio Gourmet Privado • Sin claves de API • 100% Gratuito</p>
               
               <div className="flex flex-col gap-4">
                  <input 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Escribe el tema aquí..." 
                    className="w-full px-8 py-5 rounded-full border-2 border-pink-50 bg-pink-50/20 text-md font-bold focus:border-pink-400 outline-none"
                  />
                  <button onClick={copyPromptBuilder} className="kawaii-btn bg-pink-500 text-white px-8 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] border-pink-700 shadow-xl flex items-center justify-center gap-3">
                    Generar Comando 📋
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {library.length === 0 && (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-pink-50 rounded-[4rem]">
                   <p className="text-pink-200 font-black uppercase tracking-widest text-xs">Tu biblioteca está vacía</p>
                </div>
              )}
              {library.map(book => (
                <div key={book.id} onClick={() => { setCurrentBook(book); setView('editor'); }} className="group cursor-pointer">
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border-[6px] border-white shadow-xl relative transition-all group-hover:-translate-y-2">
                    <img src={book.coverImage || "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <h3 className="text-white font-display text-lg leading-tight truncate">{book.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === 'manual' ? (
          <div className="max-w-2xl mx-auto space-y-8 fade-in">
             <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-white">
                <button onClick={() => setView('library')} className="mb-6 text-pink-300 font-bold uppercase text-xs">← Volver</button>
                <h2 className="font-display text-3xl text-pink-700 mb-6">Importar JSON</h2>
                <textarea 
                  value={importJson}
                  onChange={e => setImportJson(e.target.value)}
                  placeholder="Pega el código JSON generado aquí..."
                  className="w-full h-80 p-6 rounded-[2.5rem] bg-stone-50 border-2 border-pink-50 font-mono text-xs outline-none focus:border-pink-300 mb-6 resize-none"
                />
                <button onClick={handleManualImport} className="w-full kawaii-btn bg-green-500 text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] border-green-700 shadow-xl">
                   Crear Libro ✨
                </button>
             </div>
          </div>
        ) : (
          <div className="space-y-8 fade-in">
            <div className="no-print bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border-4 border-white flex items-center justify-between sticky top-20 z-50">
               <button onClick={() => setView('library')} className="w-10 h-10 flex items-center justify-center bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-all">←</button>
               <div className="flex gap-2">
                  <button onClick={copyADN} className="px-4 py-2 bg-indigo-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest border-b-4 border-indigo-700">ADN</button>
                  <button onClick={() => window.print()} className="px-4 py-2 bg-pink-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest border-b-4 border-pink-700">PDF</button>
               </div>
            </div>

            <div className="flex flex-col items-center gap-12 pb-32">
               <CoverPage title={currentBook?.title || ""} subtitle={currentBook?.subtitle || ""} recipes={currentBook?.recipes} />
               {currentBook?.recipes.map(recipe => (
                 <RecipePage key={recipe.id} recipe={recipe} />
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

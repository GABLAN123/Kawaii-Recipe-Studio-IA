
import React, { useRef } from 'react';
import { Recipe } from '../types';

interface RecipePageProps {
  recipe: Recipe;
  onExportSingle?: (ref: React.RefObject<HTMLDivElement>) => void;
}

const RecipePage: React.FC<RecipePageProps> = ({ recipe, onExportSingle }) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const isSweet = recipe.tags.some(t => t.toLowerCase().includes('dulce') || t.toLowerCase().includes('azúcar'));
  const accentColor = isSweet ? '#ffb7c5' : '#87ceeb';

  return (
    <div className="relative group/page w-full flex flex-col items-center">
      <div ref={pageRef} className="a5-page bg-white p-2 sm:p-4 shrink-0">
        <div className="h-full w-full border-[3px] sm:border-4 border-solid rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 flex flex-col bg-[#fffbfc] relative" style={{ borderColor: accentColor }}>
          
          <header className="mb-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="font-display text-[18pt] sm:text-[24pt] text-pink-700 leading-tight mb-2 drop-shadow-sm">
                  {recipe.title}
                </h1>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag, idx) => {
                    const tagText = tag.replace(/[\[\]]/g, '');
                    const isMedical = tagText.includes('DIABÉTICOS') || tagText.includes('CELÍACOS');
                    const isSugarFree = tagText.includes('SIN AZÚCAR') || tagText.includes('0g');
                    return (
                      <span key={idx} className={`text-[6pt] sm:text-[7pt] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${isMedical ? 'bg-indigo-500 border-indigo-600 text-white' : isSugarFree ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-pink-100 text-pink-400'}`}>
                        {tagText}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-pink-100 bg-white flex flex-col items-center justify-center shadow-sm">
                   <span className="text-[5pt] font-black uppercase text-pink-300">Rinde</span>
                   <span className="text-[12pt] font-display text-pink-600 leading-none">{recipe.servings}</span>
                   <span className="text-[5pt] font-bold text-pink-300">pers.</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-2 mb-4">
             <div className="bg-white p-2 rounded-xl border-2 border-pink-50 text-center shadow-sm">
                <p className="text-[5pt] font-black text-pink-300 uppercase mb-1">Preparación</p>
                <p className="text-[7.5pt] font-bold text-stone-700">⏱ {recipe.totalTime}</p>
             </div>
             <div className="bg-white p-2 rounded-xl border-2 border-pink-50 text-center shadow-sm">
                <p className="text-[5pt] font-black text-pink-300 uppercase mb-1">Dificultad</p>
                <p className="text-[7.5pt] font-bold text-stone-700">⭐ {recipe.difficulty}</p>
             </div>
             <div className="bg-white p-2 rounded-xl border-2 border-pink-50 text-center shadow-sm">
                <p className="text-[5pt] font-black text-pink-300 uppercase mb-1">Presupuesto</p>
                <p className="text-[7.5pt] font-bold text-stone-700">💸 {recipe.cost}</p>
             </div>
          </div>

          <div className="flex flex-1 flex-col sm:flex-row gap-4 overflow-hidden min-h-0">
            <div className="w-full sm:w-[40%] flex flex-col gap-3 h-auto sm:h-full overflow-hidden">
              <div className="flex-1 bg-white rounded-2xl border-[2px] sm:border-4 p-3 sm:p-4 shadow-sm flex flex-col relative overflow-hidden" style={{ borderColor: accentColor }}>
                 <div className="text-pink-700 text-[7pt] sm:text-[8pt] font-black uppercase mb-2 flex items-center gap-2 border-b border-pink-50 pb-1.5">
                   <span>📝</span> Ingredientes
                 </div>
                 <div className="overflow-y-auto pr-1 flex-1 text-[8.5pt] sm:text-[9pt] custom-scrollbar">
                    {recipe.ingredientGroups.map((group, idx) => (
                      <div key={idx} className="mb-3">
                        {group.name && <h4 className="text-[6.5pt] font-black text-pink-400 mb-1 border-b border-pink-50/30 uppercase tracking-tighter">{group.name}</h4>}
                        <ul className="space-y-1">
                          {group.items.map((item, iIdx) => (
                            <li key={iIdx} className="leading-tight text-stone-700 font-bold pl-3 relative">
                              <span className="absolute left-0 top-1.5 w-1 h-1 bg-pink-200 rounded-full"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-pink-500 p-3 rounded-2xl shadow-lg border-2 border-pink-700 shrink-0">
                  <h4 className="text-[6pt] font-black text-white/80 uppercase tracking-widest mb-1.5 text-center">Macros</h4>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                     <div className="text-[7pt] text-white flex justify-between border-b border-white/20 pb-0.5"><span>Cal:</span> <strong className="font-black">{recipe.macros.kcal}</strong></div>
                     <div className="text-[7pt] text-white flex justify-between border-b border-white/20 pb-0.5"><span>Az:</span> <strong className="font-black">{recipe.macros.sugar}g</strong></div>
                     <div className="text-[7pt] text-white flex justify-between"><span>Carb:</span> <strong className="font-black">{recipe.macros.netCarbs}g</strong></div>
                     <div className="text-[7pt] text-white flex justify-between"><span>Prot:</span> <strong className="font-black">{recipe.macros.protein}g</strong></div>
                  </div>
              </div>
            </div>

            <div className="w-full sm:w-[60%] flex flex-col h-auto sm:h-full overflow-hidden">
              <div className="bg-white rounded-2xl border-[2px] sm:border-4 p-3 sm:p-4 flex-1 shadow-sm flex flex-col overflow-hidden" style={{ borderColor: accentColor }}>
                 <div className="text-pink-700 text-[7pt] sm:text-[8pt] font-black uppercase mb-2 flex items-center gap-2 border-b border-pink-50 pb-1.5">
                   <span>🥣</span> Preparación
                 </div>
                 <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-[9pt] sm:text-[9.5pt] custom-scrollbar">
                    {recipe.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center bg-pink-500 text-white text-[6pt] font-black shrink-0 shadow-sm border border-pink-700">
                          {sIdx + 1}
                        </span>
                        <p className="leading-relaxed text-stone-700 font-bold">
                          {step}
                        </p>
                      </div>
                    ))}
                    {recipe.chefNotes && (
                      <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 italic text-indigo-700 text-[7.5pt] font-semibold leading-relaxed">
                        "{recipe.chefNotes}"
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          <footer className="mt-4 pt-2 border-t border-pink-50 flex justify-between items-center opacity-40">
            <span className="text-[6pt] font-black text-pink-300 uppercase">Recipe Studio Cloud</span>
            <span className="text-[6pt] font-black text-pink-300">Pág. {recipe.id.slice(-2)}</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;

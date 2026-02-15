
import React, { useMemo, useRef } from 'react';
import { Recipe } from '../types';

interface CoverPageProps {
  title: string;
  subtitle: string;
  coverImage?: string;
  recipes?: Recipe[];
  onExportSingle?: (ref: React.RefObject<HTMLDivElement>) => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ title, subtitle, coverImage, recipes = [], onExportSingle }) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const defaultImage = "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=600";

  const categoryInfo = useMemo(() => {
    if (!recipes || recipes.length === 0) return { label: "MISCELÁNEO", icon: "✨", color: "#fef9c3" };
    
    const sweetKeywords = ['dulce', 'postre', 'azúcar', 'sugar', 'cake', 'pastel', 'chocolate'];
    const saltyKeywords = ['salado', 'carne', 'pollo', 'pescado', 'verdura', 'sal', 'pasta', 'guiso'];

    let hasSweet = false;
    let hasSalty = false;

    recipes.forEach(r => {
      const content = (r.title + ' ' + (r.tags || []).join(' ')).toLowerCase();
      if (sweetKeywords.some(k => content.includes(k))) hasSweet = true;
      if (saltyKeywords.some(k => content.includes(k))) hasSalty = true;
    });

    if (hasSweet && hasSalty) return { label: "DULCE & SALADO", icon: "🥨🍰", color: "#d1f2eb" };
    if (hasSweet) return { label: "DULCE", icon: "🧁", color: "#ffd6e0" };
    if (hasSalty) return { label: "SALADO", icon: "🍱", color: "#c1f0fb" };
    return { label: "KAWAII FOOD", icon: "✨", color: "#fef9c3" };
  }, [recipes]);
  
  return (
    <div className="relative group/page">
      <div ref={pageRef} id="cover-page-export" className="a5-page bg-white p-4">
        <div className="h-full w-full border-4 border-dashed rounded-[30px] p-8 flex flex-col items-center justify-between relative overflow-hidden" style={{ borderColor: categoryInfo.color }}>
          
          <div className="absolute top-10 left-10 text-2xl floating">✨</div>
          <div className="absolute bottom-10 right-10 text-2xl floating" style={{ animationDelay: '1.5s' }}>💫</div>
          <div className="absolute top-20 right-10 text-xl floating" style={{ animationDelay: '0.8s' }}>🌸</div>

          <div className="z-10 text-center">
            <div className="text-pink-600 font-black text-[10px] tracking-[0.4em] uppercase mb-4">
              ♥ HANDMADE WITH LOVE ♥
            </div>

            <div className="inline-block px-5 py-2.5 rounded-full mb-6 shadow-md border-2 border-white" style={{ backgroundColor: categoryInfo.color }}>
              <span className="text-[9pt] font-black tracking-widest text-pink-800 uppercase">
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            </div>
            
            <h1 className="font-display text-[32pt] sm:text-[38pt] mb-4 text-pink-700 leading-tight drop-shadow-md">
              {title}
            </h1>
            
            <p className="font-kawaii font-bold text-lg sm:text-xl text-pink-600 italic mb-8">
              {subtitle}
            </p>
          </div>

          <div className="w-full aspect-square max-w-[180px] sm:max-w-[200px] relative">
            <div className="absolute inset-0 bg-pink-100 rounded-[40px] rotate-3 -z-10 shadow-sm"></div>
            <div className="w-full h-full rounded-[40px] border-8 border-white shadow-xl overflow-hidden relative">
                <img 
                  src={coverImage || defaultImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
            </div>
          </div>
          
          <div className="mt-8 font-display text-pink-400 text-lg tracking-widest uppercase">
            Kawaii Studio
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;


import { Recipe } from "../types";

export const RECIPE_SCHEMA_PROMPT = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: "string",
      tags: ["string"],
      ingredientGroups: [{ name: "string", items: ["string"] }],
      steps: ["string"],
      chefNotes: "string",
      macros: { 
        kcal: "number", 
        sugar: "number", 
        netCarbs: "number", 
        protein: "number",
        fats: "number"
      },
      servings: "number",
      totalTime: "string",
      difficulty: "Fácil | Media | Alta",
      cost: "Económico | Medio | Gourmet"
    }
  }
};

export const enrichRecipeWithAutoTags = (recipe: Recipe): Recipe => {
  const autoTags = [...(recipe.tags || [])];
  
  // Categorización Médica y Nutricional Automática
  if (recipe.macros.sugar <= 1) {
    autoTags.push("SIN AZÚCAR");
    if (recipe.macros.netCarbs < 20) autoTags.push("DIABÉTICOS");
  }
  
  if (recipe.macros.netCarbs < 15) autoTags.push("KETO");
  if (recipe.macros.netCarbs < 50) autoTags.push("LOW CARB");
  if (recipe.macros.protein > 20) autoTags.push("ALTO EN PROTEÍNA");
  if (recipe.macros.kcal < 300) autoTags.push("BAJO EN CALORÍAS");
  if (recipe.macros.sugar === 0 && recipe.macros.netCarbs === 0) autoTags.push("ZERO");
  
  // Limpieza de duplicados y formato
  const uniqueTags = Array.from(new Set(autoTags.map(t => t.toUpperCase().replace(/[\[\]]/g, ''))));
  
  return {
    ...recipe,
    tags: uniqueTags
  };
};

export const getBookCategory = (recipes: Recipe[]) => {
  if (!recipes.length) return "VARIADO";
  const tags = recipes.flatMap(r => r.tags);
  if (tags.includes("DIABÉTICOS") || tags.includes("SIN AZÚCAR")) return "SIN AZÚCAR";
  if (tags.includes("KETO") || tags.includes("LOW CARB")) return "KETO / LOW CARB";
  if (tags.includes("ALTO EN PROTEÍNA")) return "FITNESS";
  return "GASTRONOMÍA";
};


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

/**
 * Lógica nutricional que asigna automáticamente tags basados en los valores
 */
export const enrichRecipeWithAutoTags = (recipe: Recipe): Recipe => {
  const autoTags = [...recipe.tags];
  
  if (recipe.macros.sugar < 1) autoTags.push("[SIN AZÚCAR]");
  if (recipe.macros.netCarbs < 10) autoTags.push("[KETO]");
  if (recipe.macros.protein > 20) autoTags.push("[ALTO EN PROTEÍNA]");
  if (recipe.macros.kcal < 300) autoTags.push("[BAJO EN CALORÍAS]");
  
  // Limpiar duplicados y normalizar
  const uniqueTags = Array.from(new Set(autoTags.map(t => t.toUpperCase())));
  
  return {
    ...recipe,
    tags: uniqueTags
  };
};

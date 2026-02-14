
import { RecipeBook } from "../types";

const FILE_NAME = "kawaii_recipe_studio_data.json";

export const getFileId = async (token: string): Promise<string | null> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
};

export const loadLibraryFromDrive = async (token: string): Promise<RecipeBook[]> => {
  const fileId = await getFileId(token);
  if (!fileId) return [];

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) return [];
  return await response.json();
};

export const saveLibraryToDrive = async (token: string, library: RecipeBook[]): Promise<void> => {
  const fileId = await getFileId(token);
  const metadata = {
    name: FILE_NAME,
    mimeType: 'application/json'
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', new Blob([JSON.stringify(library)], { type: 'application/json' }));

  if (fileId) {
    // Update - URL corregida
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  } else {
    // Create - URL corregida
    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  }
};

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

type ContentType = 'events' | 'places' | 'opportunities' | 'shops';

// Simule un service de stockage de fichiers
// Dans un environnement de production, utilisez un service comme AWS S3 ou Cloudinary
export async function uploadMedia(file: File, contentType: ContentType): Promise<string> {
  try {
    // Créer le dossier uploads et le sous-dossier correspondant au type de contenu
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
    const contentTypeDir = path.join(baseUploadDir, contentType);
    
    // Créer les dossiers s'ils n'existent pas
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }
    if (!existsSync(contentTypeDir)) {
      await mkdir(contentTypeDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;
    const filePath = path.join(contentTypeDir, filename);
    
    await writeFile(filePath, buffer);
    return `/uploads/${contentType}/${filename}`;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Failed to upload media');
  }
}
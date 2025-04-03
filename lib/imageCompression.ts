import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 0.1, // 100 KB
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg'
};

export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  try {
    return await Promise.all(files.map(file => compressImage(file)));
  } catch (error) {
    console.error('Error compressing images:', error);
    return files; // Return original files if compression fails
  }
}
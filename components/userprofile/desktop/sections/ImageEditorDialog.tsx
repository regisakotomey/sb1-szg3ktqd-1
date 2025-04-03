'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';

interface ImageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  imageFile: File | null;
  aspectRatio: number;
}

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageEditorDialog({
  isOpen,
  onClose,
  onSave,
  imageFile,
  aspectRatio,
}: ImageEditorDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0, width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile && isOpen) {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      
      img.onload = () => {
        imageRef.current = img;
        initializeCanvas();
      };

      img.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile, isOpen]);

  const initializeCanvas = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!img || !canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = window.devicePixelRatio;
    canvas.width = containerWidth * scale;
    canvas.height = containerHeight * scale;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Calculate crop area size based on aspect ratio
    const cropWidth = Math.min(containerWidth * 0.8, containerHeight * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (containerWidth - cropWidth) / 2;
    const cropY = (containerHeight - cropHeight) / 2;

    // Calculate initial image size to fit crop area
    const imgRatio = img.width / img.height;
    let imgWidth, imgHeight;

    if (imgRatio > aspectRatio) {
      imgHeight = cropHeight;
      imgWidth = imgHeight * imgRatio;
    } else {
      imgWidth = cropWidth;
      imgHeight = imgWidth / imgRatio;
    }

    const imgX = cropX + (cropWidth - imgWidth) / 2;
    const imgY = cropY + (cropHeight - imgHeight) / 2;

    setImagePosition({
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight
    });

    drawCanvas(imgX, imgY, imgWidth, imgHeight);
  };

  const drawCanvas = (imgX: number, imgY: number, imgWidth: number, imgHeight: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
  
    if (!canvas || !ctx || !img) return;
  
    const scale = window.devicePixelRatio;
    const containerWidth = canvas.width / scale;
    const containerHeight = canvas.height / scale;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
  
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerWidth, containerHeight);
  
    const cropWidth = Math.min(containerWidth * 0.8, containerHeight * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (containerWidth - cropWidth) / 2;
    const cropY = (containerHeight - cropHeight) / 2;
  
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
  
    ctx.save();
    ctx.translate(containerWidth / 2, containerHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-containerWidth / 2, -containerHeight / 2);
  
    ctx.drawImage(
      img,
      imgX,
      imgY,
      imgWidth * zoom,
      imgHeight * zoom
    );
  
    ctx.restore();
  
    if (!isSaving) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
  
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
  
      const thirdWidth = cropWidth / 3;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cropX + thirdWidth * i, cropY);
        ctx.lineTo(cropX + thirdWidth * i, cropY + cropHeight);
        ctx.stroke();
      }
  
      const thirdHeight = cropHeight / 3;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cropX, cropY + thirdHeight * i);
        ctx.lineTo(cropX + cropWidth, cropY + thirdHeight * i);
        ctx.stroke();
      }
    }
  
    ctx.restore();
  };

  const drawForExport = (targetCanvas: HTMLCanvasElement, outputWidth: number, outputHeight: number) => {
    if (!imageRef.current || !containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = containerWidth;
    offscreenCanvas.height = containerHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) return;
    
    const cropWidth = Math.min(containerWidth * 0.8, containerHeight * 0.8 * aspectRatio);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (containerWidth - cropWidth) / 2;
    const cropY = (containerHeight - cropHeight) / 2;
    
    offscreenCtx.clearRect(0, 0, containerWidth, containerHeight);
    
    offscreenCtx.save();
    offscreenCtx.translate(containerWidth / 2, containerHeight / 2);
    offscreenCtx.rotate((rotation * Math.PI) / 180);
    offscreenCtx.translate(-containerWidth / 2, -containerHeight / 2);
    
    offscreenCtx.drawImage(
      imageRef.current,
      imagePosition.x,
      imagePosition.y,
      imagePosition.width * zoom,
      imagePosition.height * zoom
    );
    offscreenCtx.restore();
    
    const exportCtx = targetCanvas.getContext('2d');
    if (!exportCtx) return;
    
    exportCtx.clearRect(0, 0, outputWidth, outputHeight);
    exportCtx.drawImage(
      offscreenCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - imagePosition.x,
      y: e.clientY - rect.top - imagePosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    setImagePosition(prev => ({
      ...prev,
      x,
      y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(3, prev + delta));
      return newZoom;
    });

    setImagePosition(prev => {
      const scale = 1 + delta;
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;
      const newWidth = prev.width * scale;
      const newHeight = prev.height * scale;
      return {
        x: centerX - newWidth / 2,
        y: centerY - newHeight / 2,
        width: newWidth,
        height: newHeight
      };
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const tempCanvas = document.createElement('canvas');
      
      // Set output dimensions based on aspect ratio
      const outputWidth = aspectRatio === 851/315 ? 851 : 500;
      const outputHeight = aspectRatio === 851/315 ? 315 : 500;
      
      tempCanvas.width = outputWidth;
      tempCanvas.height = outputHeight;
      
      drawForExport(tempCanvas, outputWidth, outputHeight);
      
      const blob = await new Promise<Blob>((resolve) => {
        tempCanvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });
      
      const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
      const compressedFile = await compressImage(file);
      await onSave(compressedFile);
      onClose();
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (imagePosition.width > 0) {
      drawCanvas(
        imagePosition.x,
        imagePosition.y,
        imagePosition.width,
        imagePosition.height
      );
    }
  }, [zoom, rotation, imagePosition]);

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Modifier l'image</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-hidden">
          <div 
            ref={containerRef}
            className="relative bg-gray-900 rounded-xl mx-auto overflow-hidden"
            style={{ 
              width: '100%',
              height: '60vh'
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
            <Move size={16} />
            <span>Cliquez et faites glisser pour déplacer l'image</span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-2 hover:bg-white rounded-md transition-colors text-gray-700"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-2 hover:bg-white rounded-md transition-colors text-gray-700"
                  disabled={zoom >= 3}
                >
                  <ZoomIn size={20} />
                </button>
              </div>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <RotateCw size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300 min-w-[120px]"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={20} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
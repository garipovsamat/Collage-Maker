import React, { useRef, useState, useCallback } from 'react';
import { CollageElement } from '../../types';
import { Element } from '../Element/Element';
import styles from './Canvas.module.css';

interface CanvasProps {
  elements: CollageElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CollageElement>) => void;
  onDelete: (id: string) => void;
  onAddImage: (src: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onAddImage,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          onAddImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onAddImage]);

  return (
    <div className={styles.canvasWrapper}>
      <div
        ref={canvasRef}
        className={styles.canvas}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {elements.map((el) => (
          <Element
            key={el.id}
            element={el}
            isActive={selectedId === el.id}
            onSelect={() => onSelect(el.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {elements.length === 0 && (
          <div className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}>
            <div className={styles.dropZoneIcon}>🖼️</div>
            <div className={styles.dropZoneText}>Перетащите картинку сюда</div>
            <div className={styles.dropZoneSub}>или используйте кнопку «Загрузить»</div>
          </div>
        )}
      </div>
    </div>
  );
};
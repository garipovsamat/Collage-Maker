import React, { useRef, useState, useCallback } from 'react';
import { CollageElement } from '../../types';
import { Element } from '../Element/Element';
import styles from './Canvas.module.css';

interface CanvasProps {
  elements: CollageElement[];
  selectedIds: string[];
  onSelect: (id: string, e?: React.MouseEvent) => void;
  onCanvasClick: () => void;
  onUpdate: (id: string, updates: Partial<CollageElement>) => void;
  onDelete: () => void;
  onAddImage: (src: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedIds,
  onSelect,
  onCanvasClick,
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

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCanvasClick();
    }
  }, [onCanvasClick]);

  return (
    <div className={styles.canvasWrapper}>
      <div
        ref={canvasRef}
        className={styles.canvas}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseDown={handleCanvasMouseDown}
      >
        {elements.map((el) => (
          <Element
            key={el.id}
            element={el}
            isActive={selectedIds.includes(el.id)}
            onSelect={(e) => onSelect(el.id, e)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {elements.length === 0 && (
          <div className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}>
            <div className={styles.dropZoneIcon}>📷</div>
            <div className={styles.dropZoneText}>Перетащите картинку сюда</div>
            <div className={styles.dropZoneSub}>или используйте кнопку «Загрузить»</div>
          </div>
        )}
      </div>
    </div>
  );
};
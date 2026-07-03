import React, { useRef, useState, useCallback } from 'react';
import { CollageElement } from '../../types';
import styles from './Element.module.css';

interface ElementProps {
  element: CollageElement;
  isActive: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onUpdate: (id: string, updates: Partial<CollageElement>) => void;
  onDelete: () => void;
}

export const Element: React.FC<ElementProps> = ({
  element,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(() => {
    const match = element.content.match(/<style>.*?<\/style>(.*)/);
    return match ? match[1] : element.content;
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // === DRAG ===
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: element.x, y: element.y });
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest(`.${styles.resizeHandle}`)) return;
    if (e.target instanceof HTMLElement && e.target.closest(`.${styles.rotateHandle}`)) return;
    if (e.target instanceof HTMLElement && e.target.closest(`.${styles.deleteBtn}`)) return;

    e.stopPropagation();
    onSelect(e);
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, [onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !elementRef.current) return;
    const parentRect = elementRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    const newX = e.clientX - parentRect.left - dragOffset.current.x;
    const newY = e.clientY - parentRect.top - dragOffset.current.y;
    setDragPos({ x: newX, y: newY });
    onUpdate(element.id, { x: newX, y: newY });
  }, [isDragging, element.id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // === RESIZE ===
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    };
  }, [element.width, element.height]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    const newWidth = Math.max(30, resizeStart.current.width + dx);
    const newHeight = Math.max(30, resizeStart.current.height + dy);
    onUpdate(element.id, {
      width: newWidth,
      height: newHeight,
    });
  }, [isResizing, element.id, onUpdate]);

  const handleResizeUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeUp);
    } else {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    };
  }, [isResizing, handleResizeMove, handleResizeUp]);

  // === ROTATE ===
  const [isRotating, setIsRotating] = useState(false);
  const rotateStart = useRef({ x: 0, y: 0, rotation: 0 });

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      rotateStart.current = {
        x: e.clientX,
        y: e.clientY,
        rotation: element.rotation,
      };
    }
  }, [element.rotation]);

  const handleRotateMove = useCallback((e: MouseEvent) => {
    if (!isRotating || !elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    onUpdate(element.id, { rotation: Math.round(angle) });
  }, [isRotating, element.id, onUpdate]);

  const handleRotateUp = useCallback(() => {
    setIsRotating(false);
  }, []);

  React.useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateUp);
    } else {
      window.removeEventListener('mousemove', handleRotateMove);
      window.removeEventListener('mouseup', handleRotateUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleRotateMove);
      window.removeEventListener('mouseup', handleRotateUp);
    };
  }, [isRotating, handleRotateMove, handleRotateUp]);

  // === TEXT EDIT ===
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text') {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (textValue.trim()) {
      onUpdate(element.id, { content: textValue.trim() });
    } else {
      onDelete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      const match = element.content.match(/<style>.*?<\/style>(.*)/);
      setTextValue(match ? match[1] : element.content);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  // === RENDER ===
  const style = {
    left: dragPos.x,
    top: dragPos.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
  };

  // Парсим стили текста
  const parseTextStyles = () => {
    const match = element.content.match(/<style>(.*?)<\/style>(.*)/);
    if (match) {
      const styleStr = match[1];
      const textContent = match[2];
      const styles: React.CSSProperties = {
        fontSize: Math.max(14, element.width / 8) + 'px',
        width: element.width,
        minHeight: element.height,
      };
      if (styleStr.includes('bold')) styles.fontWeight = 'bold';
      if (styleStr.includes('italic')) styles.fontStyle = 'italic';
      const colorMatch = styleStr.match(/color:([^;]+)/);
      if (colorMatch) styles.color = colorMatch[1];
      return { styles, text: textContent };
    }
    return {
      styles: {
        fontSize: Math.max(14, element.width / 8) + 'px',
        width: element.width,
        minHeight: element.height,
      },
      text: element.content,
    };
  };

  const { styles: textStyles, text: displayText } = parseTextStyles();

  return (
    <div
      ref={elementRef}
      className={`${styles.element} ${isActive ? styles.active : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {element.type === 'image' && element.src && (
        <img
          src={element.src}
          alt="collage element"
          className={styles.image}
          style={{ width: '100%', height: '100%' }}
          draggable={false}
        />
      )}

      {element.type === 'text' && (
        isEditing ? (
          <textarea
            ref={inputRef}
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            className={styles.text}
            style={{
              width: element.width,
              minHeight: element.height,
              background: 'white',
              border: '2px solid #007bff',
              padding: '4px 8px',
              fontSize: Math.max(14, element.width / 8) + 'px',
              fontFamily: 'Arial, sans-serif',
              resize: 'both',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className={styles.text} style={textStyles}>
            {displayText}
          </div>
        )
      )}

      {/* === RESIZE === */}
      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeStart}
        title="Изменить размер"
      />

      {/* === ROTATE === */}
      <div
        className={styles.rotateHandle}
        onMouseDown={handleRotateStart}
        title="Повернуть"
      />

      {/* === DELETE === */}
      <div className={styles.deleteBtn} onClick={handleDeleteClick}>
        ×
      </div>
    </div>
  );
};
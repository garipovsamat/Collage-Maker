import React, { useRef, useState } from 'react';
import { CollageElement } from '../../types';
import { useDrag } from '../../hooks/useDrag';
import styles from './Element.module.css';

interface ElementProps {
  element: CollageElement;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<CollageElement>) => void;
  onDelete: (id: string) => void;
}

export const Element: React.FC<ElementProps> = ({
  element,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(element.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { position, handleMouseDown } = useDrag(
    { x: element.x, y: element.y },
    (pos: { x: number; y: number }) => {
      onUpdate(element.id, { x: pos.x, y: pos.y });
    }
  );

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
      onDelete(element.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextValue(element.content);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  const style = {
    left: position.x,
    top: position.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
  };

  return (
    <div
      className={`${styles.element} ${isActive ? styles.active : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
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
          <div 
            className={styles.text} 
            style={{ 
              fontSize: Math.max(14, element.width / 8) + 'px',
              width: element.width,
              minHeight: element.height,
            }}
          >
            {element.content}
          </div>
        )
      )}

      <div className={styles.deleteBtn} onClick={handleDeleteClick}>
        ×
      </div>
      <div className={styles.resizeHandle} />
    </div>
  );
};
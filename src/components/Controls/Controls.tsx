import React, { useState, useEffect } from 'react';
import { CollageElement } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import styles from './Controls.module.css';

interface ControlsProps {
  selectedElements: CollageElement[];
  onUpdateSelected: (updates: Partial<CollageElement>) => void;
  onDeleteSelected: () => void;
  onUpdateElement: (id: string, updates: Partial<CollageElement>) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedElements,
  onUpdateSelected,
  onDeleteSelected,
  onUpdateElement,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const textElements = selectedElements.filter((el) => el.type === 'text');
  const isTextSelected = textElements.length > 0;
  const firstSelected = selectedElements[0] || null;
  const isMultiSelect = selectedElements.length > 1;

  // При выборе ОДНОГО текстового элемента — парсим его стили
  useEffect(() => {
    if (selectedElements.length !== 1) {
      setTextValue('');
      return;
    }

    const el = selectedElements[0];
    if (el.type !== 'text') {
      setTextValue('');
      return;
    }

    const match = el.content.match(/<style>(.*?)<\/style>(.*)/);
    if (match) {
      const styleStr = match[1];
      const textContent = match[2];
      setTextValue(textContent);
      
      const colorMatch = styleStr.match(/color:([^;]+)/);
      if (colorMatch) setTextColor(colorMatch[1]);
      else setTextColor('#000000');
      
      setIsBold(styleStr.includes('bold'));
      setIsItalic(styleStr.includes('italic'));
    } else {
      setTextValue(el.content);
      setTextColor('#000000');
      setIsBold(false);
      setIsItalic(false);
    }
  }, [selectedElements]);

  if (!firstSelected) {
    return (
      <div className={styles.controls}>
        <span className={styles.info}>Выберите элемент для управления</span>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    );
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onUpdateSelected({ width: newSize, height: newSize });
  };

  // === ПЕРЕДНИЙ ПЛАН ===
  const handleBringForward = () => {
    const sorted = [...selectedElements].sort((a, b) => b.zIndex - a.zIndex);
    sorted.forEach((el) => {
      onUpdateElement(el.id, { zIndex: el.zIndex + 1 });
    });
  };

  // === ЗАДНИЙ ПЛАН ===
  const handleSendBackward = () => {
    const sorted = [...selectedElements].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((el) => {
      if (el.zIndex > 0) {
        onUpdateElement(el.id, { zIndex: el.zIndex - 1 });
      }
    });
  };

  // === ПРИМЕНЕНИЕ СТИЛЕЙ ТЕКСТА ===
  const applyTextStyles = () => {
    const textElementsOnly = selectedElements.filter((el) => el.type === 'text');
    if (textElementsOnly.length === 0) return;
    
    textElementsOnly.forEach((el) => {
      const fontSize = Math.max(14, el.width / 8);
      let style = '';
      if (isBold) style += 'bold;';
      if (isItalic) style += 'italic;';
      style += `color:${textColor};`;
      style += `size:${fontSize};`;
      const currentMatch = el.content.match(/<style>.*?<\/style>(.*)/);
      const currentText = currentMatch ? currentMatch[1] : el.content;
      const newContent = `<style>${style}</style>${currentText}`;
      onUpdateElement(el.id, { content: newContent });
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  const handleTextBlur = () => {
    if (textValue.trim() && isTextSelected) {
      applyTextStyles();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    }
  };

  // === ЖИРНЫЙ ===
  const handleToggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    
    const textElementsOnly = selectedElements.filter((el) => el.type === 'text');
    if (textElementsOnly.length === 0) return;
    
    textElementsOnly.forEach((el) => {
      const fontSize = Math.max(14, el.width / 8);
      let style = '';
      if (newBold) style += 'bold;';
      if (isItalic) style += 'italic;';
      style += `color:${textColor};`;
      style += `size:${fontSize};`;
      const currentMatch = el.content.match(/<style>.*?<\/style>(.*)/);
      const currentText = currentMatch ? currentMatch[1] : el.content;
      const newContent = `<style>${style}</style>${currentText}`;
      onUpdateElement(el.id, { content: newContent });
    });
  };

  // === КУРСИВ ===
  const handleToggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    
    const textElementsOnly = selectedElements.filter((el) => el.type === 'text');
    if (textElementsOnly.length === 0) return;
    
    textElementsOnly.forEach((el) => {
      const fontSize = Math.max(14, el.width / 8);
      let style = '';
      if (isBold) style += 'bold;';
      if (newItalic) style += 'italic;';
      style += `color:${textColor};`;
      style += `size:${fontSize};`;
      const currentMatch = el.content.match(/<style>.*?<\/style>(.*)/);
      const currentText = currentMatch ? currentMatch[1] : el.content;
      const newContent = `<style>${style}</style>${currentText}`;
      onUpdateElement(el.id, { content: newContent });
    });
  };

  // === ЦВЕТ — ИСПРАВЛЕН ===
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    
    const textElementsOnly = selectedElements.filter((el) => el.type === 'text');
    if (textElementsOnly.length === 0) return;
    
    textElementsOnly.forEach((el) => {
      const fontSize = Math.max(14, el.width / 8);
      let style = '';
      if (isBold) style += 'bold;';
      if (isItalic) style += 'italic;';
      style += `color:${newColor};`;
      style += `size:${fontSize};`;
      const currentMatch = el.content.match(/<style>.*?<\/style>(.*)/);
      const currentText = currentMatch ? currentMatch[1] : el.content;
      const newContent = `<style>${style}</style>${currentText}`;
      onUpdateElement(el.id, { content: newContent });
    });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.controlsRow}>
        <div className={styles.controlsGroup}>
          <span className={styles.label}>Размер:</span>
          <input
            type="range"
            min="30"
            max="600"
            value={firstSelected.width}
            onChange={handleSizeChange}
            className={styles.slider}
          />
          <span className={styles.badge}>{firstSelected.width}px</span>
          {isMultiSelect && <span className={styles.badge}>×{selectedElements.length}</span>}
        </div>

        <div className={styles.controlsGroup}>
          <button className={styles.btn} onClick={handleBringForward}>
            На передний план
          </button>
          <button className={styles.btn} onClick={handleSendBackward}>
            На задний план
          </button>
          <button className={styles.themeBtn} onClick={toggleTheme} title="Сменить тему">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className={styles.controlsGroup}>
          <button
            className={`${styles.btn} ${styles.danger}`}
            onClick={onDeleteSelected}
          >
            Удалить {isMultiSelect ? `(${selectedElements.length})` : ''}
          </button>
        </div>
      </div>

      {/* === РЕДАКТОР ТЕКСТА === */}
      {isTextSelected && (
        <div className={styles.textEditor}>
          <div className={styles.textEditorRow}>
            <textarea
              className={styles.textInput}
              value={textValue}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              placeholder={isMultiSelect && textElements.length > 1 ? `Изменить текст для ${textElements.length} элементов...` : "Введите текст..."}
              rows={1}
            />
          </div>

          <div className={styles.textEditorRow}>
            <label className={styles.label}>Цвет:</label>
            <input
              type="color"
              value={textColor}
              onChange={handleColorChange}
              className={styles.colorPicker}
            />

            <button
              className={`${styles.styleBtn} ${isBold ? styles.active : ''}`}
              onClick={handleToggleBold}
              title="Жирный"
            >
              <b>B</b>
            </button>
            <button
              className={`${styles.styleBtn} ${isItalic ? styles.active : ''}`}
              onClick={handleToggleItalic}
              title="Курсив"
            >
              <i>I</i>
            </button>

            <span className={styles.badge}>
              {isMultiSelect && textElements.length > 1 
                ? `×${textElements.length} текстовых`
                : textElements.length === 1 ? '1 текст' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
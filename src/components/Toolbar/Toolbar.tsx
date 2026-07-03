import React, { useRef } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  elementCount: number;
  onAddImage: (src: string) => void;
  onAddText: () => void;
  onExport: () => void;
  onClear: () => void;
  hasElements: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  elementCount,
  onAddImage,
  onAddText,
  onExport,
  onClear,
  hasElements,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAddImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button
          className={styles.btn}
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <button className={styles.btn} onClick={onAddText}>
          Добавить текст
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.btn} ${styles.success}`}
          onClick={onExport}
          disabled={!hasElements}
        >
          Сохранить PNG
        </button>
        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={onClear}
          disabled={!hasElements}
        >
          Очистить всё
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <span className={styles.badge}>Элементов: {elementCount}</span>
      </div>
    </div>
  );
};
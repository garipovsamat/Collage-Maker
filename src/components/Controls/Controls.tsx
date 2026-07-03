import React from 'react';
import { CollageElement } from '../../types';
import styles from './Controls.module.css';

interface ControlsProps {
  selectedElement: CollageElement | null;
  onUpdate: (id: string, updates: Partial<CollageElement>) => void;
  onDelete: (id: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedElement,
  onUpdate,
  onDelete,
}) => {
  if (!selectedElement) {
    return (
      <div className={styles.controls}>
        <span className={styles.info}>Выберите элемент для управления</span>
      </div>
    );
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onUpdate(selectedElement.id, {
      width: newSize,
      height: newSize,
    });
  };

  const handleBringForward = () => {
    onUpdate(selectedElement.id, {
      zIndex: selectedElement.zIndex + 1,
    });
  };

  const handleSendBackward = () => {
    onUpdate(selectedElement.id, {
      zIndex: Math.max(0, selectedElement.zIndex - 1),
    });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.controlsGroup}>
        <span className={styles.label}>Размер:</span>
        <input
          type="range"
          min="30"
          max="600"
          value={selectedElement.width}
          onChange={handleSizeChange}
          className={styles.slider}
        />
        <span className={styles.badge}>{selectedElement.width}px</span>
      </div>

      <div className={styles.controlsGroup}>
        <button className={styles.btn} onClick={handleBringForward}>
          На передний план
        </button>
        <button className={styles.btn} onClick={handleSendBackward}>
          На задний план
        </button>
      </div>

      <div className={styles.controlsGroup}>
        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={() => onDelete(selectedElement.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};
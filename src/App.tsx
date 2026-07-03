import { useState, useCallback, useRef } from 'react';
import { CollageElement } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportToPNG } from './utils/exportCanvas';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Controls } from './components/Controls/Controls';
import styles from './App.module.css';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_SIZE = 180;

function App() {
  const [elements, setElements] = useLocalStorage<CollageElement[]>('collage-elements', []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const selectedElement = elements.find((el: CollageElement) => el.id === selectedId) || null;

  const handleAddImage = useCallback((src: string) => {
    const newElement: CollageElement = {
      id: generateId(),
      type: 'image',
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
      rotation: 0,
      zIndex: elements.length,
      content: 'image',
      src,
    };
    setElements((prev: CollageElement[]) => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [elements.length, setElements]);

  const handleAddText = useCallback(() => {
    const newElement: CollageElement = {
      id: generateId(),
      type: 'text',
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: 200,
      height: 60,
      rotation: 0,
      zIndex: elements.length,
      content: 'Двойной клик для редактирования',
    };
    setElements((prev: CollageElement[]) => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [elements.length, setElements]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<CollageElement>) => {
    setElements((prev: CollageElement[]) =>
      prev.map((el: CollageElement) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, [setElements]);

  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev: CollageElement[]) => prev.filter((el: CollageElement) => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId, setElements]);

  const handleClearAll = useCallback(() => {
    if (elements.length === 0) return;
    setModal({
      isOpen: true,
      message: 'Вы уверены, что хотите удалить все элементы?',
      onConfirm: () => {
        setElements([]);
        setSelectedId(null);
        setModal({ isOpen: false, message: '', onConfirm: () => {} });
      },
    });
  }, [elements.length, setElements]);

  const handleExport = useCallback(() => {
    if (elements.length === 0) return;
    exportToPNG(elements, canvasRef);
  }, [elements]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    setModal({
      isOpen: true,
      message: 'Вы уверены, что хотите удалить выбранный элемент?',
      onConfirm: () => {
        handleDeleteElement(selectedId);
        setModal({ isOpen: false, message: '', onConfirm: () => {} });
      },
    });
  }, [selectedId, handleDeleteElement]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Collage Maker</h1>
      </header>

      <main className={styles.main}>
        <Toolbar
          elementCount={elements.length}
          onAddImage={handleAddImage}
          onAddText={handleAddText}
          onExport={handleExport}
          onClear={handleClearAll}
          hasElements={elements.length > 0}
        />

        <Controls
          selectedElement={selectedElement}
          onUpdate={handleUpdateElement}
          onDelete={handleDeleteSelected}
        />

        <div className={styles.canvasArea}>
          <Canvas
            elements={elements}
            selectedId={selectedId}
            onSelect={handleSelect}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
            onAddImage={handleAddImage}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Элементов: {elements.length}</span>
        <span>Клик для выделения · Двойной клик по тексту для редактирования</span>
      </footer>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* МОДАЛЬНОЕ ОКНО */}
      {modal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setModal({ isOpen: false, message: '', onConfirm: () => {} })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalMessage}>{modal.message}</p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => setModal({ isOpen: false, message: '', onConfirm: () => {} })}
              >
                Отмена
              </button>
              <button
                className={styles.modalConfirm}
                onClick={modal.onConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
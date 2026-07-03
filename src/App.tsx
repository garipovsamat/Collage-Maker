import { useState, useCallback, useRef, useEffect } from 'react';
import { CollageElement } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportToPNG } from './utils/exportCanvas';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Controls } from './components/Controls/Controls';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import styles from './App.module.css';

const generateId = () => Math.random().toString(36).substr(2, 9);
const DEFAULT_SIZE = 180;

function AppContent() {
  const { theme } = useTheme();
  const [elements, setElements] = useLocalStorage<CollageElement[]>('collage-elements', []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });

  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    message: string; 
    onConfirm?: () => void;
    onCancel?: () => void;
    type?: 'confirm' | 'export';
  }>({
    isOpen: false,
    message: '',
  });

  // Определяем размер окна редактирования
  useEffect(() => {
    const updateSize = () => {
      if (canvasAreaRef.current) {
        const rect = canvasAreaRef.current.getBoundingClientRect();
        setViewportSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

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
    setSelectedIds([newElement.id]);
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
    setSelectedIds([newElement.id]);
  }, [elements.length, setElements]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<CollageElement>) => {
    setElements((prev: CollageElement[]) =>
      prev.map((el: CollageElement) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, [setElements]);

  // === МУЛЬТИ-АПДЕЙТ ===
  const handleUpdateSelected = useCallback((updates: Partial<CollageElement>) => {
    setElements((prev: CollageElement[]) =>
      prev.map((el: CollageElement) => 
        selectedIds.includes(el.id) ? { ...el, ...updates } : el
      )
    );
  }, [selectedIds, setElements]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setModal({
      isOpen: true,
      type: 'confirm',
      message: `Вы уверены, что хотите удалить ${selectedIds.length} элемент(ов)?`,
      onConfirm: () => {
        setElements((prev: CollageElement[]) => 
          prev.filter((el: CollageElement) => !selectedIds.includes(el.id))
        );
        setSelectedIds([]);
        setModal({ isOpen: false, message: '' });
      },
      onCancel: () => setModal({ isOpen: false, message: '' }),
    });
  }, [selectedIds, setElements]);

  const handleClearAll = useCallback(() => {
    if (elements.length === 0) return;
    setModal({
      isOpen: true,
      type: 'confirm',
      message: 'Вы уверены, что хотите удалить все элементы?',
      onConfirm: () => {
        setElements([]);
        setSelectedIds([]);
        setModal({ isOpen: false, message: '' });
      },
      onCancel: () => setModal({ isOpen: false, message: '' }),
    });
  }, [elements.length, setElements]);

  const handleExportRequest = useCallback(() => {
    if (elements.length === 0) return;
    setModal({
      isOpen: true,
      type: 'export',
      message: 'Сохранить с белым фоном или прозрачным?',
      onConfirm: () => {
        exportToPNG(elements, canvasRef, false, viewportSize.width, viewportSize.height);
        setModal({ isOpen: false, message: '' });
      },
      onCancel: () => {
        exportToPNG(elements, canvasRef, true, viewportSize.width, viewportSize.height);
        setModal({ isOpen: false, message: '' });
      },
    });
  }, [elements, viewportSize]);

  // === ВЫДЕЛЕНИЕ С CTRL ===
  const handleSelect = useCallback((id: string, e?: React.MouseEvent) => {
    const isCtrl = e?.ctrlKey || e?.metaKey;
    const isShift = e?.shiftKey;
    
    if (isCtrl) {
      // Ctrl + клик — добавляем/убираем из выделения
      setSelectedIds((prev) => 
        prev.includes(id) 
          ? prev.filter((i) => i !== id) 
          : [...prev, id]
      );
    } else if (isShift && selectedIds.length > 0) {
      // Shift + клик — выделяем все между последним и текущим
      const allIds = elements.map((el) => el.id);
      const lastSelected = selectedIds[selectedIds.length - 1];
      const lastIdx = allIds.indexOf(lastSelected);
      const currentIdx = allIds.indexOf(id);
      const start = Math.min(lastIdx, currentIdx);
      const end = Math.max(lastIdx, currentIdx);
      const newSelected = allIds.slice(start, end + 1);
      setSelectedIds(newSelected);
    } else {
      // Обычный клик — выделяем только один
      setSelectedIds([id]);
    }
  }, [selectedIds, elements]);

  // Клик по пустому месту — снимаем выделение
  const handleCanvasClick = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return (
    <div className={`${styles.app} ${styles[theme]}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Collage Maker</h1>
      </header>

      <main className={styles.main}>
        <Toolbar
          elementCount={elements.length}
          onAddImage={handleAddImage}
          onAddText={handleAddText}
          onExport={handleExportRequest}
          onClear={handleClearAll}
          hasElements={elements.length > 0}
        />

        <Controls
          selectedElements={selectedElements}
          onUpdateSelected={handleUpdateSelected}
          onDeleteSelected={handleDeleteSelected}
          onUpdateElement={handleUpdateElement}
        />

        <div className={styles.canvasArea} ref={canvasAreaRef}>
          <Canvas
            elements={elements}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onCanvasClick={handleCanvasClick}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteSelected}
            onAddImage={handleAddImage}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Элементов: {elements.length} | Выделено: {selectedIds.length}</span>
        <span>Ctrl+клик — мультивыделение · Клик на пустое место — снять выделение</span>
      </footer>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {modal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setModal({ isOpen: false, message: '' })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalMessage}>{modal.message}</p>
            <div className={styles.modalActions}>
              {modal.type === 'export' ? (
                <>
                  <button
                    className={styles.modalCancel}
                    onClick={modal.onCancel}
                  >
                    Прозрачный
                  </button>
                  <button
                    className={styles.modalConfirm}
                    onClick={modal.onConfirm}
                  >
                    Белый фон
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.modalCancel}
                    onClick={modal.onCancel}
                  >
                    Отмена
                  </button>
                  <button
                    className={styles.modalConfirm}
                    onClick={modal.onConfirm}
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
export type ElementType = 'image' | 'text';

export interface CollageElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content: string;
  src?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Tool = 'select' | 'text' | 'image';
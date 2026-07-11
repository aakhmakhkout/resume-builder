import { useCallback, useRef, useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function useReorderableEntries(section) {
  const { reorderEntries, moveEntry } = useResume();
  const dragIdxRef = useRef(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  const clearDragState = useCallback(() => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
    setDraggingIdx(null);
  }, []);

  const handleDragStart = useCallback((event, index) => {
    dragIdxRef.current = index;
    setDraggingIdx(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((event, index) => {
    const from = dragIdxRef.current;
    if (from === null || from === index) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverIdx((prev) => (prev === index ? prev : index));
  }, []);

  const handleDrop = useCallback((event, index) => {
    event.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === index) return;
    reorderEntries(section, from, index);
    clearDragState();
  }, [clearDragState, reorderEntries, section]);

  const moveUp = useCallback((index) => {
    moveEntry(section, index, 'up');
  }, [moveEntry, section]);

  const moveDown = useCallback((index) => {
    moveEntry(section, index, 'down');
  }, [moveEntry, section]);

  return {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd: clearDragState,
    moveUp,
    moveDown,
  };
}

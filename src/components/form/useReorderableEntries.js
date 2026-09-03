import { useCallback, useRef, useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function useReorderableEntries(sectionOrOptions) {
  const { reorderEntries, moveEntry } = useResume();
  const section = typeof sectionOrOptions === 'string' ? sectionOrOptions : null;
  const onReorder = typeof sectionOrOptions === 'object' ? sectionOrOptions.onReorder : null;
  const onMove = typeof sectionOrOptions === 'object' ? sectionOrOptions.onMove : null;
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
    if (onReorder) onReorder(from, index);
    if (section) reorderEntries(section, from, index);
    clearDragState();
  }, [clearDragState, onReorder, reorderEntries, section]);

  const moveUp = useCallback((index) => {
    if (onMove) onMove(index, 'up');
    if (section) moveEntry(section, index, 'up');
  }, [moveEntry, onMove, section]);

  const moveDown = useCallback((index) => {
    if (onMove) onMove(index, 'down');
    if (section) moveEntry(section, index, 'down');
  }, [moveEntry, onMove, section]);

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

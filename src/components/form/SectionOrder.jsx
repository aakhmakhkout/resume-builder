import { useRef, useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { moveItemInArray } from '../../utils/reorder';
import { resolveSectionLabel } from '../../utils/sections';

export default function SectionOrder() {
  const { resume, reorderSections } = useResume();
  const { sectionOrder, customSections } = resume;
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragIdxRef = useRef(null);

  const handleDragStart = (index) => {
    dragIdxRef.current = index;
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === index) return;
    const updated = [...sectionOrder];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    reorderSections(updated);
    dragIdxRef.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
  };

  const moveSection = (index, direction) => {
    const to = direction === 'up' ? index - 1 : index + 1;
    const updated = moveItemInArray(sectionOrder, index, to);
    if (updated !== sectionOrder) {
      reorderSections(updated);
    }
  };

  return (
    <div className="form-section section-order">
      <div className="section-header">
        <h2 className="section-title">Section Order</h2>
        <span className="section-order-hint">Drag to reorder</span>
      </div>
      <div className="section-order-list">
        {sectionOrder.map((sectionKey, index) => (
          <div
            key={sectionKey}
            className={`section-order-item${dragOverIdx === index ? ' section-order-item--drop-target' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={(event) => handleDrop(event, index)}
            onDragEnd={handleDragEnd}
          >
            <span
              className="section-order-handle"
              title="Drag to reorder"
              role="img"
              aria-label="Drag handle"
            >
              ⋮⋮
            </span>
            <span>{resolveSectionLabel(sectionKey, customSections)}</span>
            <div className="entry-reorder-controls section-order-controls">
              <button type="button" className="btn-move" onClick={() => moveSection(index, 'up')} disabled={index === 0}>↑</button>
              <button type="button" className="btn-move" onClick={() => moveSection(index, 'down')} disabled={index >= sectionOrder.length - 1}>↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

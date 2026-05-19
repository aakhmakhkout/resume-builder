import { useState, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function Skills() {
  const { resume, addSkill, removeSkill, reorderSkills } = useResume();
  const [input, setInput] = useState('');
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const dragIdxRef = useRef(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      addSkill(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDragStart = (e, i) => {
    dragIdxRef.current = i;
    setDraggingIdx(i);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(i);
  };

  const handleDrop = (e, i) => {
    e.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === i) return;
    const updated = [...resume.skills];
    const [moved] = updated.splice(from, 1);
    updated.splice(i, 0, moved);
    reorderSkills(updated);
    dragIdxRef.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
    setDraggingIdx(null);
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Skills</h2>
      <div className="skills-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill (press Enter or comma)"
        />
        <button className="btn-add" onClick={handleAdd}>Add</button>
      </div>
      {resume.skills.length > 0 && (
        <p className="skills-drag-hint">Drag tags to reorder</p>
      )}
      <div className="skills-tags">
        {resume.skills.map((skill, i) => (
          <span
            className={`skill-tag${dragOverIdx === i && draggingIdx !== i ? ' skill-tag--drop-target' : ''}`}
            key={`${skill}-${i}`}
            draggable
            onDragStart={e => handleDragStart(e, i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={e => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
          >
            <span className="skill-drag-handle" title="Drag to reorder">⠿</span>
            {skill}
            <button onClick={() => removeSkill(skill)} title="Remove">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

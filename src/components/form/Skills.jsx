import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import useReorderableEntries from './useReorderableEntries';

export default function Skills() {
  const { resume, addSkill, removeSkill, moveEntry } = useResume();
  const [input, setInput] = useState('');
  const {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useReorderableEntries('skills');

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
        <p className="skills-drag-hint">Drag, or use ↑/↓ to reorder</p>
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
            <button
              type="button"
              className="skill-move-btn"
              onClick={() => moveEntry('skills', i, 'up')}
              disabled={i === 0}
              title="Move up"
              aria-label="Move skill up"
            >
              ↑
            </button>
            <button
              type="button"
              className="skill-move-btn"
              onClick={() => moveEntry('skills', i, 'down')}
              disabled={i >= resume.skills.length - 1}
              title="Move down"
              aria-label="Move skill down"
            >
              ↓
            </button>
            <button onClick={() => removeSkill(skill)} title="Remove">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

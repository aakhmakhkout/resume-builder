import { useState, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function Skills() {
  const {
    resume,
    addSkillGroup,
    removeSkillGroup,
    updateSkillGroupCategory,
    addSkillToGroup,
    removeSkillFromGroup,
    reorderSkillsInGroup,
    reorderSkillGroups,
  } = useResume();

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [skillInputs, setSkillInputs] = useState({});
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const dragIdxRef = useRef(null);
  const [dragOverSkillIdx, setDragOverSkillIdx] = useState({});
  const [draggingSkillIdx, setDraggingSkillIdx] = useState({});
  const dragSkillIdxRef = useRef({});

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      addSkillGroup(trimmed);
      setNewCategoryInput('');
    }
  };

  const handleAddSkill = (groupIndex) => {
    const input = skillInputs[groupIndex] || '';
    const trimmed = input.trim();
    if (trimmed) {
      addSkillToGroup(groupIndex, trimmed);
      setSkillInputs(prev => ({ ...prev, [groupIndex]: '' }));
    }
  };

  const handleCategoryDragStart = (e, i) => {
    dragIdxRef.current = i;
    setDraggingIdx(i);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e, i) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(i);
  };

  const handleCategoryDrop = (e, i) => {
    e.preventDefault();
    const from = dragIdxRef.current;
    if (from === null || from === i) return;
    const updated = [...resume.skillGroups];
    const [moved] = updated.splice(from, 1);
    updated.splice(i, 0, moved);
    reorderSkillGroups(updated);
    dragIdxRef.current = null;
    setDragOverIdx(null);
  };

  const handleCategoryDragEnd = () => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
    setDraggingIdx(null);
  };

  const handleSkillDragStart = (e, groupIndex, skillIndex) => {
    dragSkillIdxRef.current = { groupIndex, skillIndex };
    setDraggingSkillIdx({ groupIndex, skillIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSkillDragOver = (e, groupIndex, skillIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSkillIdx({ groupIndex, skillIndex });
  };

  const handleSkillDrop = (e, groupIndex, skillIndex) => {
    e.preventDefault();
    const from = dragSkillIdxRef.current;
    if (!from || from.groupIndex !== groupIndex || from.skillIndex === skillIndex) return;

    const skills = [...resume.skillGroups[groupIndex].skills];
    const [moved] = skills.splice(from.skillIndex, 1);
    skills.splice(skillIndex, 0, moved);
    reorderSkillsInGroup(groupIndex, skills);
    dragSkillIdxRef.current = null;
    setDragOverSkillIdx({});
  };

  const handleSkillDragEnd = () => {
    dragSkillIdxRef.current = null;
    setDragOverSkillIdx({});
    setDraggingSkillIdx({});
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (e.currentTarget.name?.startsWith('skill-input-')) {
        const groupIndex = parseInt(e.currentTarget.name.split('-')[2]);
        handleAddSkill(groupIndex);
      } else if (e.currentTarget.name === 'category-input') {
        handleAddCategory();
      }
    }
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Skills</h2>

      {/* Add New Category */}
      <div className="skills-input-row">
        <input
          type="text"
          name="category-input"
          value={newCategoryInput}
          onChange={e => setNewCategoryInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new category"
        />
        <button className="btn-add" onClick={handleAddCategory}>Add Category</button>
      </div>

      {/* Skill Groups */}
      <div className="skill-groups-container">
        {resume.skillGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`skill-group${dragOverIdx === groupIndex && draggingIdx !== groupIndex ? ' skill-group--drop-target' : ''}`}
            draggable
            onDragStart={e => handleCategoryDragStart(e, groupIndex)}
            onDragOver={e => handleCategoryDragOver(e, groupIndex)}
            onDrop={e => handleCategoryDrop(e, groupIndex)}
            onDragEnd={handleCategoryDragEnd}
          >
            {/* Category Header */}
            <div className="skill-group-header">
              <span className="skill-group-handle" title="Drag to reorder categories">⠿</span>
              <input
                type="text"
                className="skill-group-category-input"
                value={group.category}
                onChange={e => updateSkillGroupCategory(groupIndex, e.target.value)}
                placeholder="Category name"
              />
              <button
                className="btn-remove-group"
                onClick={() => removeSkillGroup(groupIndex)}
                title="Remove category"
              >
                ✕
              </button>
            </div>

            {/* Skill Input */}
            <div className="skill-input-row">
              <input
                type="text"
                name={`skill-input-${groupIndex}-input`}
                value={skillInputs[groupIndex] || ''}
                onChange={e => setSkillInputs(prev => ({ ...prev, [groupIndex]: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Add a skill (press Enter or comma)"
              />
              <button className="btn-add" onClick={() => handleAddSkill(groupIndex)}>Add</button>
            </div>

            {/* Skills Tags */}
            {group.skills.length > 0 && (
              <p className="skills-drag-hint">Drag tags to reorder</p>
            )}
            <div className="skills-tags">
              {group.skills.map((skill, skillIndex) => (
                <span
                  key={`${skill}-${skillIndex}`}
                  className={`skill-tag${dragOverSkillIdx.groupIndex === groupIndex && dragOverSkillIdx.skillIndex === skillIndex && draggingSkillIdx.skillIndex !== skillIndex ? ' skill-tag--drop-target' : ''}`}
                  draggable
                  onDragStart={e => handleSkillDragStart(e, groupIndex, skillIndex)}
                  onDragOver={e => handleSkillDragOver(e, groupIndex, skillIndex)}
                  onDrop={e => handleSkillDrop(e, groupIndex, skillIndex)}
                  onDragEnd={handleSkillDragEnd}
                >
                  <span className="skill-drag-handle" title="Drag to reorder">⠿</span>
                  {skill}
                  <button onClick={() => removeSkillFromGroup(groupIndex, skillIndex)} title="Remove">×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function Skills() {
  const {
    resume,
    addSkillCategory,
    removeSkillCategory,
    renameSkillCategory,
    moveSkillCategory,
    addSkillToCategory,
    removeSkillFromCategory,
  } = useResume();

  const categories = useMemo(() => resume.skillCategories || [], [resume.skillCategories]);
  const [categoryInputs, setCategoryInputs] = useState({});

  const setInput = (categoryId, value) => {
    setCategoryInputs((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleAddSkill = (categoryId) => {
    const value = (categoryInputs[categoryId] || '').trim();
    if (!value) return;
    addSkillToCategory(categoryId, value);
    setInput(categoryId, '');
  };

  const handleSkillKeyDown = (event, categoryId) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddSkill(categoryId);
    }
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Skills</h2>
        <button type="button" className="btn-add" onClick={addSkillCategory}>Add Category</button>
      </div>

      <div className="skill-categories-form">
        {categories.map((category, categoryIndex) => (
          <div className="skill-category-card" key={category.id}>
            <div className="skill-category-header">
              <input
                type="text"
                value={category.name}
                onChange={(event) => renameSkillCategory(category.id, event.target.value)}
                placeholder="Category name"
              />
              <div className="entry-reorder-controls">
                <button
                  type="button"
                  className="btn-move"
                  onClick={() => moveSkillCategory(categoryIndex, 'up')}
                  disabled={categoryIndex === 0}
                  title="Move category up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn-move"
                  onClick={() => moveSkillCategory(categoryIndex, 'down')}
                  disabled={categoryIndex >= categories.length - 1}
                  title="Move category down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeSkillCategory(category.id)}
                  title="Remove category"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="skills-input-row">
              <input
                type="text"
                value={categoryInputs[category.id] || ''}
                onChange={(event) => setInput(category.id, event.target.value)}
                onKeyDown={(event) => handleSkillKeyDown(event, category.id)}
                placeholder="Add skill (press Enter or comma)"
              />
              <button className="btn-add" type="button" onClick={() => handleAddSkill(category.id)}>Add</button>
            </div>

            <div className="skills-tags">
              {category.items.map((skill, skillIndex) => (
                <span className="skill-tag" key={`${category.id}-${skill}-${skillIndex}`}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillFromCategory(category.id, skillIndex)}
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

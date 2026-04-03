import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';

export default function Skills() {
  const { resume, addSkill, removeSkill } = useResume();
  const [input, setInput] = useState('');

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
      <div className="skills-tags">
        {resume.skills.map((skill, i) => (
          <span className="skill-tag" key={i}>
            {skill}
            <button onClick={() => removeSkill(skill)} title="Remove">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

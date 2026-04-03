import { useResume } from '../../context/ResumeContext';

const emptyEntry = {
  name: '',
  description: '',
  technologies: '',
  link: '',
};

export default function Projects() {
  const { resume, addEntry, updateEntry, removeEntry } = useResume();
  const entries = resume.projects;

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Projects</h2>
        <button className="btn-add" onClick={() => addEntry('projects', { ...emptyEntry })}>
          + Add Project
        </button>
      </div>
      {entries.map((entry, i) => (
        <div className="entry-card" key={i}>
          <div className="entry-card-header">
            <span>Project #{i + 1}</span>
            <button className="btn-remove" onClick={() => removeEntry('projects', i)}>Remove</button>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" value={entry.name} onChange={e => updateEntry('projects', i, 'name', e.target.value)} placeholder="My Awesome App" />
            </div>
            <div className="form-group">
              <label>Technologies Used</label>
              <input type="text" value={entry.technologies} onChange={e => updateEntry('projects', i, 'technologies', e.target.value)} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className="form-group">
              <label>Project Link (optional)</label>
              <input type="url" value={entry.link} onChange={e => updateEntry('projects', i, 'link', e.target.value)} placeholder="https://github.com/..." />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <textarea value={entry.description} onChange={e => updateEntry('projects', i, 'description', e.target.value)} placeholder="Describe what this project does and your role..." rows={3} />
          </div>
        </div>
      ))}
    </div>
  );
}

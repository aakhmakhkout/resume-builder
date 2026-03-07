import { useResume } from '../../context/ResumeContext';

const emptyEntry = {
  name: '',
  organization: '',
  date: '',
};

export default function Certifications() {
  const { resume, addEntry, updateEntry, removeEntry } = useResume();
  const entries = resume.certifications;

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Certifications</h2>
        <button className="btn-add" onClick={() => addEntry('certifications', { ...emptyEntry })}>
          + Add Certification
        </button>
      </div>
      {entries.map((entry, i) => (
        <div className="entry-card" key={i}>
          <div className="entry-card-header">
            <span>Certification #{i + 1}</span>
            <button className="btn-remove" onClick={() => removeEntry('certifications', i)}>Remove</button>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Certification Name</label>
              <input type="text" value={entry.name} onChange={e => updateEntry('certifications', i, 'name', e.target.value)} placeholder="AWS Certified Developer" />
            </div>
            <div className="form-group">
              <label>Issuing Organization</label>
              <input type="text" value={entry.organization} onChange={e => updateEntry('certifications', i, 'organization', e.target.value)} placeholder="Amazon Web Services" />
            </div>
            <div className="form-group">
              <label>Date Obtained</label>
              <input type="text" value={entry.date} onChange={e => updateEntry('certifications', i, 'date', e.target.value)} placeholder="June 2023" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

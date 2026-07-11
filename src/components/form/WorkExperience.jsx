import { useResume } from '../../context/ResumeContext';
import EntryReorderControls from './EntryReorderControls';
import useReorderableEntries from './useReorderableEntries';

const emptyEntry = {
  company: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
};

export default function WorkExperience() {
  const { resume, addEntry, updateEntry, removeEntry } = useResume();
  const entries = resume.workExperience;
  const {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveUp,
    moveDown,
  } = useReorderableEntries('workExperience');

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Work Experience</h2>
        <button className="btn-add" onClick={() => addEntry('workExperience', { ...emptyEntry })}>
          + Add Experience
        </button>
      </div>
      {entries.map((entry, i) => (
        <div
          className={`entry-card${dragOverIdx === i && draggingIdx !== i ? ' entry-card--drop-target' : ''}`}
          key={i}
          onDragOver={(event) => handleDragOver(event, i)}
          onDrop={(event) => handleDrop(event, i)}
        >
          <div className="entry-card-header">
            <span>Experience #{i + 1}</span>
            <div className="entry-card-actions">
              <EntryReorderControls
                index={i}
                total={entries.length}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <button className="btn-remove" onClick={() => removeEntry('workExperience', i)}>Remove</button>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={entry.company} onChange={e => updateEntry('workExperience', i, 'company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" value={entry.jobTitle} onChange={e => updateEntry('workExperience', i, 'jobTitle', e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="text" value={entry.startDate} onChange={e => updateEntry('workExperience', i, 'startDate', e.target.value)} placeholder="Jan 2020" />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="text" value={entry.endDate} disabled={entry.current} onChange={e => updateEntry('workExperience', i, 'endDate', e.target.value)} placeholder="Dec 2022" />
              <label className="checkbox-label">
                <input type="checkbox" checked={entry.current} onChange={e => updateEntry('workExperience', i, 'current', e.target.checked)} />
                Currently working here
              </label>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={entry.location} onChange={e => updateEntry('workExperience', i, 'location', e.target.value)} placeholder="New York, NY" />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description / Responsibilities</label>
            <textarea value={entry.description} onChange={e => updateEntry('workExperience', i, 'description', e.target.value)} placeholder="• Led development of...&#10;• Improved performance by...&#10;• Collaborated with..." rows={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

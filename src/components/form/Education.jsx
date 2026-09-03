import { useResume } from '../../context/ResumeContext';
import EntryReorderControls from './EntryReorderControls';
import useReorderableEntries from './useReorderableEntries';

const emptyEntry = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  gpa: '',
};

export default function Education() {
  const { resume, addEntry, updateEntry, removeEntry } = useResume();
  const entries = resume.education;
  const {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveUp,
    moveDown,
  } = useReorderableEntries('education');

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Education</h2>
        <button className="btn-add" onClick={() => addEntry('education', { ...emptyEntry })}>
          + Add Education
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
            <span>Education #{i + 1}</span>
            <div className="entry-card-actions">
              <EntryReorderControls
                index={i}
                total={entries.length}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <button className="btn-remove" onClick={() => removeEntry('education', i)}>Remove</button>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Institution</label>
              <input type="text" value={entry.institution} onChange={e => updateEntry('education', i, 'institution', e.target.value)} placeholder="MIT" />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input type="text" value={entry.degree} onChange={e => updateEntry('education', i, 'degree', e.target.value)} placeholder="Bachelor of Science" />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input type="text" value={entry.fieldOfStudy} onChange={e => updateEntry('education', i, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="text" value={entry.startDate} onChange={e => updateEntry('education', i, 'startDate', e.target.value)} placeholder="Sep 2016" />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="text" value={entry.endDate} onChange={e => updateEntry('education', i, 'endDate', e.target.value)} placeholder="May 2020" />
            </div>
            <div className="form-group">
              <label>GPA (optional)</label>
              <input type="text" value={entry.gpa} onChange={e => updateEntry('education', i, 'gpa', e.target.value)} placeholder="3.8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

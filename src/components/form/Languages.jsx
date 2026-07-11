import { useResume } from '../../context/ResumeContext';
import EntryReorderControls from './EntryReorderControls';
import useReorderableEntries from './useReorderableEntries';

const emptyEntry = {
  language: '',
  proficiency: 'Intermediate',
};

const proficiencyLevels = ['Native', 'Fluent', 'Intermediate', 'Basic'];

export default function Languages() {
  const { resume, addEntry, updateEntry, removeEntry } = useResume();
  const entries = resume.languages;
  const {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveUp,
    moveDown,
  } = useReorderableEntries('languages');

  return (
    <div className="form-section">
      <div className="section-header">
        <h2 className="section-title">Languages</h2>
        <button className="btn-add" onClick={() => addEntry('languages', { ...emptyEntry })}>
          + Add Language
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
            <span>Language #{i + 1}</span>
            <div className="entry-card-actions">
              <EntryReorderControls
                index={i}
                total={entries.length}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <button className="btn-remove" onClick={() => removeEntry('languages', i)}>Remove</button>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Language</label>
              <input type="text" value={entry.language} onChange={e => updateEntry('languages', i, 'language', e.target.value)} placeholder="English" />
            </div>
            <div className="form-group">
              <label>Proficiency</label>
              <select value={entry.proficiency} onChange={e => updateEntry('languages', i, 'proficiency', e.target.value)}>
                {proficiencyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

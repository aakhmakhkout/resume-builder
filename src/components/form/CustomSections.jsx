import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { DEFAULT_SUBSECTION_TYPE, SUBSECTION_TYPES, getSubsectionType } from '../../utils/customSections';
import EntryReorderControls from './EntryReorderControls';
import useReorderableEntries from './useReorderableEntries';

function CustomSectionEditor({ section }) {
  const {
    renameCustomSection,
    setCustomSectionType,
    addCustomSectionEntry,
    updateCustomSectionEntry,
    duplicateCustomSectionEntry,
    removeCustomSectionEntry,
    toggleCustomSectionEntryCollapse,
    reorderCustomSectionEntries,
    moveCustomSectionEntry,
    removeCustomSection,
  } = useResume();
  const type = getSubsectionType(section.typeId || DEFAULT_SUBSECTION_TYPE);
  const {
    dragOverIdx,
    draggingIdx,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveUp,
    moveDown,
  } = useReorderableEntries({
    onReorder: (from, to) => reorderCustomSectionEntries(section.id, from, to),
    onMove: (index, direction) => moveCustomSectionEntry(section.id, index, direction),
  });

  return (
    <div className="custom-section-card">
      <div className="custom-section-header">
        <input
          type="text"
          value={section.name}
          className="custom-section-name-input"
          onChange={(event) => renameCustomSection(section.id, event.target.value)}
          placeholder="Section name"
        />
        <button type="button" className="btn-remove" onClick={() => removeCustomSection(section.id)}>Remove Section</button>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Subsection Type</label>
          <select
            value={section.typeId}
            onChange={(event) => setCustomSectionType(section.id, event.target.value)}
          >
            {SUBSECTION_TYPES.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="section-header">
        <h3 className="subsection-title">Entries</h3>
        <button type="button" className="btn-add" onClick={() => addCustomSectionEntry(section.id)}>
          + Add Entry
        </button>
      </div>
      {section.entries.map((entry, index) => (
        <div
          className={`entry-card${dragOverIdx === index && draggingIdx !== index ? ' entry-card--drop-target' : ''}`}
          key={entry.id}
          onDragOver={(event) => handleDragOver(event, index)}
          onDrop={(event) => handleDrop(event, index)}
        >
          <div className="entry-card-header">
            <span>{section.name} #{index + 1}</span>
            <div className="entry-card-actions">
              <EntryReorderControls
                index={index}
                total={section.entries.length}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <button type="button" className="btn-move" onClick={() => duplicateCustomSectionEntry(section.id, entry.id)} title="Duplicate">⧉</button>
              <button type="button" className="btn-move" onClick={() => toggleCustomSectionEntryCollapse(section.id, entry.id)} title={entry.collapsed ? 'Expand' : 'Collapse'}>
                {entry.collapsed ? '▾' : '▴'}
              </button>
              <button type="button" className="btn-remove" onClick={() => removeCustomSectionEntry(section.id, entry.id)}>Delete</button>
            </div>
          </div>
          {!entry.collapsed && (
            <div className="form-grid">
              {type.fields.map((field) => (
                <div className="form-group" key={`${entry.id}-${field.key}`}>
                  <label>{field.label}</label>
                  {field.multiline ? (
                    <textarea
                      rows={field.rows || 4}
                      value={entry.values?.[field.key] || ''}
                      onChange={(event) => updateCustomSectionEntry(section.id, entry.id, field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={entry.values?.[field.key] || ''}
                      onChange={(event) => updateCustomSectionEntry(section.id, entry.id, field.key, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CustomSections() {
  const { resume, addCustomSection } = useResume();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    addCustomSection(name);
    setName('');
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Custom Sections</h2>
      <div className="skills-input-row">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Section name (e.g. Publications, Awards)"
        />
        <button type="button" className="btn-add" onClick={handleCreate}>+ Add Section</button>
      </div>
      {resume.customSections.map((section) => (
        <CustomSectionEditor key={section.id} section={section} />
      ))}
    </div>
  );
}

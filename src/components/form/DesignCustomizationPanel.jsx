import { useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { FONT_OPTIONS, getResumeStyle, RESUME_STYLE_PRESETS } from '../../utils/designSettings';

const DESIGN_FIELDS = [
  {
    title: 'Typography',
    items: [
      { key: 'resumeNameSize', label: 'Resume name size', type: 'number', min: 20, max: 50, step: 0.5 },
      { key: 'sectionHeadingSize', label: 'Section heading size', type: 'number', min: 9, max: 24, step: 0.5 },
      { key: 'sectionHeadingWeight', label: 'Section heading weight', type: 'number', min: 300, max: 900, step: 100 },
      { key: 'bodySize', label: 'Body/content size', type: 'number', min: 8, max: 18, step: 0.5 },
      { key: 'bodyWeight', label: 'Body/content weight', type: 'number', min: 300, max: 700, step: 100 },
      { key: 'fontFamily', label: 'Font family', type: 'font' },
    ],
  },
  {
    title: 'Spacing',
    items: [
      { key: 'lineHeight', label: 'Line height', type: 'number', min: 1, max: 2, step: 0.05 },
      { key: 'sectionSpacing', label: 'Section spacing', type: 'number', min: 0, max: 40, step: 1 },
      { key: 'paragraphSpacing', label: 'Paragraph spacing', type: 'number', min: 0, max: 12, step: 0.5 },
      { key: 'bulletSpacing', label: 'Bullet spacing', type: 'number', min: 0, max: 12, step: 0.5 },
    ],
  },
  {
    title: 'Page',
    items: [
      { key: 'pagePaddingTop', label: 'Page padding top', type: 'number', min: 0, max: 80, step: 1 },
      { key: 'pagePaddingBottom', label: 'Page padding bottom', type: 'number', min: 0, max: 80, step: 1 },
      { key: 'pagePaddingLeft', label: 'Page padding left', type: 'number', min: 0, max: 80, step: 1 },
      { key: 'pagePaddingRight', label: 'Page padding right', type: 'number', min: 0, max: 80, step: 1 },
    ],
  },
  {
    title: 'Section Heading',
    items: [
      { key: 'headingUppercase', label: 'Uppercase', type: 'checkbox' },
      { key: 'headingDivider', label: 'Divider', type: 'checkbox' },
      { key: 'dividerThickness', label: 'Divider thickness', type: 'number', min: 0, max: 4, step: 0.1 },
    ],
  },
];

export default function DesignCustomizationPanel() {
  const { resume, updateDesignSetting, updateDesignPreset } = useResume();
  const activeStyle = useMemo(
    () => getResumeStyle(resume.designSettings),
    [resume.designSettings],
  );

  const renderInput = (field) => {
    const value = activeStyle[field.key];

    if (field.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => updateDesignSetting(field.key, event.target.checked)}
        />
      );
    }

    if (field.type === 'font') {
      return (
        <select value={value} onChange={(event) => updateDesignSetting(field.key, event.target.value)}>
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="number"
        value={value}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(event) => updateDesignSetting(field.key, Number(event.target.value))}
      />
    );
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Design Customization</h2>

      <div className="form-group full-width">
        <label>Style preset</label>
        <select
          value={resume.designSettings.presetId}
          onChange={(event) => updateDesignPreset(event.target.value)}
        >
          {RESUME_STYLE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.label}</option>
          ))}
        </select>
      </div>

      <div className="section-customization-block">
        {DESIGN_FIELDS.map((group) => (
          <div className="section-style-card" key={group.title}>
            <h3 className="subsection-title">{group.title}</h3>
            <div className="form-grid">
              {group.items.map((field) => (
                <div className="form-group" key={field.key}>
                  <label>{field.label}</label>
                  {renderInput(field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

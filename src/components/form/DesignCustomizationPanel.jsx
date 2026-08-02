import { useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import { FONT_OPTIONS } from '../../utils/designSettings';
import { resolveSectionLabel } from '../../utils/sections';

const SECTION_STYLE_FIELDS = [
  { key: 'fontSize', label: 'Font Size', type: 'number', min: 8, max: 24, step: 0.5 },
  { key: 'headingFontSize', label: 'Heading Font Size', type: 'number', min: 10, max: 36, step: 0.5 },
  { key: 'fontWeight', label: 'Font Weight', type: 'number', min: 300, max: 800, step: 100 },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'headingColor', label: 'Heading Color', type: 'color' },
  { key: 'marginTop', label: 'Top Margin', type: 'number', min: 0, max: 48, step: 1 },
  { key: 'marginBottom', label: 'Bottom Margin', type: 'number', min: 0, max: 48, step: 1 },
  { key: 'paddingLeft', label: 'Left Padding', type: 'number', min: 0, max: 48, step: 1 },
  { key: 'paddingRight', label: 'Right Padding', type: 'number', min: 0, max: 48, step: 1 },
  { key: 'dividerVisible', label: 'Divider Visible', type: 'checkbox' },
  { key: 'dividerThickness', label: 'Divider Thickness', type: 'number', min: 0, max: 4, step: 0.1 },
  { key: 'dividerColor', label: 'Divider Color', type: 'color' },
];

export default function DesignCustomizationPanel() {
  const { resume, updateGlobalDesignSetting, updateSectionDesignSetting } = useResume();
  const { global } = resume.designSettings;

  const sectionChoices = useMemo(
    () => resume.sectionOrder.map((sectionKey) => ({
      sectionKey,
      label: resolveSectionLabel(sectionKey, resume.customSections),
    })),
    [resume.customSections, resume.sectionOrder],
  );

  const renderInput = (sectionKey, field) => {
    const value = resume.designSettings.sections?.[sectionKey]?.[field.key];

    if (field.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={value !== false}
          onChange={(event) => updateSectionDesignSetting(sectionKey, field.key, event.target.checked)}
        />
      );
    }

    if (field.type === 'color') {
      return (
        <input
          type="color"
          value={typeof value === 'string' ? value : '#111111'}
          onChange={(event) => updateSectionDesignSetting(sectionKey, field.key, event.target.value)}
        />
      );
    }

    return (
      <input
        type="number"
        value={value ?? ''}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder="Default"
        onChange={(event) => updateSectionDesignSetting(
          sectionKey,
          field.key,
          event.target.value === '' ? '' : Number(event.target.value),
        )}
      />
    );
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Design Customization</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Page Margin</label>
          <input type="number" min={0} max={60} step={1} value={global.pageMargin} onChange={(e) => updateGlobalDesignSetting('pageMargin', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Page Padding</label>
          <input type="number" min={0} max={80} step={1} value={global.pagePadding} onChange={(e) => updateGlobalDesignSetting('pagePadding', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Font Family</label>
          <select value={global.fontFamily} onChange={(e) => updateGlobalDesignSetting('fontFamily', e.target.value)}>
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Base Font Size</label>
          <input type="number" min={8} max={18} step={0.5} value={global.baseFontSize} onChange={(e) => updateGlobalDesignSetting('baseFontSize', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Line Height</label>
          <input type="number" min={1} max={2} step={0.05} value={global.lineHeight} onChange={(e) => updateGlobalDesignSetting('lineHeight', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Section Gap</label>
          <input type="number" min={0} max={40} step={1} value={global.sectionGap} onChange={(e) => updateGlobalDesignSetting('sectionGap', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Divider Thickness</label>
          <input type="number" min={0} max={4} step={0.1} value={global.dividerThickness} onChange={(e) => updateGlobalDesignSetting('dividerThickness', Number(e.target.value))} />
        </div>
      </div>

      <div className="section-customization-block">
        <h3 className="subsection-title">Per-Section Styling</h3>
        {sectionChoices.map(({ sectionKey, label }) => (
          <details className="section-style-card" key={sectionKey}>
            <summary>{label}</summary>
            <div className="form-grid">
              {SECTION_STYLE_FIELDS.map((field) => (
                <div className="form-group" key={`${sectionKey}-${field.key}`}>
                  <label>{field.label}</label>
                  {renderInput(sectionKey, field)}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

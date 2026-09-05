import { useResume } from '../../context/ResumeContext';

export default function PersonalInfo() {
  const { resume, updatePersonalInfo } = useResume();
  const { personalInfo } = resume;

  return (
    <div className="form-section">
      <h2 className="section-title">Personal Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={e => updatePersonalInfo('fullName', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            value={personalInfo.jobTitle}
            onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
            placeholder="Software Engineer"
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={e => updatePersonalInfo('email', e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={e => updatePersonalInfo('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={e => updatePersonalInfo('location', e.target.value)}
            placeholder="New York, NY"
          />
        </div>
        <div className="form-group">
          <label>LinkedIn URL</label>
          <input
            type="url"
            value={personalInfo.linkedin}
            onChange={e => updatePersonalInfo('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div className="form-group">
          <label>GitHub / Portfolio URL</label>
          <input
            type="url"
            value={personalInfo.github}
            onChange={e => updatePersonalInfo('github', e.target.value)}
            placeholder="https://github.com/johndoe"
          />
        </div>
      </div>
      <div className="form-group full-width">
        <label>Professional Summary</label>
        <textarea
          value={personalInfo.summary}
          onChange={e => updatePersonalInfo('summary', e.target.value)}
          placeholder="Brief summary of your professional background and goals..."
          rows={4}
        />
      </div>
    </div>
  );
}

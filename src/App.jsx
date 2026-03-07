import { ResumeProvider } from './context/ResumeContext';
import PersonalInfo from './components/form/PersonalInfo';
import WorkExperience from './components/form/WorkExperience';
import Education from './components/form/Education';
import Skills from './components/form/Skills';
import Projects from './components/form/Projects';
import Certifications from './components/form/Certifications';
import Languages from './components/form/Languages';
import ResumePreview from './components/ResumePreview';
import './App.css';

function App() {
  return (
    <ResumeProvider>
      <div className="app-layout">
        <div className="form-panel">
          <div className="form-panel-header">
            <h1 className="app-title">📄 Resume Builder</h1>
            <p className="app-subtitle">Fill in your details and see your resume update in real-time</p>
          </div>
          <div className="form-panel-content">
            <PersonalInfo />
            <WorkExperience />
            <Education />
            <Skills />
            <Projects />
            <Certifications />
            <Languages />
          </div>
        </div>
        <ResumePreview />
      </div>
    </ResumeProvider>
  );
}

export default App;

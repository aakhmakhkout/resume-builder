# Resume Builder

A React-based Resume Builder web application that allows you to input your resume information and see a live preview of the resume as you type, with the ability to download the final resume as a PDF.

## Features

- **Live Preview** – Changes in the form immediately reflect in the resume preview
- **PDF Download** – Generate and download your resume as a professionally formatted PDF
- **Dynamic Sections** – Add/remove multiple entries for Work Experience, Education, Projects, Certifications, and Languages
- **Skills Tags** – Add skills as tags/chips
- **Responsive Design** – Works on desktop and mobile

## Tech Stack

- React + Vite
- Plain CSS
- html2pdf.js for PDF generation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── form/
│   │   ├── PersonalInfo.jsx
│   │   ├── WorkExperience.jsx
│   │   ├── Education.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── Certifications.jsx
│   │   └── Languages.jsx
│   └── ResumePreview.jsx
├── context/
│   └── ResumeContext.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

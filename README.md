# 📄 DocuScan - AI-Powered Document OCR

A modern, fast, and accurate document text extraction application powered by Groq's LLaMA Vision API. Extract text from images, notes, letters, marksheets, and tables with smart formatting preservation.

![Built with React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ Features

### 📸 Multi-Input Support
- **Upload Images** - Drag & drop or browse for files
- **Camera Capture** - Take photos directly from device camera
- **Multi-File Processing** - Process multiple documents at once
- **Image Cropping** - Select specific areas before extraction

### 🎯 Two Extraction Modes

#### Notes & Letters Page
- Extract text from notes, letters, memos, and documents
- Preserves original formatting and structure
- Extracts metadata (title, date, from, to, type)
- Export to multiple formats (TXT, DOCX, PDF)

#### Tables & Marksheets Page
- Extract structured data from tables and marksheets
- Smart header detection
- Row-by-row data extraction
- Export to Excel, CSV, or Word

### 🚀 Advanced Features
- **Groq AI** - Lightning-fast extraction with LLaMA 4 Scout Vision
- **Batch Processing** - Process multiple files sequentially
- **Format Preservation** - Maintains original text layout
- **Smart Concatenation** - Combines multiple documents with separators
- **Real-time Progress** - Live status updates during extraction
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + Framer Motion
- **AI**: Groq API (LLaMA 4 Scout 17B Vision)
- **Export**: docx, jsPDF
- **Image Processing**: react-image-crop
- **Routing**: React Router

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun 1.2+
- Groq API Key ([Get one here](https://console.groq.com))

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/iredox10/marksheet.git
cd marksheet-ocr
```

2. **Install dependencies**
```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

4. **Start development server**
```bash
# Using bun
bun run dev

# Or using npm
npm run dev
```

Visit `http://localhost:5173`

## 🚀 Usage

### Extract Notes/Letters

1. Navigate to **Notes** page
2. Upload image(s) or take a photo
3. (Optional) Crop specific areas
4. Click **Extract Text**
5. Export as TXT, DOCX, or PDF

### Extract Tables/Marksheets

1. Navigate to **Tables** page
2. Upload marksheet/table images
3. (Optional) Crop individual files
4. Click **Extract Data**
5. Export as Excel, CSV, or Word

## 📁 Project Structure

```
marksheet-ocr/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ImageCropper.tsx
│   │   ├── ExportButtons.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── NotesPage.tsx
│   │   └── AppPage.tsx
│   ├── services/         # API & utilities
│   │   ├── ai-ocr.ts
│   │   └── export.ts
│   ├── types/            # TypeScript types
│   └── App.tsx
├── public/
└── package.json
```

## 🔑 API Keys

You'll need a **Groq API key** to use this application:

1. Sign up at [Groq Console](https://console.groq.com)
2. Create a new API key
3. Add it to your `.env` file

**⚠️ Security Note**: Never commit your `.env` file or expose your API keys.

## 🎨 Features in Detail

### Image Cropping
- Click the blue crop button on any uploaded image
- Adjust the crop area with drag handles
- Apply crop to refine what gets extracted

### Multi-File Processing
- Upload or capture multiple documents
- Thumbnail grid with individual controls
- Sequential extraction with progress tracking
- Combined output with document separators

### Export Formats

**Text Exports (Notes)**
- `.txt` - Plain text with metadata
- `.docx` - Formatted Word document
- `.pdf` - PDF with proper pagination

**Data Exports (Tables)**
- `.xlsx` - Excel workbook
- `.csv` - Comma-separated values
- `.docx` - Word table format

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Groq](https://groq.com) for the amazing AI API
- [React](https://react.dev) for the UI framework
- [Vite](https://vitejs.dev) for the build tool
- [Tailwind CSS](https://tailwindcss.com) for styling

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ using Groq AI**

**Built by [iredox.tech](https://iredox.tech)**


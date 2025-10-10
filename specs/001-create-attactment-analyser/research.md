# Research: Attachment Analyser

## Decisions

### PDF Text Extraction

**Decision**: Use `pdf-parse` library.
**Rationale**: `pdf-parse` is a popular and well-maintained library for parsing PDF files in Node.js. It is easy to use and has good performance.
**Alternatives considered**: `pdf.js` (more complex, designed for rendering PDFs in the browser).

### DOCX Text Extraction

**Decision**: Use `mammoth` library.
**Rationale**: `mammoth` is designed to convert .docx documents to HTML, but it can also be used to extract raw text. It is simple to use and effective.
**Alternatives considered**: `docx` (less popular, not as well-maintained).

### Image to Text (OCR)

**Decision**: Use `tesseract.js` library.
**Rationale**: `tesseract.js` is a pure JavaScript port of the Tesseract OCR engine. It is easy to use and supports multiple languages.
**Alternatives considered**: Google Cloud Vision API, AWS Textract (these are cloud services and we want to keep the tool self-contained for now).

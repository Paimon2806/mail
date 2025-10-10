# Data Model: Attachment Analyser

## Entities

### Attachment

Represents the uploaded file.

**Fields**:

- `filename`: string - The name of the uploaded file.
- `mimetype`: string - The MIME type of the uploaded file.
- `size`: number - The size of the uploaded file in bytes.
- `content`: Buffer - The raw content of the uploaded file.

### PlainText

Represents the extracted plain text content.

**Fields**:

- `text`: string - The extracted plain text content (truncated to 500 characters).

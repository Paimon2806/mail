# Prepr Vault Backend API

A comprehensive document and milestone management system built with TypeScript, Express, and TypeORM.

## 🚀 Features

### Core Functionality
- **User Management**: Firebase authentication with PIN security
- **Document Management**: File upload, storage, and organization with S3 integration
- **Folder System**: Hierarchical folder structure with metadata and sharing
- **Milestone Tracking**: Life event documentation with photos and rich metadata
- **Onboarding**: Smart folder creation based on user responses
- **Bill Management**: Payment tracking and organization

### Technical Features
- **RESTful API**: Comprehensive REST endpoints with Swagger documentation
- **File Processing**: AWS Textract integration for document text extraction
- **Search & Filtering**: Advanced search capabilities across all entities
- **Bulk Operations**: Efficient batch processing for multiple items
- **Analytics**: Comprehensive statistics and usage tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express with TS.ED decorators
- **Database**: MySQL with TypeORM
- **Storage**: AWS S3 for file storage
- **Authentication**: Firebase Admin SDK
- **Document Processing**: AWS Textract
- **Validation**: AJV with custom schemas

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Run database migrations
npm run typeorm migration:run

# Seed initial data
npm run seed

# Start development server
npm start
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=prepr_vault

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Server
PORT=8083
NODE_ENV=development
```

## 📚 API Documentation

Once the server is running, visit `http://localhost:8083` for interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /rest/users` - Create user account
- `POST /rest/users/pin/set` - Set security PIN
- `POST /rest/users/pin/verify` - Verify PIN

#### File Management
- `POST /rest/files/folders/{folderId}/upload` - Get upload URL
- `POST /rest/files/confirm` - Confirm file upload
- `GET /rest/files` - List user files
- `DELETE /rest/files/{fileId}` - Delete file

#### Folder Management
- `GET /rest/folders` - List user folders
- `POST /rest/folders` - Create folder
- `PUT /rest/folders/{folderId}` - Update folder
- `DELETE /rest/folders/{folderId}` - Delete folder
- `POST /rest/folders/move` - Move folder
- `POST /rest/folders/copy` - Copy folder

#### Milestones
- `GET /rest/milestones` - List milestones
- `POST /rest/milestones` - Create milestone
- `PUT /rest/milestones/{milestoneId}` - Update milestone
- `DELETE /rest/milestones/{milestoneId}` - Delete milestone

#### Onboarding
- `GET /rest/onboarding/questions` - Get onboarding questions
- `POST /rest/onboarding/submit` - Submit responses
- `GET /rest/onboarding/status` - Check completion status

## 🗄️ Database Schema

### Core Entities
- **Users**: User accounts with Firebase integration
- **UserFolders**: Hierarchical folder structure
- **Files**: Document storage with S3 integration
- **Milestones**: Life event tracking
- **Bills**: Payment and bill management
- **OnboardingQuestions**: User onboarding flow

### Relationships
- Users have many Folders, Files, Milestones, and Bills
- Folders can have parent-child relationships
- Files belong to Folders and can be linked to Milestones
- Milestones can have multiple Files attached

## 🔒 Security

- Firebase authentication for user management
- PIN-based security for sensitive operations
- S3 presigned URLs for secure file uploads
- Input validation and sanitization
- SQL injection protection via TypeORM

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### PM2 Process Management
```bash
npm run pm2prod
```

### Docker
```bash
docker build -t prepr-vault-backend .
docker run -p 8083:8083 prepr-vault-backend
```

## 📊 Monitoring

The application includes comprehensive logging and monitoring:
- Request/response logging
- Error tracking and reporting
- Performance metrics
- Database query monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions, please contact the development team.
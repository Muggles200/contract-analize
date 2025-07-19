# Contract Upload Feature Specification

## Overview

The contract upload feature allows users to securely upload contract documents for AI analysis. It supports multiple file formats, provides real-time upload progress, and includes validation and security measures.

## User Stories

### Primary User Stories
- As a user, I want to upload contract documents so that I can analyze them with AI
- As a user, I want to see upload progress so that I know when my file is being processed
- As a user, I want to upload multiple file formats so that I can work with various contract types
- As a user, I want to validate my uploads so that I know the file meets requirements

### Secondary User Stories
- As a user, I want to drag and drop files so that uploading is more convenient
- As a user, I want to see file previews so that I can confirm I uploaded the right document
- As a user, I want to cancel uploads so that I can stop processing if needed
- As a user, I want to see upload history so that I can track my previous uploads

## Technical Requirements

### File Format Support
- **Primary Formats**: PDF, DOCX, DOC
- **Secondary Formats**: TXT, RTF (with conversion)
- **Maximum File Size**: 25MB per file
- **File Validation**: Virus scanning, format validation, content extraction

### Security Requirements
- **File Scanning**: Virus and malware scanning for all uploads
- **Access Control**: Signed URLs for secure file access
- **Encryption**: Files encrypted at rest and in transit
- **Retention Policy**: Automatic cleanup after 90 days (configurable)

### Performance Requirements
- **Upload Speed**: Support for files up to 25MB with progress indication
- **Processing Time**: Initial processing within 30 seconds
- **Concurrent Uploads**: Support for up to 5 simultaneous uploads
- **CDN Distribution**: Global CDN for fast file access

## UI/UX Design

### Upload Interface

#### Main Upload Area
```typescript
interface UploadArea {
  dragAndDrop: boolean;
  fileInput: HTMLInputElement;
  progressIndicator: ProgressBar;
  filePreview: FilePreview;
  validationMessages: ValidationMessage[];
}
```

#### File Preview Component
```typescript
interface FilePreview {
  fileName: string;
  fileSize: string;
  fileType: string;
  thumbnail?: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
}
```

#### Validation Messages
```typescript
interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}
```

### User Flow

1. **Landing on Upload Page**
   - User navigates to `/dashboard/upload`
   - Upload area displays with drag-and-drop zone
   - File type and size requirements shown

2. **File Selection**
   - User clicks upload area or drags file
   - File input opens or accepts dropped file
   - Immediate validation begins

3. **File Validation**
   - Check file format and size
   - Display validation messages
   - Show file preview if valid

4. **Upload Process**
   - Upload progress indicator appears
   - File uploads to Vercel Blob
   - Processing status updates

5. **Post-Upload**
   - Success message displayed
   - Redirect to analysis page
   - File added to user's contract list

## API Endpoints

### Upload Contract
```typescript
POST /api/contracts/upload
Content-Type: multipart/form-data

Request:
{
  file: File,
  contractName?: string,
  contractType?: string,
  tags?: string[]
}

Response:
{
  success: boolean;
  contractId: string;
  fileName: string;
  fileSize: number;
  uploadUrl: string;
  analysisStatus: 'pending' | 'processing' | 'complete';
  estimatedTime?: number;
}
```

### Get Upload Status
```typescript
GET /api/contracts/{contractId}/status

Response:
{
  contractId: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  estimatedTime?: number;
}
```

### Cancel Upload
```typescript
DELETE /api/contracts/{contractId}

Response:
{
  success: boolean;
  message: string;
}
```

## Database Schema

### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  blob_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  contract_name VARCHAR(255),
  contract_type VARCHAR(100),
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
```

### Upload Logs Table
```sql
CREATE TABLE upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_upload_logs_contract_id ON upload_logs(contract_id);
CREATE INDEX idx_upload_logs_user_id ON upload_logs(user_id);
```

## Implementation Details

### Frontend Components

#### UploadArea Component
```typescript
interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  onUploadProgress: (progress: number) => void;
  onUploadComplete: (contractId: string) => void;
  onUploadError: (error: string) => void;
  maxFileSize: number;
  allowedTypes: string[];
  multiple?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelect,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  maxFileSize,
  allowedTypes,
  multiple = false
}) => {
  // Implementation
};
```

#### FilePreview Component
```typescript
interface FilePreviewProps {
  file: File;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  onCancel?: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  status,
  progress,
  onCancel
}) => {
  // Implementation
};
```

### Backend Implementation

#### Upload Handler
```typescript
// app/api/contracts/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file
    const validation = await validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    });

    // Save to database
    const contract = await db.contract.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        blobUrl: blob.url,
        status: 'pending'
      }
    });

    // Start processing
    await processContract(contract.id);

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      fileName: file.name,
      fileSize: file.size,
      uploadUrl: blob.url,
      analysisStatus: 'pending'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

#### File Validation
```typescript
// lib/validation.ts
export async function validateFile(file: File): Promise<ValidationResult> {
  const maxSize = 25 * 1024 * 1024; // 25MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'application/rtf'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File size exceeds 25MB limit'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'File type not supported. Please upload PDF, DOCX, DOC, TXT, or RTF files.'
    };
  }

  // Virus scanning (implement with external service)
  const virusScan = await scanForVirus(file);
  if (!virusScan.clean) {
    return {
      valid: false,
      message: 'File appears to be malicious and cannot be uploaded'
    };
  }

  return { valid: true };
}
```

## Error Handling

### Common Error Scenarios
1. **File Too Large**: Show size limit and suggest compression
2. **Invalid File Type**: Display supported formats and conversion options
3. **Network Issues**: Retry mechanism with exponential backoff
4. **Server Errors**: Graceful degradation with user-friendly messages
5. **Virus Detection**: Clear explanation and security measures

### Error Messages
```typescript
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 25MB limit. Please compress your file or split it into smaller parts.',
  INVALID_TYPE: 'File type not supported. Please upload PDF, DOCX, DOC, TXT, or RTF files.',
  NETWORK_ERROR: 'Upload failed due to network issues. Please try again.',
  VIRUS_DETECTED: 'File appears to be malicious and cannot be uploaded for security reasons.',
  QUOTA_EXCEEDED: 'You have exceeded your monthly upload limit. Please upgrade your plan.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.'
};
```

## Testing Strategy

### Unit Tests
- File validation logic
- Upload progress calculation
- Error handling scenarios
- File type detection

### Integration Tests
- End-to-end upload flow
- API endpoint testing
- Database operations
- File storage integration

### E2E Tests
- Complete user journey
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

## Performance Considerations

### Optimization Strategies
1. **Chunked Uploads**: For large files, implement chunked upload
2. **Compression**: Client-side compression for supported formats
3. **Caching**: Cache file metadata and previews
4. **CDN**: Leverage Vercel Blob's global CDN
5. **Background Processing**: Process files asynchronously

### Monitoring
- Upload success rates
- File processing times
- Error rates by file type
- User experience metrics
- Storage usage patterns

## Security Considerations

### File Security
- Virus scanning for all uploads
- File type validation beyond MIME type
- Content inspection for malicious code
- Access control with signed URLs
- Automatic cleanup of old files

### Data Protection
- Encryption at rest and in transit
- GDPR compliance for EU users
- User consent for data processing
- Audit logging for all operations
- Secure file deletion

## Future Enhancements

### Planned Features
1. **Batch Upload**: Upload multiple files simultaneously
2. **File Conversion**: Automatic conversion to supported formats
3. **OCR Support**: Extract text from scanned documents
4. **Version Control**: Track contract versions and changes
5. **Collaboration**: Share contracts with team members
6. **Integration**: Connect with external storage services

### Technical Improvements
1. **Streaming Uploads**: Real-time upload progress
2. **Resumable Uploads**: Resume interrupted uploads
3. **Advanced Validation**: AI-powered content validation
4. **Performance Optimization**: Faster processing and uploads
5. **Mobile Optimization**: Enhanced mobile upload experience 
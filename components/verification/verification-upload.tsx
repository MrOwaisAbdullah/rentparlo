'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VerificationDocument {
  id: string;
  documentType: 'cnic_front' | 'cnic_back' | 'business_license' | 'bank_statement';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resubmit_required';
  uploadedAt: string;
  rejectionReason?: string;
  fileSize?: number;
}

interface DocumentRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize: number;
  example?: string;
}

interface VerificationUploadProps {
  documents: VerificationDocument[];
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  onUpload: (file: File, documentType: string) => Promise<void>;
  onDelete: (documentId: string, documentType: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const documentRequirements: DocumentRequirement[] = [
  {
    type: 'cnic_front',
    label: 'CNIC Front Side',
    description: 'Clear, colored photo of the front side of your CNIC',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    example: 'Show your full name, CNIC number, and photo clearly'
  },
  {
    type: 'cnic_back',
    label: 'CNIC Back Side',
    description: 'Clear, colored photo of the back side of your CNIC',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    example: 'Show address and signature clearly'
  },
  {
    type: 'business_license',
    label: 'Business License (Optional)',
    description: 'Business registration or trade license document',
    required: false,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    example: 'Valid business registration certificate'
  }
];

const statusConfig = {
  pending: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertCircle,
    label: 'Pending Review'
  },
  under_review: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Eye,
    label: 'Under Review'
  },
  approved: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Approved'
  },
  rejected: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
    label: 'Rejected'
  },
  resubmit_required: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    label: 'Resubmission Required'
  }
};

export function VerificationUpload({
  documents,
  verificationStatus,
  onUpload,
  onDelete,
  isLoading = false,
  className
}: VerificationUploadProps) {
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [dragOver, setDragOver] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const getDocumentByType = (type: string) => 
    documents.find(doc => doc.documentType === type);

  const getCompletionPercentage = () => {
    const requiredDocs = documentRequirements.filter(req => req.required);
    const approvedDocs = requiredDocs.filter(req => {
      const doc = getDocumentByType(req.type);
      return doc && doc.status === 'approved';
    });
    return Math.round((approvedDocs.length / requiredDocs.length) * 100);
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    const requirement = documentRequirements.find(req => req.type === documentType);
    if (!requirement) return;

    // Validate file type
    if (!requirement.acceptedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [documentType]: `Invalid file type. Accepted types: ${requirement.acceptedTypes.join(', ')}`
      }));
      return;
    }

    // Validate file size
    if (file.size > requirement.maxSize) {
      setErrors(prev => ({
        ...prev,
        [documentType]: `File too large. Maximum size: ${formatFileSize(requirement.maxSize)}`
      }));
      return;
    }

    setErrors(prev => ({ ...prev, [documentType]: '' }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentType] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [documentType]: current + 10 };
        });
      }, 200);

      await onUpload(file, documentType);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
      
      // Clear progress after success animation
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      }, 2000);

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [documentType]: error instanceof Error ? error.message : 'Upload failed'
      }));
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md verification-upload-card" role="alert">
        <p className="font-bold">Document Submission Guidelines</p>
        <ul className="mt-2 list-disc list-inside text-sm space-y-1">
          <li>
            <strong>Required:</strong> Clear photos of the front and back of your CNIC are mandatory for verification.
          </li>
          <li>
            <strong>Optional (Recommended):</strong> Submitting a business license can significantly speed up your verification process.
          </li>
          <li>Ensure all documents are clear, well-lit, and all text is readable.</li>
          <li>Upload colored scans or photos; black & white are not accepted.</li>
          <li>Documents must be current and not expired.</li>
          <li>Supported formats: JPG, PNG, PDF.</li>
          <li>Maximum file size: 10MB per document.</li>
          <li>Verification typically takes 24-48 hours.</li>
        </ul>
      </div>

      {/* Overall Progress */}
      <Card className="verification-upload-card">
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Required documents submitted</span>
              <span className="font-medium">{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="w-full" />
            
            {verificationStatus === 'approved' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your seller account has been verified! You can now create listings and start selling.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Sections */}
      <div className="grid gap-6">
        {documentRequirements.map((requirement) => {
          const existingDoc = getDocumentByType(requirement.type);
          const isUploading = uploadProgress[requirement.type] > 0;
          const hasError = errors[requirement.type];
          const config = existingDoc ? statusConfig[existingDoc.status] : null;

          return (
            <motion.div
              key={requirement.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={cn(
                "transition-all duration-200 verification-upload-card",
                config && `${config.borderColor} ${config.bgColor}`,
                dragOver === requirement.type && "border-primary border-dashed"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="text-base">{requirement.label}</span>
                      {requirement.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {config && (
                      <Badge variant="outline" className={cn("text-xs", config.textColor)}>
                        <config.icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>
                  {requirement.example && (
                    <p className="text-xs text-muted-foreground italic">
                      Example: {requirement.example}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  {existingDoc ? (
                    <div className="space-y-4">
                      {/* Existing Document */}
                      <div className={cn(
                        "p-4 rounded-lg border-2 border-dashed verification-document-container",
                        config?.borderColor || "border-gray-200"
                      )}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 verification-document-info">
                          <div className="flex items-start space-x-3">
                            <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{existingDoc.fileName}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Uploaded {formatDate(existingDoc.uploadedAt)}
                                {existingDoc.fileSize && ` • ${formatFileSize(existingDoc.fileSize)}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(existingDoc.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {existingDoc.status !== 'approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(existingDoc.id, existingDoc.documentType)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {existingDoc.rejectionReason && (
                          <Alert className="mt-3 bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                              <strong>Rejection Reason:</strong> {existingDoc.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      {/* Allow reupload if rejected */}
                      {['rejected', 'resubmit_required'].includes(existingDoc.status) && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Please upload a new document addressing the feedback above
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors",
                        dragOver === requirement.type && "border-primary bg-primary/5",
                        "hover:border-gray-400"
                      )}
                      onDrop={(e) => handleDrop(e, requirement.type)}
                      onDragOver={handleDragOver}
                      onDragEnter={() => setDragOver(requirement.type)}
                      onDragLeave={() => setDragOver(null)}
                    >
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Drop your {requirement.label.toLowerCase()} here, or{' '}
                          <button
                            className="text-primary hover:text-primary/80 underline"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = requirement.acceptedTypes.join(',');
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleFileUpload(file, requirement.type);
                              };
                              input.click();
                            }}
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {requirement.acceptedTypes.join(', ').toUpperCase()} up to {formatFileSize(requirement.maxSize)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress[requirement.type]}%</span>
                      </div>
                      <Progress value={uploadProgress[requirement.type]} />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {hasError && (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {hasError}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
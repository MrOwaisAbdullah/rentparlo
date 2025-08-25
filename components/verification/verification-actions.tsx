'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VerificationUpload } from './verification-upload';

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

interface VerificationActionsProps {
  initialDocuments: VerificationDocument[];
  initialStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
}

export function VerificationActions({
  initialDocuments,
  initialStatus
}: VerificationActionsProps) {
  const [documents, setDocuments] = React.useState<VerificationDocument[]>(initialDocuments);
  const [verificationStatus, setVerificationStatus] = React.useState(initialStatus);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleUpload = async (file: File, documentType: string) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/verification/documents', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update documents list
      const updatedDocuments = documents.filter(doc => doc.documentType !== documentType);
      updatedDocuments.push({
        id: result.document.id,
        documentType: result.document.documentType,
        fileName: result.document.fileName,
        fileUrl: result.document.fileUrl,
        status: result.document.status,
        uploadedAt: result.document.uploadedAt,
        fileSize: file.size
      });

      setDocuments(updatedDocuments);
      
      // Update verification status if needed
      const hasAllRequired = updatedDocuments.some(doc => doc.documentType === 'cnic_front') &&
                            updatedDocuments.some(doc => doc.documentType === 'cnic_back');
      
      if (hasAllRequired && verificationStatus === 'pending') {
        setVerificationStatus('under_review');
      }

      toast.success(`${documentType.replace('_', ' ').toUpperCase()} uploaded successfully`);
      
      // Refresh the page data
      router.refresh();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      throw error; // Re-throw to handle in upload component
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string, documentType: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/verification/documents?id=${documentId}&type=${documentType}`,
        {
          method: 'DELETE'
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      // Remove document from list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast.success('Document deleted successfully');
      
      // Refresh the page data
      router.refresh();

    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VerificationUpload
      documents={documents}
      verificationStatus={verificationStatus}
      onUpload={handleUpload}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
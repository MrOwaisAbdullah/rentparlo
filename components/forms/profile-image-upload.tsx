'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfileImageUploadProps {
  value?: string; // Current image URL
  onChange: (imageUrl: string | null) => void;
  onUpload?: (file: File) => Promise<string>; // Returns image URL
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  allowRemove?: boolean;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  placeholder?: string;
  error?: string;
}

const sizeConfig = {
  sm: {
    avatar: 'h-16 w-16',
    dropzone: 'h-24',
    text: 'text-xs'
  },
  md: {
    avatar: 'h-24 w-24',
    dropzone: 'h-32',
    text: 'text-sm'
  },
  lg: {
    avatar: 'h-32 w-32',
    dropzone: 'h-40',
    text: 'text-base'
  }
};

export function ProfileImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  size = 'md',
  allowRemove = true,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  placeholder = 'Upload profile image',
  error
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const config = sizeConfig[size];
  
  // Animation variants
  const dropzoneVariants = {
    idle: { scale: 1, borderColor: 'hsl(var(--border))' },
    dragOver: { scale: 1.02, borderColor: 'hsl(var(--primary))' },
    error: { 
      x: [-2, 2, -2, 2, 0], 
      borderColor: 'hsl(var(--destructive))',
      transition: { duration: 0.4 }
    }
  };
  
  const avatarVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
  };
  
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Please upload a valid image file (${acceptedFormats.map(f => f.split('/')[1]).join(', ')})`;
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }
    
    return null;
  };
  
  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    if (onUpload) {
      setIsUploading(true);
      try {
        const imageUrl = await onUpload(file);
        onChange(imageUrl);
        setPreview(null); // Clear preview since we have the final URL
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload image. Please try again.');
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload handler, just use the preview
      onChange(preview);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };
  
  const currentImage = value || preview;
  const hasError = error || uploadError;
  
  const getAnimationState = () => {
    if (hasError) return 'error';
    if (isDragOver) return 'dragOver';
    return 'idle';
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div
              key="image"
              variants={avatarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative inline-block"
            >
              <Avatar className={cn(config.avatar, 'ring-2 ring-border')}>
                <AvatarImage 
                  src={currentImage} 
                  alt="Profile" 
                  className="object-cover"
                />
                <AvatarFallback>
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              
              {/* Loading overlay */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </motion.div>
              )}
              
              {/* Action buttons */}
              {!isUploading && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 rounded-full p-0"
                    onClick={handleClick}
                    disabled={disabled}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  {allowRemove && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 rounded-full p-0"
                      onClick={handleRemove}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Success indicator */}
              {value && !isUploading && !hasError && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                >
                  <Check className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              variants={dropzoneVariants}
              animate={getAnimationState()}
              className={cn(
                'border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
                config.dropzone,
                'hover:bg-muted/50',
                isDragOver && 'bg-primary/5 border-primary',
                hasError && 'border-destructive bg-destructive/5',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className={cn(config.text, 'text-muted-foreground')}>
                      Uploading...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <Upload className={cn(
                      'text-muted-foreground',
                      size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10'
                    )} />
                    <div>
                      <p className={cn(config.text, 'font-medium')}>
                        {placeholder}
                      </p>
                      <p className={cn(config.text === 'text-xs' ? 'text-xs' : 'text-xs', 'text-muted-foreground mt-1')}>
                        Drag & drop or click to select
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max {maxSizeInMB}MB • {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Error display */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {hasError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
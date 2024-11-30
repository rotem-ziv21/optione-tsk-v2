import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from '../types';

interface FileUploadProps {
  onFileUpload: (attachment: Attachment) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileUpload, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);

      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);
      const fileId = uuidv4();
      
      const attachment: Attachment = {
        id: fileId,
        name: file.name,
        url: fileUrl,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        createdAt: new Date().toISOString(),
      };

      onFileUpload(attachment);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        
        <div className="flex flex-col items-center justify-center text-sm text-gray-600">
          <Upload className="w-8 h-8 mb-2 text-gray-400" />
          <p className="font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="text-center">
              <Loader2 className="w-6 h-6 mb-2 mx-auto animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-gray-900">Processing file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
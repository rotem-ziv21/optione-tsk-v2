import React from 'react';
import { FileText, Image, Link as LinkIcon, X, ExternalLink } from 'lucide-react';
import { Attachment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove: (attachmentId: string) => void;
}

export function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
  const getIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <Image size={16} />;
      case 'link':
        return <LinkIcon size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              {getIcon(attachment.type)}
              <span className="truncate">{attachment.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(attachment.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {attachments.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No attachments yet
        </p>
      )}
    </div>
  );
}
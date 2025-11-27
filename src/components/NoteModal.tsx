import { useState, useEffect } from 'react';
import { X, Paperclip, Trash2, Upload } from 'lucide-react';
import type { BoardItem, FileAttachment, ItemMetadata } from '@/types';
import { revokeObjectUrl } from '@/utils';
import { validateTextLength, validateFileSize, validateFileType, validateTags } from '@/utils/validation';
import { useNotification } from '@/contexts/NotificationContext';

interface NoteModalProps {
  item: BoardItem;
  onClose: () => void;
  onSave: (updates: Partial<BoardItem>) => void;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-200', border: 'border-pink-300' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-200', border: 'border-blue-300' },
  { name: 'Green', value: 'green', bg: 'bg-green-200', border: 'border-green-300' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-200', border: 'border-purple-300' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-200', border: 'border-orange-300' },
];

const THUMBTACK_COLORS = [
  { name: 'Red', value: 'red', bg: 'bg-red-600' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-600' },
  { name: 'Green', value: 'green', bg: 'bg-green-600' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-600' },
  { name: 'Black', value: 'black', bg: 'bg-black' },
];

export function NoteModal({ item, onClose, onSave }: NoteModalProps) {
  const notification = useNotification();
  const [content, setContent] = useState(item.content);
  const [color, setColor] = useState(item.color || 'yellow');
  const [thumbtackColor, setThumbtackColor] = useState(item.thumbtackColor || 'red');
  const [files, setFiles] = useState<FileAttachment[]>(item.files || []);
  const [metadata, setMetadata] = useState<ItemMetadata>(item.metadata || {});

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach((file) => revokeObjectUrl(file.url));
    };
  }, [files]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const validFiles: FileAttachment[] = [];

      for (const file of Array.from(uploadedFiles)) {
        // Validate file size
        const sizeValidation = validateFileSize(file.size);
        if (!sizeValidation.isValid) {
          notification.error('File upload failed', `${file.name}: ${sizeValidation.error}`);
          continue;
        }

        // Validate file type
        const typeValidation = validateFileType(file.type);
        if (!typeValidation.isValid) {
          notification.error('File upload failed', `${file.name}: ${typeValidation.error}`);
          continue;
        }

        validFiles.push({
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
        });
      }

      if (validFiles.length > 0) {
        setFiles([...files, ...validFiles]);
        notification.success('Files uploaded', `${validFiles.length} file(s) added successfully`);
      }
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove) {
      revokeObjectUrl(fileToRemove.url);
    }
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate content
    const contentValidation = validateTextLength(content, 1, 5000);
    if (!contentValidation.isValid) {
      notification.error('Validation error', contentValidation.error);
      return;
    }

    // Validate tags if present
    if (metadata.tags && metadata.tags.length > 0) {
      const tagsValidation = validateTags(metadata.tags);
      if (!tagsValidation.isValid) {
        notification.error('Validation error', tagsValidation.error);
        return;
      }
    }

    onSave({
      content,
      color,
      thumbtackColor,
      files,
      metadata,
    });

    notification.success('Note saved', 'Your changes have been saved successfully');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white">Edit Note</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Note Content */}
          <div>
            <label className="block text-neutral-300 mb-2">Note Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your note..."
            />
          </div>

          {/* Note Color */}
          <div>
            <label className="block text-neutral-300 mb-2">Note Color</label>
            <div className="flex gap-2 flex-wrap">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-12 h-12 rounded border-2 ${c.bg} ${c.border} ${
                    color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800' : ''
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Thumbtack Color */}
          <div>
            <label className="block text-neutral-300 mb-2">Thumbtack Color</label>
            <div className="flex gap-2 flex-wrap">
              {THUMBTACK_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setThumbtackColor(c.value)}
                  className={`w-10 h-10 rounded-full ${c.bg} ${
                    thumbtackColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800' : ''
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-neutral-300 mb-2">File Attachments</label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-neutral-700 rounded">
                  <Paperclip className="w-4 h-4 text-neutral-400" />
                  <span className="flex-1 text-neutral-300 truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-neutral-300 mb-2">Metadata (Optional)</label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={metadata.title || ''}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={metadata.tags?.join(', ') || ''}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value.split(',').map((t) => t.trim()) })}
                className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="date"
                value={metadata.date || ''}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

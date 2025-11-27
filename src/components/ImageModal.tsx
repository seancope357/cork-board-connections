import { useState, useEffect } from 'react';
import { X, Paperclip, Trash2, Upload, Wand2 } from 'lucide-react';
import type { BoardItem, FileAttachment, ItemMetadata } from '@/types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { revokeObjectUrl } from '@/utils';
import { validateUrl, validateFileSize, validateFileType, validateTags } from '@/utils/validation';
import { useNotification } from '@/contexts/NotificationContext';

interface ImageModalProps {
  item: BoardItem;
  onClose: () => void;
  onSave: (updates: Partial<BoardItem>) => void;
}

const THUMBTACK_COLORS = [
  { name: 'Red', value: 'red', bg: 'bg-red-600' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-600' },
  { name: 'Green', value: 'green', bg: 'bg-green-600' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-600' },
  { name: 'Black', value: 'black', bg: 'bg-black' },
];

export function ImageModal({ item, onClose, onSave }: ImageModalProps) {
  const notification = useNotification();
  const [imageUrl, setImageUrl] = useState(item.content);
  const [thumbtackColor, setThumbtackColor] = useState(item.thumbtackColor || 'blue');
  const [files, setFiles] = useState<FileAttachment[]>(item.files || []);
  const [metadata, setMetadata] = useState<ItemMetadata>(
    item.metadata || {
      title: '',
      description: '',
      tags: [],
      date: '',
      location: '',
    }
  );

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach((file) => revokeObjectUrl(file.url));
    };
  }, [files]);

  const extractMetadata = () => {
    // Simulate metadata extraction from image
    const simulatedMetadata: ItemMetadata = {
      title: metadata.title || 'Evidence Photo',
      description: metadata.description || 'Extracted from image analysis',
      tags: ['evidence', 'photo', 'important'],
      date: new Date().toISOString().split('T')[0],
      location: 'Coordinates: 40.7128°N, 74.0060°W',
      dimensions: '1920x1080',
      fileSize: '2.4 MB',
      camera: 'Canon EOS R5',
      iso: '400',
      aperture: 'f/2.8',
      shutterSpeed: '1/250s',
    };
    setMetadata(simulatedMetadata);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const validFiles: FileAttachment[] = [];

      for (const file of Array.from(uploadedFiles)) {
        const sizeValidation = validateFileSize(file.size);
        if (!sizeValidation.isValid) {
          notification.error('File upload failed', `${file.name}: ${sizeValidation.error}`);
          continue;
        }

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
    // Validate URL
    const urlValidation = validateUrl(imageUrl);
    if (!urlValidation.isValid) {
      notification.error('Validation error', urlValidation.error);
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
      content: imageUrl,
      thumbtackColor,
      files,
      metadata,
    });

    notification.success('Image saved', 'Your changes have been saved successfully');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-white">Edit Image Evidence</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <div>
            <label className="block text-neutral-300 mb-2">Image Preview</label>
            <div className="bg-white p-4 rounded inline-block">
              <ImageWithFallback
                src={imageUrl}
                alt="Evidence"
                className="w-full max-w-md h-auto object-cover"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-neutral-300 mb-2">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter image URL..."
            />
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
            <label className="block text-neutral-300 mb-2">Related Files</label>
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
                <span>Add Related Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-neutral-300">Image Metadata</label>
              <button
                onClick={extractMetadata}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Extract
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title"
                value={metadata.title || ''}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={metadata.location || ''}
                onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={metadata.tags?.join(', ') || ''}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value.split(',').map((t) => t.trim()) })}
                className="col-span-2 px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={metadata.description || ''}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                className="col-span-2 px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={metadata.date || ''}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Dimensions"
                value={typeof metadata.dimensions === 'string' ? metadata.dimensions : ''}
                onChange={(e) => setMetadata({ ...metadata, dimensions: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Camera Model"
                value={typeof metadata.camera === 'string' ? metadata.camera : ''}
                onChange={(e) => setMetadata({ ...metadata, camera: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="ISO"
                value={typeof metadata.iso === 'string' ? metadata.iso : ''}
                onChange={(e) => setMetadata({ ...metadata, iso: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Aperture (f-stop)"
                value={typeof metadata.aperture === 'string' ? metadata.aperture : ''}
                onChange={(e) => setMetadata({ ...metadata, aperture: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Shutter Speed"
                value={typeof metadata.shutterSpeed === 'string' ? metadata.shutterSpeed : ''}
                onChange={(e) => setMetadata({ ...metadata, shutterSpeed: e.target.value })}
                className="px-3 py-2 bg-neutral-700 text-white border border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

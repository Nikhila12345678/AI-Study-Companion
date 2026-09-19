import mongoose from 'mongoose';

const STATUSES = [
  'UPLOADED', 'QUEUED', 'PROCESSING', 'EXTRACTING', 'CHUNKING',
  'EXTRACTING_CONCEPTS', 'INDEXING', 'READY', 'FAILED'
];

const materialSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    status: { type: String, enum: STATUSES, default: 'UPLOADED', index: true },
    statusMessage: { type: String, default: '' },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    conceptCount: { type: Number, default: 0 },
    failureReason: { type: String, default: null }
  },
  { timestamps: true }
);

materialSchema.index({ projectId: 1, createdAt: -1 });

export const MATERIAL_STATUSES = STATUSES;
export default mongoose.model('Material', materialSchema);

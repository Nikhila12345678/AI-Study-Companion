import mongoose from 'mongoose';

const spaceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#6D5EF5' },
    icon: { type: String, default: 'sparkles' }
  },
  { timestamps: true }
);

spaceSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Space', spaceSchema);

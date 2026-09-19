import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['learner', 'admin'], default: 'learner' }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return { id: this._id, name: this.name, email: this.email, role: this.role, createdAt: this.createdAt };
};

export default mongoose.model('User', userSchema);

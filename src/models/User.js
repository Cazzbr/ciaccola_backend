import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: { 
    type: String, 
    unique: true,
    sparse: true,  // Allows multiple null values
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6 },
  pubkey: String,
  fcm_token: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  last_seen: { type: Date, default: Date.now },
  contacts: [{
    contact_username: String,
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' }
  }]
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.hasEmailRecovery = function() {
  return !!this.email;
};

export default mongoose.model('User', userSchema);

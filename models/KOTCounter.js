// models/KOTCounter.js
import mongoose from 'mongoose';

const kotCounterSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

const KOTCounter = mongoose.model('KOTCounter', kotCounterSchema);
export default KOTCounter;

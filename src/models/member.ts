
import mongoose, { Document, Schema, Model } from 'mongoose';
import type { MemberStatus } from '@/types';

export interface IMember extends Document {
  name: string;
  phone: string;
  aadharNumber?: string;
  dueDate: Date;
  seatingHours: number;
  feesPaid: number;
  paymentDate: Date;
  status: MemberStatus;
  avatarUrl: string;
  seatNumber: string;
  isSeatReserved: boolean;
  deletedAt?: Date | null;
}

const MemberSchema: Schema<IMember> = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  aadharNumber: { type: String },
  dueDate: { type: Date, required: true },
  seatingHours: { type: Number, required: true },
  feesPaid: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  status: { type: String, required: true, enum: ['Active', 'Expiring Soon', 'Expired'] },
  avatarUrl: { type: String, required: true },
  seatNumber: { type: String, default: '' },
  isSeatReserved: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

const MemberModel: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default MemberModel;

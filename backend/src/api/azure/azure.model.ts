import mongoose, { Document, Schema } from 'mongoose';

export interface VisionDocument extends Document {
    fileName: string;
    language: string;
    description: string;
    tags: string[];
}

const visionSchema = new Schema<VisionDocument>({
    fileName: { type: String, required: true },
    language: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], required: true }
});

visionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        delete ret._id;
    }
});

visionSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        delete ret._id;
    }
});

export const visionModel = mongoose.model<VisionDocument>('Vision', visionSchema);

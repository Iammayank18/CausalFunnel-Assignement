import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  session_id: string;
  event_type: 'page_view' | 'click';
  url: string;
  timestamp: Date;
  x?: number;
  y?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

const EventSchema: Schema = new Schema({
  session_id: { type: String, required: true, index: true },
  event_type: { type: String, enum: ['page_view', 'click'], required: true },
  url: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  x: { type: Number },
  y: { type: Number },
  viewportWidth: { type: Number },
  viewportHeight: { type: Number }
});

// Compound index for heatmap querying
EventSchema.index({ event_type: 1, url: 1 });

// Avoid recompiling model in dev mode
export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

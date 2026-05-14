export type Session = {
  _id: string;
  totalEvents: number;
  firstEvent: string;
  lastEvent: string;
};

export type Event = {
  _id: string;
  session_id: string;
  event_type: 'page_view' | 'click';
  url: string;
  timestamp: string;
  x?: number;
  y?: number;
  viewportWidth?: number;
  viewportHeight?: number;
};


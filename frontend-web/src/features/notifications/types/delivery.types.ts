export type Delivery = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  attempts: number;
  errorCode?: string;
  providerMessageId?: string;
  createdAt: string;
  nextAttemptAt?: string;
  sentAt?: string;
};
export type DeliveryPage = {
  items: Delivery[];
  totalElements: number;
  totalPages: number;
};
export type DeliveryControls = {
  paused: boolean;
  dailyLimit: number;
  usedLast24Hours: number;
};
export type DeliverySummary = {
  enabled: boolean;
  provider: string;
  counts: Record<string, number>;
  controls: DeliveryControls;
  metrics?: {
    oldestPendingSeconds: number | null;
    averageAcceptanceSeconds24Hours: number | null;
  };
};

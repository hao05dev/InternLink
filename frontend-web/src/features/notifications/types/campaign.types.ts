export type CampaignRequest = {
  termId: string;
  requestKey: string;
  purpose: string;
  audience: string;
  subject: string;
  body: string;
  channel: string;
};
export type CampaignRecipient = {
  id?: string;
  email: string;
  displayName: string;
  studentCode?: string;
  status: string;
  errorCode?: string;
  emailStatus?: string;
};
export type CampaignPreview = {
  total: number;
  withAccount: number;
  emailEligible: number;
  sample: CampaignRecipient[];
};
export type Campaign = {
  id: string;
  termId: string;
  subject: string;
  purpose: string;
  channel: string;
  status: string;
  createdAt: string;
  counts: Record<string, number>;
};
export type CampaignDetail = {
  campaign: Campaign;
  recipients: CampaignRecipient[];
  totalRecipients: number;
  totalPages: number;
};
export type CampaignPage = {
  items: Campaign[];
  totalElements: number;
  totalPages: number;
};

export type MessageEntry = {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderRole: string;
  senderName: string;
  receiverRole: string;
  receiverName: string;
};

export type MessageCursor = {
  sentAt: string;
  id: string;
};

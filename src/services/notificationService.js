import { createNotification, markNotificationRead } from './workflowRepository.js';

export async function notifyWorkflowRecipient(notification) {
  return createNotification(notification);
}

export async function markWorkflowNotificationRead(notificationId, readerUserId = null) {
  return markNotificationRead(notificationId, readerUserId);
}

// ============================================================================
// Notification Processor
// ============================================================================

// parking-management-system/backend/src/workers/notification.processor.js

import { Expo } from 'expo-server-sdk';
import { logger } from '../utils/logger';
import { config } from '../config';
import { NotificationService } from '../services/notification.service';

const expo = new Expo();

export const processNotification = async (job) => {
    const { tokens, title, body, data } = job.data;

    logger.info(`Processing notification job ${job.id} for ${tokens.length} devices`);

    try {
        // Create messages
        const messages = tokens
            .filter(token => Expo.isExpoPushToken(token))
            .map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data,
                priority: 'high',
            }));

        // Send notifications
        const chunks = expo.chunkPushNotifications(messages);
        const receipts = [];

        for (const chunk of chunks) {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            receipts.push(...ticketChunk);
        }

        // Handle receipts
        await handleReceipts(receipts);

        logger.info(`Notification job ${job.id} completed successfully`);
        return { success: true, sent: messages.length };
    } catch (error) {
        logger.error(`Notification job ${job.id} failed: ${error.message}`);
        throw error;
    }
};

async function handleReceipts(receipts) {
    const receiptIds = receipts
        .filter(receipt => receipt.status === 'ok')
        .map(receipt => receipt.id);

    if (receiptIds.length > 0) {
        const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        for (const chunk of receiptIdChunks) {
            const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            // Process receipts
            for (const [id, receipt] of Object.entries(receipts)) {
                if (receipt.status === 'error') {
                    logger.error(`Notification receipt error: ${receipt.message}`);
                }
            }
        }
    }
}
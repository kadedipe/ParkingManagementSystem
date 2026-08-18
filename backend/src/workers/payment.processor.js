// ============================================================================
// Payment Processor
// ============================================================================

// parking-management-system/backend/src/workers/payment.processor.js

import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { config } from '../config';

const stripe = new Stripe(config.stripe.secretKey);

export const processPayment = async (job) => {
    const { paymentId, amount, currency, paymentMethodId, bookingId } = job.data;

    logger.info(`Processing payment job ${job.id} for ${paymentId}`);

    try {
        // Process payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            return_url: `${config.app.url}/payment/confirm`,
            metadata: {
                paymentId,
                bookingId,
            },
        });

        // Update payment status
        await updatePaymentStatus(paymentId, paymentIntent);

        logger.info(`Payment job ${job.id} completed successfully`);
        return { success: true, paymentIntent };
    } catch (error) {
        logger.error(`Payment job ${job.id} failed: ${error.message}`);
        throw error;
    }
};

async function updatePaymentStatus(paymentId, paymentIntent) {
    // Update payment in database
    // This would update the payment record with the payment intent status
}
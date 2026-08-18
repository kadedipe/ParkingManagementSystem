// ============================================================================
// Worker Processors - Job Processing Functions
// ============================================================================

// parking-management-system/backend/src/workers/email.processor.js

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { config } from '../config';

// Email transporter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

export const processEmail = async (job) => {
    const { to, subject, template, data } = job.data;

    logger.info(`Processing email job ${job.id} for ${to}`);

    try {
        // Get email template
        const html = await getEmailTemplate(template, data);

        // Send email
        await transporter.sendMail({
            from: config.email.from,
            to,
            subject,
            html,
        });

        logger.info(`Email job ${job.id} completed successfully`);
        return { success: true, to };
    } catch (error) {
        logger.error(`Email job ${job.id} failed: ${error.message}`);
        throw error;
    }
};

async function getEmailTemplate(template, data) {
    // Load and render template
    // This would use a template engine like handlebars or ejs
    return `<html><body><h1>${template}</h1><p>${JSON.stringify(data)}</p></body></html>`;
}
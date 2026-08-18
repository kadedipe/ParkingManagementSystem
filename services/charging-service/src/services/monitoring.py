import logging

logger = logging.getLogger(__name__)

class MonitoringService:
    async def start(self):
        logger.info("Monitoring service started")

    async def stop(self):
        logger.info("Monitoring service stopped")

monitoring_service = MonitoringService()
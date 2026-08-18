import logging
from typing import Optional, Dict, Any
from ocpp.v16 import ChargePoint
from ocpp.v16.enums import Action, RegistrationStatus
import asyncio

logger = logging.getLogger(__name__)

class OCPPService:
    def __init__(self):
        self.charge_points: Dict[str, ChargePoint] = {}
        self.connected = False
        self.transactions: Dict[str, Dict] = {}
    
    async def initialize(self):
        self.connected = True
        logger.info("OCPP service initialized")
    
    async def shutdown(self):
        self.connected = False
        for cp_id, cp in self.charge_points.items():
            try:
                await cp.disconnect()
            except:
                pass
        self.charge_points.clear()
        logger.info("OCPP service stopped")
    
    def is_connected(self) -> bool:
        return self.connected
    
    async def register_charge_point(self, charge_point_id: str, websocket) -> Dict[str, Any]:
        try:
            cp = ChargePoint(charge_point_id, websocket)
            self.charge_points[charge_point_id] = cp
            logger.info(f"Charge point {charge_point_id} registered")
            return {
                "success": True,
                "charge_point_id": charge_point_id,
                "status": "registered"
            }
        except Exception as e:
            logger.error(f"Failed to register charge point: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def start_transaction(
        self,
        charge_point_id: str,
        connector_id: int,
        id_tag: str,
        meter_start: int = 0
    ) -> Dict[str, Any]:
        try:
            cp = self.charge_points.get(charge_point_id)
            if not cp:
                return {"success": False, "error": "Charge point not found"}
            
            transaction_id = f"tx_{charge_point_id}_{id_tag}_{connector_id}"
            self.transactions[transaction_id] = {
                "charge_point_id": charge_point_id,
                "connector_id": connector_id,
                "id_tag": id_tag,
                "meter_start": meter_start,
                "start_time": datetime.utcnow()
            }
            return {
                "success": True,
                "transaction_id": transaction_id,
                "charge_point_id": charge_point_id,
                "connector_id": connector_id,
                "id_tag": id_tag,
                "meter_start": meter_start
            }
        except Exception as e:
            logger.error(f"Failed to start transaction: {e}")
            return {"success": False, "error": str(e)}
    
    async def stop_transaction(
        self,
        charge_point_id: str,
        transaction_id: str,
        meter_stop: int,
        id_tag: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            cp = self.charge_points.get(charge_point_id)
            if not cp:
                return {"success": False, "error": "Charge point not found"}
            
            transaction = self.transactions.get(transaction_id)
            if transaction:
                transaction["meter_stop"] = meter_stop
                transaction["end_time"] = datetime.utcnow()
                transaction["duration"] = (transaction["end_time"] - transaction["start_time"]).total_seconds()
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "charge_point_id": charge_point_id,
                "meter_stop": meter_stop,
                "id_tag": id_tag
            }
        except Exception as e:
            logger.error(f"Failed to stop transaction: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        transaction = self.transactions.get(transaction_id)
        if not transaction:
            return {"success": False, "error": "Transaction not found"}
        return {
            "success": True,
            "transaction": transaction
        }

ocpp_service = OCPPService()
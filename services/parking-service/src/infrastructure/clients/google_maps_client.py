# ============================================================================
# Infrastructure - External API Clients
# ============================================================================

# parking-management-system/services/parking-service/src/infrastructure/clients/google_maps_client.py

from typing import Optional, Dict, Any, List
import httpx
from datetime import datetime

from src.core.config import settings
from src.core.logging import get_logger
from src.domain.value_objects import Location, Address

logger = get_logger(__name__)

class GoogleMapsClient:
    """Google Maps API client"""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api"
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def geocode_address(self, address: str) -> Optional[Location]:
        """Geocode an address to coordinates"""
        try:
            response = await self.client.get(
                f"{self.base_url}/geocode/json",
                params={
                    "address": address,
                    "key": self.api_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK":
                location = data["results"][0]["geometry"]["location"]
                return Location(
                    latitude=location["lat"],
                    longitude=location["lng"],
                )
            else:
                logger.error(f"Geocoding failed: {data['status']}")
                return None
                
        except Exception as e:
            logger.error(f"Geocoding error: {str(e)}")
            return None
    
    async def reverse_geocode(
        self,
        location: Location,
    ) -> Optional[Address]:
        """Reverse geocode coordinates to address"""
        try:
            response = await self.client.get(
                f"{self.base_url}/geocode/json",
                params={
                    "latlng": f"{location.latitude},{location.longitude}",
                    "key": self.api_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK":
                result = data["results"][0]
                address_components = result["address_components"]
                
                address_data = {}
                for component in address_components:
                    types = component["types"]
                    if "street_number" in types:
                        address_data["street_number"] = component["long_name"]
                    elif "route" in types:
                        address_data["route"] = component["long_name"]
                    elif "locality" in types:
                        address_data["city"] = component["long_name"]
                    elif "administrative_area_level_1" in types:
                        address_data["state"] = component["short_name"]
                    elif "country" in types:
                        address_data["country"] = component["long_name"]
                    elif "postal_code" in types:
                        address_data["postal_code"] = component["long_name"]
                
                street = f"{address_data.get('street_number', '')} {address_data.get('route', '')}".strip()
                
                return Address(
                    street=street or "Unknown",
                    city=address_data.get("city", "Unknown"),
                    state=address_data.get("state", "Unknown"),
                    country=address_data.get("country", "Unknown"),
                    postal_code=address_data.get("postal_code", "Unknown"),
                    formatted=result["formatted_address"],
                )
            else:
                logger.error(f"Reverse geocoding failed: {data['status']}")
                return None
                
        except Exception as e:
            logger.error(f"Reverse geocoding error: {str(e)}")
            return None
    
    async def get_distance_matrix(
        self,
        origins: List[Location],
        destinations: List[Location],
    ) -> List[List[Dict[str, Any]]]:
        """Get distance matrix between origins and destinations"""
        try:
            origin_str = "|".join([
                f"{loc.latitude},{loc.longitude}" for loc in origins
            ])
            dest_str = "|".join([
                f"{loc.latitude},{loc.longitude}" for loc in destinations
            ])
            
            response = await self.client.get(
                f"{self.base_url}/distancematrix/json",
                params={
                    "origins": origin_str,
                    "destinations": dest_str,
                    "key": self.api_key,
                    "units": "imperial",
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK":
                return data["rows"]
            else:
                logger.error(f"Distance matrix failed: {data['status']}")
                return []
                
        except Exception as e:
            logger.error(f"Distance matrix error: {str(e)}")
            return []
    
    async def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get place details by place ID"""
        try:
            response = await self.client.get(
                f"{self.base_url}/place/details/json",
                params={
                    "place_id": place_id,
                    "key": self.api_key,
                    "fields": "name,formatted_address,geometry,formatted_phone_number,website,rating,reviews,opening_hours,photos",
                },
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK":
                return data["result"]
            else:
                logger.error(f"Place details failed: {data['status']}")
                return None
                
        except Exception as e:
            logger.error(f"Place details error: {str(e)}")
            return None
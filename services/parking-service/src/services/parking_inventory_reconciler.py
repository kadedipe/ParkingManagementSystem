import logging

from sqlalchemy import select

from src.core.database import AsyncSessionLocal
from src.domain.models.parking_lot import ParkingLot
from src.domain.models.parking_spot import ParkingSpot, ParkingSpotStatus

logger = logging.getLogger(__name__)


async def reconcile_parking_inventory() -> None:
    """Ensure parking-lot capacity metadata has matching spot records.

    Older/partial frontend writes could create a ParkingLot successfully and then fail
    while creating its ParkingSpot rows. This startup reconciliation repairs those
    orphaned capacity records and re-synchronizes availability counters.
    """
    async with AsyncSessionLocal() as session:
        lots_result = await session.execute(select(ParkingLot))
        lots = list(lots_result.scalars().all())
        repaired_spots = 0

        for lot in lots:
            spots_result = await session.execute(
                select(ParkingSpot)
                .where(ParkingSpot.parking_lot_id == lot.id)
                .order_by(ParkingSpot.number)
            )
            spots = list(spots_result.scalars().all())

            # Never discard existing physical inventory. If more spot rows exist than
            # the configured capacity, the concrete inventory becomes authoritative.
            if len(spots) > lot.total_spots:
                lot.total_spots = len(spots)

            missing_count = max(0, lot.total_spots - len(spots))
            if missing_count:
                existing_numbers = {spot.number for spot in spots}
                next_number = 1

                for _ in range(missing_count):
                    while f"P-{next_number:03d}" in existing_numbers:
                        next_number += 1

                    number = f"P-{next_number:03d}"
                    spot = ParkingSpot(
                        parking_lot_id=lot.id,
                        number=number,
                        level=1,
                        type="standard",
                        status=ParkingSpotStatus.AVAILABLE,
                    )
                    session.add(spot)
                    spots.append(spot)
                    existing_numbers.add(number)
                    repaired_spots += 1
                    next_number += 1

            lot.available_spots = sum(
                1 for spot in spots if spot.status == ParkingSpotStatus.AVAILABLE
            )
            lot.reserved_spots = sum(
                1 for spot in spots if spot.status == ParkingSpotStatus.RESERVED
            )

        await session.commit()

        if repaired_spots:
            logger.warning(
                "Reconciled parking inventory by creating %s missing spot record(s)",
                repaired_spots,
            )
        else:
            logger.info("Parking inventory reconciliation found no missing spot records")

# Reservation workflow

1. Open **Find Parking** and choose an available spot.
2. Use the **Reserve** action to open the booking form.
3. Select date, time and duration, then complete the booking steps.
4. The reservation is persisted through `/reservations` and confirmed through `/reservations/{id}/confirm`.
5. Open `/calendar` or `/parking/reservations` to filter persisted reservations by date and status.
6. Confirmed future reservations appear in the Dashboard **Upcoming Reservations** section.

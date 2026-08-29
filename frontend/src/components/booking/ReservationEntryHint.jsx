import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ReservationEntryHint() {
  const navigate = useNavigate();
  return (
    <Alert
      severity="info"
      action={
        <Stack direction="row" spacing={1}>
          <Button color="inherit" size="small" startIcon={<CalendarIcon />} onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
        </Stack>
      }
    >
      To create an upcoming reservation, choose an available parking spot and use its Reserve action. Date, time, duration, vehicle and confirmation fields open in the booking form.
    </Alert>
  );
}

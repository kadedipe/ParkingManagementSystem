// ============================================================================
// VehicleDetails Component
// ============================================================================

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  Stack,
  Avatar,
  Paper,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  ElectricCar as EvIcon,
  LocalGasStation as FuelIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  DoorFront as DoorIcon,
  Straighten as SizeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDate } from '../../utils/formatters';

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export const VehicleDetails = ({ vehicle, onEdit, onDelete }) => {
  if (!vehicle) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Vehicle Information
          </Typography>
          <InfoRow>
            <CarIcon color="action" />
            <Typography variant="body2">
              <strong>Make & Model:</strong> {vehicle.make} {vehicle.model}
            </Typography>
          </InfoRow>
          <InfoRow>
            <CarIcon color="action" />
            <Typography variant="body2">
              <strong>License Plate:</strong> {vehicle.license_plate}
            </Typography>
          </InfoRow>
          <InfoRow>
            <CalendarIcon color="action" />
            <Typography variant="body2">
              <strong>Year:</strong> {vehicle.year}
            </Typography>
          </InfoRow>
          <InfoRow>
            <FuelIcon color="action" />
            <Typography variant="body2">
              <strong>Fuel Type:</strong> {vehicle.fuel_type}
            </Typography>
          </InfoRow>
          <InfoRow>
            <SpeedIcon color="action" />
            <Typography variant="body2">
              <strong>Vehicle Type:</strong> {vehicle.vehicle_type}
            </Typography>
          </InfoRow>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Specifications
          </Typography>
          {vehicle.engine_size && (
            <InfoRow>
              <SpeedIcon color="action" />
              <Typography variant="body2">
                <strong>Engine Size:</strong> {vehicle.engine_size}L
              </Typography>
            </InfoRow>
          )}
          {vehicle.horsepower && (
            <InfoRow>
              <SpeedIcon color="action" />
              <Typography variant="body2">
                <strong>Horsepower:</strong> {vehicle.horsepower} HP
              </Typography>
            </InfoRow>
          )}
          {vehicle.weight_kg && (
            <InfoRow>
              <SizeIcon color="action" />
              <Typography variant="body2">
                <strong>Weight:</strong> {vehicle.weight_kg} kg
              </Typography>
            </InfoRow>
          )}
          {vehicle.number_of_doors && (
            <InfoRow>
              <DoorIcon color="action" />
              <Typography variant="body2">
                <strong>Doors:</strong> {vehicle.number_of_doors}
              </Typography>
            </InfoRow>
          )}
          {vehicle.number_of_seats && (
            <InfoRow>
              <PeopleIcon color="action" />
              <Typography variant="body2">
                <strong>Seats:</strong> {vehicle.number_of_seats}
              </Typography>
            </InfoRow>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Status & Registration
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip
              label={vehicle.status}
              color={vehicle.status === 'active' ? 'success' : 'default'}
            />
            {vehicle.is_ev_charging_compatible && (
              <Chip
                icon={<EvIcon />}
                label="EV Compatible"
                color="info"
              />
            )}
            {vehicle.has_permit && (
              <Chip
                label={`Permit: ${vehicle.permit_number || 'Yes'}`}
                color="warning"
              />
            )}
          </Stack>
          {vehicle.registration_expiry && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Registration Expiry:</strong> {formatDate(vehicle.registration_expiry)}
            </Typography>
          )}
          {vehicle.insurance_expiry && (
            <Typography variant="body2">
              <strong>Insurance Expiry:</strong> {formatDate(vehicle.insurance_expiry)}
            </Typography>
          )}
        </Grid>

        {vehicle.notes && (
          <Grid item xs={12}>
            <Divider />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.notes}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default VehicleDetails;
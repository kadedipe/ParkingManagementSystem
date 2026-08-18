// ============================================================================
// Common Components Usage Examples
// ============================================================================

// parking-management-system/mobile/src/components/common/Examples.js

import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Container,
  Row,
  Col,
  Spacer,
  Divider,
  Alert,
  Badge,
  Chip,
  EmptyState,
  Avatar,
  Rating,
  ProgressBar,
  PriceTag,
  Button,
} from './index';

const CommonComponentsExample = () => {
  const [rating, setRating] = useState(4);
  const [progress, setProgress] = useState(65);

  return (
    <Container scrollable>
      <Text style={styles.header}>Common Components</Text>

      {/* Layout Components */}
      <Text style={styles.sectionTitle}>Layout Components</Text>
      <Row>
        <Col>
          <View style={styles.box}><Text>Col 1</Text></View>
        </Col>
        <Col>
          <View style={styles.box}><Text>Col 2</Text></View>
        </Col>
        <Col>
          <View style={styles.box}><Text>Col 3</Text></View>
        </Col>
      </Row>
      <Spacer size={16} />
      <Divider />

      {/* Alert Components */}
      <Text style={styles.sectionTitle}>Alerts</Text>
      <Alert type="success" title="Success!" message="Operation completed successfully" />
      <Spacer size={8} />
      <Alert type="error" message="Something went wrong. Please try again." />
      <Spacer size={8} />
      <Alert type="warning" message="Please review your booking details." />
      <Spacer size={8} />
      <Alert type="info" message="New parking spots available nearby." />

      {/* Badge Components */}
      <Text style={styles.sectionTitle}>Badges</Text>
      <Row spacing={8}>
        <Badge text="Primary" variant="primary" />
        <Badge text="Success" variant="success" />
        <Badge text="Error" variant="danger" />
        <Badge text="Warning" variant="warning" />
        <Badge text="Info" variant="info" />
      </Row>
      <Spacer size={8} />
      <Row spacing={8}>
        <Badge text="Outline" variant="outline" />
        <Badge text="Rounded" rounded />
        <Badge dot variant="success" />
        <Badge dot variant="danger" />
      </Row>

      {/* Chip Components */}
      <Text style={styles.sectionTitle}>Chips</Text>
      <Row spacing={8} wrap>
        <Chip label="Parking" onPress={() => {}} />
        <Chip label="EV Charging" selected />
        <Chip label="Premium" variant="outline" />
        <Chip label="Remove" onClose={() => {}} />
      </Row>

      {/* Avatar Components */}
      <Text style={styles.sectionTitle}>Avatars</Text>
      <Row spacing={16}>
        <Avatar size="small" name="John Doe" />
        <Avatar size="medium" name="Jane Smith" />
        <Avatar size="large" name="Alice Johnson" />
        <Avatar size="large" name="Bob Wilson" showStatus statusColor="success" />
      </Row>

      {/* Rating Component */}
      <Text style={styles.sectionTitle}>Rating</Text>
      <Rating rating={4.5} size="large" />
      <Spacer size={8} />
      <Rating 
        rating={rating} 
        interactive 
        onRatingChange={setRating}
        size="large"
      />

      {/* Progress Bar */}
      <Text style={styles.sectionTitle}>Progress Bar</Text>
      <ProgressBar progress={progress} max={100} />
      <Spacer size={8} />
      <ProgressBar 
        progress={progress} 
        color={COLORS.success}
        labelPosition="above"
      />
      <Spacer size={8} />
      <ProgressBar 
        progress={progress} 
        color={COLORS.danger}
        labelFormat="fraction"
        labelPosition="below"
      />

      {/* Price Tag */}
      <Text style={styles.sectionTitle}>Price Tags</Text>
      <Row spacing={12}>
        <PriceTag amount={25.00} period="/day" />
        <PriceTag amount={15.50} variant="outlined" />
        <PriceTag amount={12.00} variant="filled" color={COLORS.success} />
        <PriceTag amount={30.00} strikethrough color={COLORS.gray500} />
      </Row>

      {/* Empty State */}
      <Text style={styles.sectionTitle}>Empty State</Text>
      <EmptyState
        title="No Bookings Yet"
        description="Start by booking your first parking spot"
        icon={<Feather name="calendar" size={64} color={COLORS.gray300} />}
        buttonTitle="Book Now"
        onButtonPress={() => {}}
      />

      <Spacer size={40} />
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  box: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});

export default CommonComponentsExample;
// ============================================================================
// Card Usage Examples - How to use Card Components
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/Example.js

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardMedia,
  CardDivider,
  CardAction,
  StatCard,
  ParkingCard,
  VehicleCard,
} from './index';

const CardExample = () => {
  const handlePress = () => {
    console.log('Card pressed!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Basic Card</Text>
      <Card>
        <CardContent>
          <Text style={styles.contentText}>
            This is a basic card with default styling.
          </Text>
        </CardContent>
      </Card>

      <Text style={styles.sectionTitle}>Elevated Card</Text>
      <Card variant="elevated">
        <CardContent>
          <Text style={styles.contentText}>
            This card has elevation/shadow for depth.
          </Text>
        </CardContent>
      </Card>

      <Text style={styles.sectionTitle}>Outlined Card</Text>
      <Card variant="outlined">
        <CardContent>
          <Text style={styles.contentText}>
            This card has a border outline.
          </Text>
        </CardContent>
      </Card>

      <Text style={styles.sectionTitle}>Card with Header and Footer</Text>
      <Card>
        <CardHeader
          title="Card Title"
          subtitle="Card Subtitle"
          rightIcon={<Feather name="more-horizontal" size={20} color="#999" />}
        />
        <CardContent>
          <Text style={styles.contentText}>
            This card has a header with title and subtitle.
          </Text>
        </CardContent>
        <CardFooter>
          <Text style={styles.footerText}>Footer Content</Text>
          <CardAction
            label="Action"
            onPress={handlePress}
            variant="text"
          />
        </CardFooter>
      </Card>

      <Text style={styles.sectionTitle}>Card with Media</Text>
      <Card>
        <CardMedia
          source={{ uri: 'https://picsum.photos/400/200' }}
          aspectRatio={16 / 9}
        />
        <CardContent>
          <Text style={styles.contentText}>
            This card includes an image/media section.
          </Text>
        </CardContent>
      </Card>

      <Text style={styles.sectionTitle}>Pressable Card</Text>
      <Card
        pressable={true}
        onPress={handlePress}
      >
        <CardContent>
          <Text style={styles.contentText}>
            Tap me! This card is pressable.
          </Text>
        </CardContent>
      </Card>

      <Text style={styles.sectionTitle}>Stat Cards</Text>
      <View style={styles.row}>
        <StatCard
          title="Bookings"
          value="24"
          subtitle="This month"
          icon={<Feather name="calendar" size={24} color={COLORS.primary} />}
          color={COLORS.primary}
          trend="up"
          trendValue="12%"
          style={styles.statCard}
        />
        <StatCard
          title="Vehicles"
          value="3"
          subtitle="Registered"
          icon={<Feather name="truck" size={24} color={COLORS.success} />}
          color={COLORS.success}
          style={styles.statCard}
        />
      </View>

      <Text style={styles.sectionTitle}>Parking Card</Text>
      <ParkingCard
        name="Downtown Parking"
        address="123 Main St, City"
        distance="0.3 km"
        price="$5.00/hr"
        availableSpots={8}
        totalSpots={20}
        rating={4.5}
        status="available"
        onBookPress={handlePress}
      />

      <Text style={styles.sectionTitle}>Vehicle Card</Text>
      <VehicleCard
        name="Tesla Model 3"
        plateNumber="ABC-1234"
        type="car"
        color="White"
        isDefault={true}
        onEditPress={handlePress}
        onDeletePress={handlePress}
      />

      <Text style={styles.sectionTitle}>Card with Actions</Text>
      <Card>
        <CardContent>
          <Text style={styles.contentText}>
            This card has multiple action buttons.
          </Text>
        </CardContent>
        <CardDivider />
        <CardFooter>
          <CardAction
            label="Primary"
            onPress={handlePress}
            variant="contained"
          />
          <CardAction
            label="Secondary"
            onPress={handlePress}
            variant="outlined"
          />
          <CardAction
            label="Text"
            onPress={handlePress}
            variant="text"
          />
        </CardFooter>
      </Card>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  spacer: {
    height: 40,
  },
});

export default CardExample;
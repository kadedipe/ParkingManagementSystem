// ============================================================================
// ChargingSessionScreen - Active Charging Session Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Charging/ChargingSessionScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Button, Badge, ProgressBar } from '../../components';
import { useCharging } from '../../hooks';

const ChargingSessionScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.CHARGING.SESSION>['navigation']>();
  const route = useRoute<MainScreenProps<typeof ROUTES.CHARGING.SESSION>['route']>();
  const { sessionId } = route.params || {};

  const { currentSession, loading, pauseSession, resumeSession, stopSession } = useCharging();

  const [isPaused, setIsPaused] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [energyUsed, setEnergyUsed] = useState(0);
  const [cost, setCost] = useState(0);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSession();
    startPulseAnimation();
    const interval = setInterval(updateSession, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadSession = async () => {
    try {
      // Load session data
      setBatteryLevel(65);
      setTimeElapsed(120);
      setEnergyUsed(4.5);
      setCost(2.5);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const updateSession = () => {
    if (!isPaused) {
      setTimeElapsed(prev => prev + 1);
      setBatteryLevel(prev => Math.min(prev + 0.1, 100));
      setEnergyUsed(prev => prev + 0.002);
      setCost(prev => prev + 0.001);
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await pauseSession();
  };

  const handleResume = async () => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await resumeSession();
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Show confirmation dialog
    await stopSession();
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="x" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Charging Session</Text>
        <Badge
          text={isPaused ? 'Paused' : 'Active'}
          variant={isPaused ? 'warning' : 'success'}
        />
      </View>

      <View style={styles.content}>
        {/* Battery Visualization */}
        <View style={styles.batteryContainer}>
          <Animated.View
            style={[
              styles.batteryWrapper,
              { transform: [{ scale: pulseAnim }] },
              isPaused && styles.batteryPaused,
            ]}
          >
            <View style={styles.batteryOutline}>
              <View
                style={[
                  styles.batteryFill,
                  {
                    width: `${batteryLevel}%`,
                    backgroundColor: getBatteryColor(batteryLevel),
                  },
                ]}
              />
              <View style={styles.batteryTerminal} />
            </View>
          </Animated.View>
          <Text style={styles.batteryPercentage}>{Math.round(batteryLevel)}%</Text>
        </View>

        {/* Session Stats */}
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Feather name="clock" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="zap" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Energy</Text>
              <Text style={styles.statValue}>{energyUsed.toFixed(1)} kWh</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="dollar-sign" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Cost</Text>
              <Text style={styles.statValue}>${cost.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Charging Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Charging Progress</Text>
          <ProgressBar
            progress={batteryLevel}
            max={100}
            height={8}
            color={getBatteryColor(batteryLevel)}
          />
        </View>

        {/* Station Info */}
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Station</Text>
            <Text style={styles.infoValue}>Charging Station A</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Connector</Text>
            <Text style={styles.infoValue}>Type 2</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Power</Text>
            <Text style={styles.infoValue}>22 kW</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Est. Completion</Text>
            <Text style={styles.infoValue}>
              {formatTime(Math.max(0, 3600 - timeElapsed))}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isPaused ? (
            <Button
              title="Resume"
              onPress={handleResume}
              variant="success"
              size="large"
              style={styles.actionButton}
              iconLeft={<Feather name="play" size={20} color="#FFFFFF" />}
            />
          ) : (
            <Button
              title="Pause"
              onPress={handlePause}
              variant="warning"
              size="large"
              style={styles.actionButton}
              iconLeft={<Feather name="pause" size={20} color="#FFFFFF" />}
            />
          )}
          <Button
            title="Stop Charging"
            onPress={handleStop}
            variant="danger"
            size="large"
            style={styles.actionButton}
            iconLeft={<Feather name="power" size={20} color="#FFFFFF" />}
          />
        </View>

        {/* Status Message */}
        <View style={styles.statusContainer}>
          <Feather
            name={isPaused ? 'clock' : 'zap'}
            size={16}
            color={isPaused ? COLORS.warning : COLORS.success}
          />
          <Text style={[styles.statusText, { color: isPaused ? COLORS.warning : COLORS.success }]}>
            {isPaused ? 'Charging paused' : 'Charging in progress'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  batteryContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  batteryWrapper: {
    width: '100%',
  },
  batteryOutline: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.gray400,
  },
  batteryFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  batteryTerminal: {
    position: 'absolute',
    right: -10,
    top: '30%',
    width: 8,
    height: '40%',
    backgroundColor: COLORS.gray400,
    borderRadius: 2,
  },
  batteryPaused: {
    opacity: 0.6,
  },
  batteryPercentage: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  statsCard: {
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray300,
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  infoCard: {
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xs,
  },
});

export default ChargingSessionScreen;
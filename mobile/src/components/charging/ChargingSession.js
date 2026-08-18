// ============================================================================
// ChargingSession Component - Active Charging Session Display
// ============================================================================

// parking-management-system/mobile/src/components/charging/ChargingSession.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Button, ProgressBar, Card } from '../common';
import chargingService from '../../api/services/charging.service';

const ChargingSession = ({
  sessionId,
  onEndSession,
  onPauseSession,
  onResumeSession,
}) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [energyUsed, setEnergyUsed] = useState(0);
  const [cost, setCost] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadSession();
    const interval = setInterval(() => {
      updateSession();
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await chargingService.getChargingSession(sessionId);
      setSession(response);
      setProgress(response.batteryPercentage || 0);
      setTimeElapsed(response.timeElapsed || 0);
      setEnergyUsed(response.energyUsed || 0);
      setCost(response.cost || 0);
    } catch (error) {
      console.error('Error loading charging session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async () => {
    try {
      const response = await chargingService.getSessionStatus(sessionId);
      if (response) {
        setProgress(response.batteryPercentage || progress);
        setTimeElapsed(response.timeElapsed || timeElapsed);
        setEnergyUsed(response.energyUsed || energyUsed);
        setCost(response.cost || cost);
        
        if (response.status === 'completed') {
          onEndSession?.(response);
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handlePause = async () => {
    try {
      await chargingService.pauseSession(sessionId);
      setIsPaused(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
      onPauseSession?.();
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const handleResume = async () => {
    try {
      await chargingService.resumeSession(sessionId);
      setIsPaused(false);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
      onResumeSession?.();
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  const handleStop = async () => {
    try {
      await chargingService.stopSession(sessionId);
      onEndSession?.();
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (percentage) => {
    if (percentage >= 80) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="zap" size={48} color={COLORS.gray300} />
        <Text style={styles.emptyText}>No active charging session</Text>
      </View>
    );
  }

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="zap" size={24} color={COLORS.primary} />
          <Text style={styles.title}>Charging in Progress</Text>
        </View>
        <Badge
          text={isPaused ? 'Paused' : 'Charging'}
          variant={isPaused ? 'warning' : 'success'}
        />
      </View>

      {/* Battery Visualization */}
      <View style={styles.batteryContainer}>
        <View style={styles.batteryOutline}>
          <Animated.View
            style={[
              styles.batteryFill,
              {
                width: `${progress}%`,
                backgroundColor: getBatteryColor(progress),
                transform: [
                  {
                    scaleX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.95],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.batteryTerminal} />
        </View>
        <Text style={styles.batteryPercentage}>{Math.round(progress)}%</Text>
      </View>

      {/* Session Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Energy</Text>
          <Text style={styles.statValue}>{energyUsed.toFixed(1)} kWh</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cost</Text>
          <Text style={styles.statValue}>${cost.toFixed(2)}</Text>
        </View>
      </View>

      {/* Charging Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Charging Progress</Text>
          <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar
          progress={progress}
          max={100}
          height={8}
          color={getBatteryColor(progress)}
        />
      </View>

      {/* Session Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Station</Text>
          <Text style={styles.detailValue}>{session.stationName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connector</Text>
          <Text style={styles.detailValue}>
            {session.connectorType?.toUpperCase() || 'Type 2'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Power</Text>
          <Text style={styles.detailValue}>
            {session.powerLevel === 'fast' ? 'Fast Charging' : 'Standard'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {isPaused ? (
          <Button
            title="Resume"
            onPress={handleResume}
            variant="success"
            size="medium"
            style={styles.actionButton}
            iconLeft={<Feather name="play" size={20} color="#FFFFFF" />}
          />
        ) : (
          <Button
            title="Pause"
            onPress={handlePause}
            variant="warning"
            size="medium"
            style={styles.actionButton}
            iconLeft={<Feather name="pause" size={20} color="#FFFFFF" />}
          />
        )}
        <Button
          title="Stop Charging"
          onPress={handleStop}
          variant="danger"
          size="medium"
          style={styles.actionButton}
          iconLeft={<Feather name="power" size={20} color="#FFFFFF" />}
        />
      </View>

      {/* Estimated Completion */}
      {!isPaused && progress < 100 && (
        <View style={styles.estimationContainer}>
          <Feather name="clock" size={16} color={COLORS.gray600} />
          <Text style={styles.estimationText}>
            Estimated completion: {session.estimatedCompletion || '--:--'}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    margin: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  batteryContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  batteryOutline: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
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
    right: -8,
    top: '25%',
    width: 6,
    height: '50%',
    backgroundColor: COLORS.gray400,
    borderRadius: 2,
  },
  batteryPercentage: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray300,
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  detailsContainer: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  estimationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  estimationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
});

export default ChargingSession;
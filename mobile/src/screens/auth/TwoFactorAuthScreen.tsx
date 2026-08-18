// ============================================================================
// TwoFactorAuthScreen - Two-Factor Authentication Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Auth/TwoFactorAuthScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthScreenProps } from '../../navigation/types/authStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Button, Alert as CustomAlert } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const TwoFactorAuthScreen = () => {
  const navigation = useNavigation<AuthScreenProps<typeof ROUTES.AUTH.TWO_FACTOR_AUTH>['navigation']>();
  const route = useRoute<AuthScreenProps<typeof ROUTES.AUTH.TWO_FACTOR_AUTH>['route']>();
  const { verifyTwoFactor, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pasted = text.split('');
      const newCode = [...code];
      for (let i = 0; i < Math.min(pasted.length, 6 - index); i++) {
        newCode[index + i] = pasted[i] || '';
      }
      setCode(newCode);
      const nextIndex = Math.min(index + pasted.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setError('Please enter the complete verification code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError('');
    try {
      await verifyTwoFactor(verificationCode);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        navigation.navigate(ROUTES.APP.HOME);
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      // Resend 2FA code
      setTimer(30);
      setCanResend(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error resending 2FA code:', error);
    }
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Verified! ✅
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Two-factor authentication verified.
            Redirecting...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="shield" size={48} color={COLORS.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Two-Factor Auth 🔐
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter the 6-digit code from your{'\n'}
              authenticator app
            </Text>
          </View>

          {/* Error Alert */}
          {error && (
            <CustomAlert
              type="error"
              message={error}
              onClose={() => setError('')}
              style={styles.alert}
            />
          )}

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  { borderColor: colors.border, color: colors.text },
                  digit && { borderColor: colors.primary },
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={index === 0}
                textAlign="center"
                selectionColor={COLORS.primary}
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Code expires in{' '}
              <Text style={[styles.timerText, { color: canResend ? colors.danger : colors.text }]}>
                {timer}s
              </Text>
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendButton,
                  {
                    color: canResend ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {canResend ? 'Resend Code' : 'Wait...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
            style={styles.verifyButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  alert: {
    marginBottom: SPACING.md,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  timerText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  resendButton: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginLeft: SPACING.md,
  },
  verifyButton: {
    marginTop: SPACING.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
});

export default TwoFactorAuthScreen;
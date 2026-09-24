import 'react-native-gesture-handler';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  confirmResetPassword,
  confirmSignUp,
  resetPassword,
  signIn,
  signUp,
} from 'aws-amplify/auth';
import AppNavigator from './src/navigation/AppNavigator';
import PrimaryTextInput from './src/components/forms/PrimaryTextInput';
import useSessionUser from './src/hooks/useSessionUser';

type AuthMode = 'signIn' | 'signUp' | 'confirmSignUp' | 'forgotPassword' | 'confirmForgotPassword';

type AuthErrorShape = {
  name?: string;
  code?: string;
  message?: string;
  recoverySuggestion?: string;
  underlyingError?: string;
  cause?: unknown;
};

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { checkingSession, sessionUser, refreshSession, signOutUser } = useSessionUser();

  const getAuthError = (error: unknown): AuthErrorShape => {
    if (typeof error === 'object' && error !== null) {
      const candidate = error as AuthErrorShape;
      return {
        name: candidate.name,
        code: candidate.code,
        message: candidate.message,
      };
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      };
    }

    return {};
  };

  const getErrorMessage = (error: unknown) => {
    const authError = getAuthError(error);

    if (authError.message) {
      if (authError.name === 'Unknown' && authError.message === 'An unknown error has occurred.') {
        return 'Authentication failed with an unknown provider error. Verify account confirmation and try exact email case used at sign-up.';
      }

      return authError.message;
    }

    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }

    return 'Authentication failed. Please try again.';
  };

  const getUsernameCandidates = () => {
    const raw = email.trim();
    const lower = raw.toLowerCase();
    return raw === lower ? [raw] : [raw, lower];
  };

  const logErrorDetails = (label: string, error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      const objectError = error as Record<string, unknown>;
      const details: Record<string, unknown> = {};

      Object.getOwnPropertyNames(objectError).forEach((key) => {
        details[key] = objectError[key];
      });

      console.error(label, details);
      return;
    }

    console.error(label, error);
  };

  const handleSignIn = async () => {
    const usernameCandidates = getUsernameCandidates();
    const primaryUsername = usernameCandidates[0] || '';

    if (!primaryUsername || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      let result: Awaited<ReturnType<typeof signIn>> | null = null;
      let lastError: unknown = null;

      for (const usernameCandidate of usernameCandidates) {
        try {
          result = await signIn({ username: usernameCandidate, password });
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!result && lastError) {
        throw lastError;
      }

      if (!result) {
        setMessage('Authentication failed. Please try again.');
        return;
      }

      if (result.isSignedIn) {
        await refreshSession();
        setMessage('Signed in successfully.');
      } else {
        const signInStep = result.nextStep?.signInStep;

        if (signInStep === 'CONFIRM_SIGN_UP') {
          setAuthMode('confirmSignUp');
          setMessage('Your account is not confirmed yet. Enter the verification code to continue.');
          return;
        }

        if (signInStep === 'RESET_PASSWORD') {
          setAuthMode('forgotPassword');
          setMessage('You need to reset your password before signing in.');
          return;
        }

        setMessage(signInStep ? `Sign-in requires additional step: ${signInStep}` : 'Sign-in started but is not complete yet.');
      }
    } catch (error: unknown) {
      const authError = getAuthError(error);

      if (authError.name === 'UserNotConfirmedException') {
        setAuthMode('confirmSignUp');
        setMessage('Account is not confirmed. Enter the verification code sent to your email.');
        return;
      }

      if (authError.name === 'NotAuthorizedException') {
        setMessage('Incorrect email or password. Please try again.');
        return;
      }

      logErrorDetails('Sign-in error:', error);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const username = email.trim().toLowerCase();
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username,
          },
        },
      });

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setAuthMode('confirmSignUp');
        setMessage('Account created. Enter the verification code sent to your email.');
      } else {
        setMessage('Account created successfully.');
        setAuthMode('signIn');
      }
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    if (!verifyCode) {
      setMessage('Please enter the confirmation code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      let lastError: unknown = null;
      let confirmed = false;

      for (const usernameCandidate of getUsernameCandidates()) {
        try {
          await confirmSignUp({ username: usernameCandidate, confirmationCode: verifyCode });
          confirmed = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!confirmed && lastError) {
        throw lastError;
      }

      setVerifyCode('');
      setAuthMode('signIn');
      setMessage('Email confirmed. You can now sign in.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordStart = async () => {
    if (!email) {
      setMessage('Please enter your account email first.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      let lastError: unknown = null;
      let started = false;

      for (const usernameCandidate of getUsernameCandidates()) {
        try {
          await resetPassword({ username: usernameCandidate });
          started = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!started && lastError) {
        throw lastError;
      }

      setAuthMode('confirmForgotPassword');
      setMessage('Password reset code sent. Enter code and new password.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordConfirm = async () => {
    if (!email || !resetCode || !newPassword) {
      setMessage('Please fill email, reset code, and new password.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      let lastError: unknown = null;
      let completed = false;

      for (const usernameCandidate of getUsernameCandidates()) {
        try {
          await confirmResetPassword({
            username: usernameCandidate,
            confirmationCode: resetCode,
            newPassword,
          });
          completed = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!completed && lastError) {
        throw lastError;
      }

      setResetCode('');
      setNewPassword('');
      setAuthMode('signIn');
      setMessage('Password updated successfully. Sign in with your new password.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutUser = async () => {
    try {
      setLoading(true);
      await signOutUser();
      setMessage('Signed out successfully.');
    } catch (error: unknown) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.loadingText}>Loading CarTra...</Text>
      </View>
    );
  }

  if (sessionUser) {
    return (
      <NavigationContainer>
        <AppNavigator
          username={sessionUser.username}
          email={sessionUser.email}
          onSignOut={handleSignOutUser}
          signingOut={loading}
          groups={sessionUser.groups}
        />
      </NavigationContainer>
    );
  }

  const showSignUp = authMode === 'signUp';
  const showConfirmSignUp = authMode === 'confirmSignUp';
  const showForgot = authMode === 'forgotPassword';
  const showForgotConfirm = authMode === 'confirmForgotPassword';

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.authCard}>
          <Text style={styles.title}>CarTra</Text>
          <Text style={styles.subtitle}>
            {showSignUp
              ? 'Create account'
              : showConfirmSignUp
                ? 'Confirm your account'
                : showForgot
                  ? 'Forgot password'
                  : showForgotConfirm
                    ? 'Reset password'
                    : 'Sign in'}
          </Text>

          <PrimaryTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {(showSignUp || authMode === 'signIn') ? (
            <PrimaryTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightContent={
                <TouchableOpacity
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              }
            />
          ) : null}

          {showSignUp ? (
            <PrimaryTextInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              rightContent={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.passwordToggleText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              }
            />
          ) : null}

          {showConfirmSignUp ? (
            <PrimaryTextInput
              placeholder="Verification code"
              value={verifyCode}
              onChangeText={setVerifyCode}
              keyboardType="number-pad"
            />
          ) : null}

          {showForgotConfirm ? (
            <>
              <PrimaryTextInput
                placeholder="Reset code"
                value={resetCode}
                onChangeText={setResetCode}
              />
              <PrimaryTextInput
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                rightContent={
                  <TouchableOpacity
                    onPress={() => setShowNewPassword((current) => !current)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.passwordToggleText}>{showNewPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                }
              />
            </>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={
              showSignUp
                ? handleSignUp
                : showConfirmSignUp
                  ? handleConfirmSignUp
                  : showForgot
                    ? handleForgotPasswordStart
                    : showForgotConfirm
                      ? handleForgotPasswordConfirm
                      : handleSignIn
            }
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? 'Please wait...'
                : showSignUp
                  ? 'Create account'
                  : showConfirmSignUp
                    ? 'Confirm account'
                    : showForgot
                      ? 'Send reset code'
                      : showForgotConfirm
                        ? 'Reset password'
                        : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {authMode === 'signIn' ? (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setMessage('');
                  setAuthMode('signUp');
                }}
              >
                <Text style={styles.secondaryButtonText}>Need an account? Sign up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setMessage('');
                  setAuthMode('forgotPassword');
                }}
              >
                <Text style={styles.secondaryButtonText}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {authMode !== 'signIn' ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setMessage('');
                setAuthMode('signIn');
              }}
            >
              <Text style={styles.secondaryButtonText}>Back to sign in</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
  },
  passwordToggleText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 15,
  },
  message: {
    marginTop: 12,
    color: '#374151',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    color: '#111827',
    fontSize: 16,
  },
});

import { Component, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('Caught render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-brand-cream items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#a8937a" />
          <Text className="text-[20px] font-bold text-brand-dark mt-3">
            Something went wrong
          </Text>
          <Text className="text-brand-muted text-[14px] text-center mt-1 mb-6">
            We hit an unexpected error. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-brand-primary px-6 py-3 rounded-full"
          >
            <Text className="text-brand-cream font-bold text-[15px]">
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

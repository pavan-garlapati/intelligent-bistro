import { View, type ViewProps } from 'react-native';

type Variant = 'cream' | 'dark' | 'card' | 'surface';

const variantClasses: Record<Variant, string> = {
  cream: 'bg-brand-cream',
  dark: 'bg-brand-dark',
  card: 'bg-brand-card',
  surface: 'bg-brand-surface',
};

export interface ThemedViewProps extends ViewProps {
  variant?: Variant;
  className?: string;
}

export function ThemedView({
  variant = 'cream',
  className,
  ...rest
}: ThemedViewProps) {
  return (
    <View
      className={`${variantClasses[variant]}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  );
}

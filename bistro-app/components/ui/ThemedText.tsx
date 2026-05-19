import { Text, type TextProps } from 'react-native';

type Variant =
  | 'title'
  | 'heading'
  | 'body'
  | 'caption'
  | 'muted'
  | 'price'
  | 'label';

const variantClasses: Record<Variant, string> = {
  title: 'text-[28px] font-bold text-brand-dark',
  heading: 'text-[18px] font-semibold text-brand-dark',
  body: 'text-[15px] font-normal text-brand-dark',
  caption: 'text-[12px] text-brand-muted',
  muted: 'text-[14px] text-brand-muted',
  price: 'text-[16px] font-bold text-brand-primary',
  label: 'text-[11px] font-medium uppercase tracking-widest text-brand-muted',
};

export interface ThemedTextProps extends TextProps {
  variant?: Variant;
  className?: string;
}

export function ThemedText({
  variant = 'body',
  className,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      className={`${variantClasses[variant]}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  );
}

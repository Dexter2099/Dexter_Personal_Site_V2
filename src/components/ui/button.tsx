// Adapted from Untitled UI React (MIT). See THIRD_PARTY_NOTICES.md.
import type { ReactNode, Ref } from 'react';
import { Button as AriaButton, Link as AriaLink, type ButtonProps as AriaButtonProps, type LinkProps as AriaLinkProps } from 'react-aria-components';

interface CommonProps {
  children?: ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'link-color';
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
  isLoading?: boolean;
}
type ButtonProps = Omit<AriaButtonProps, 'children' | 'className'> & CommonProps & { ref?: Ref<HTMLButtonElement> };
type LinkProps = Omit<AriaLinkProps, 'children' | 'className'> & CommonProps & { href: string; ref?: Ref<HTMLAnchorElement> };

export function Button({ children, className = '', color = 'primary', iconLeading, iconTrailing, isLoading = false, ...props }: ButtonProps | LinkProps) {
  const disabled = props.isDisabled || isLoading;
  const content = <>
    {isLoading && <svg className="uui-button__spinner" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" opacity=".25" /><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="12.5 50" strokeLinecap="round" /></svg>}
    <span className="uui-button__content" aria-hidden={isLoading || undefined}>{iconLeading}{children && <span>{children}</span>}{iconTrailing}</span>
  </>;
  const appearance = { className: `uui-button uui-button--${color} ${className}`, 'data-loading': isLoading || undefined, 'data-icon-only': (!children && !!(iconLeading || iconTrailing)) || undefined };
  if ('href' in props) return <AriaLink {...props} {...appearance} href={disabled ? undefined : props.href} isDisabled={disabled}>{content}</AriaLink>;
  return <AriaButton {...props} {...appearance} type={props.type ?? 'button'} isDisabled={disabled} isPending={isLoading}>{content}</AriaButton>;
}

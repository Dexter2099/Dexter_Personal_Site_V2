// Adapted from Untitled UI React (MIT). See THIRD_PARTY_NOTICES.md.
// This project deliberately omits the optional tooltip wrapper.
import type { ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';

interface Props extends Omit<AriaButtonProps, 'children' | 'className'> {
  icon: ReactNode;
  'aria-label': string;
  className?: string;
}
export function ButtonUtility({ icon, className = '', ...props }: Props) {
  return <AriaButton {...props} type={props.type ?? 'button'} className={`uui-utility ${className}`}>{icon}</AriaButton>;
}

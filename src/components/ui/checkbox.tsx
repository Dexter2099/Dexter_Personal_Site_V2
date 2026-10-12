// Adapted from Untitled UI React (MIT), with a reviewed local Qwen draft.
// See THIRD_PARTY_NOTICES.md.
import type { ReactNode, Ref } from 'react';
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';

interface Props extends Omit<AriaCheckboxProps, 'children' | 'className'> {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  ref?: Ref<HTMLLabelElement>;
}
export function Checkbox({ label, hint, className = '', ...props }: Props) {
  return <AriaCheckbox {...props} className={`uui-checkbox ${className}`}>
    {({ isSelected, isIndeterminate }) => <>
      <span className="uui-checkbox__box" aria-hidden="true">
        {(isSelected || isIndeterminate) && <svg viewBox="0 0 14 14" fill="none"><path d={isIndeterminate ? 'M2.91675 7H11.0834' : 'M11.6666 3.5L5.24992 9.91667L2.33325 7'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span className="uui-checkbox__text"><span className="uui-checkbox__label">{label}</span>{hint && <span className="uui-checkbox__hint" onClick={event => event.stopPropagation()}>{hint}</span>}</span>
    </>}
  </AriaCheckbox>;
}

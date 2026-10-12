// Adapted from Untitled UI React (MIT). See THIRD_PARTY_NOTICES.md.
import type { ReactNode, Ref } from 'react';
import { Label, TextArea as AriaTextArea, TextField as AriaTextField, type TextFieldProps } from 'react-aria-components';

interface Props extends Omit<TextFieldProps, 'children' | 'className'> {
  label: string;
  textAreaRef?: Ref<HTMLTextAreaElement>;
  placeholder?: string;
  rows?: number;
  action?: ReactNode;
}
export function TextArea({ label, textAreaRef, placeholder, rows = 2, action, ...props }: Props) {
  return <AriaTextField {...props} className="uui-textarea">
    <Label className="sr-only">{label}</Label>
    <div className="uui-textarea__control">
      <AriaTextArea ref={textAreaRef} className="uui-textarea__input" placeholder={placeholder} rows={rows} enterKeyHint="send" />
      {action}
    </div>
  </AriaTextField>;
}

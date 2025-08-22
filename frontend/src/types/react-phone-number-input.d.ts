declare module 'react-phone-number-input' {
  import { ComponentType } from 'react';
  
  export interface PhoneInputProps {
    value?: string;
    onChange?: (value?: string) => void;
    defaultCountry?: string;
    countries?: string[];
    international?: boolean;
    withCountryCallingCode?: boolean;
    countryCallingCodeEditable?: boolean;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: string;
    className?: string;
    style?: React.CSSProperties;
    inputComponent?: ComponentType<any>;
    numberInputProps?: object;
    countrySelectProps?: object;
    containerComponent?: ComponentType<any>;
    metadata?: any;
    labels?: any;
    locales?: string | string[];
    addInternationalOption?: boolean;
    countryOptionsOrder?: string[];
    limitMaxLength?: boolean;
    smartCaret?: boolean;
  }
  
  const PhoneInput: ComponentType<PhoneInputProps>;
  export default PhoneInput;
  
  export function parsePhoneNumber(phone: string, defaultCountry?: string): any;
  export function formatPhoneNumber(phone: string): string;
  export function formatPhoneNumberIntl(phone: string): string;
  export function isValidPhoneNumber(phone: string): boolean;
  export function isPossiblePhoneNumber(phone: string): boolean;
  export function getCountries(): string[];
  export function getCountryCallingCode(country: string): string;
}

declare module 'react-phone-number-input/style.css' {
  const content: string;
  export default content;
}
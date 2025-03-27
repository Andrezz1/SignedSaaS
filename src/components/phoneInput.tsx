import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface MyPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MyPhoneInput: React.FC<MyPhoneInputProps> = ({ value, onChange }) => {
  return (
    <PhoneInput
      country="pt"
      value={value}
      onChange={onChange}
      inputClass="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
};

export default MyPhoneInput;

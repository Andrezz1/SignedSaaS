import React from 'react';

interface MyPhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

const MyPhoneInput: React.FC<MyPhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={countryCode}
        onChange={(e) => {
          let value = e.target.value;
          // Garante que o código inicia com '+'
          if (!value.startsWith('+')) {
            value = '+' + value.replace(/\D/g, '');
          }
          onCountryCodeChange(value);
        }}
        className="w-20 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value.replace(/\D/g, ''))}
        className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Número de telemóvel"
      />
    </div>
  );
};

export default MyPhoneInput;

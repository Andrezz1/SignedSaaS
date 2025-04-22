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
  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+')) {
      value = '+' + value;
    }
    const digits = value.slice(1).replace(/\D/g, '');
    value = '+' + digits;
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    onCountryCodeChange(value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    onPhoneNumberChange(value);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={countryCode}
        onChange={handleCountryCodeChange}
        maxLength={4}
        className="w-20 block p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <input
        type="text"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        maxLength={9}
        className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
};

export default MyPhoneInput;

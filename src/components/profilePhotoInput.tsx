import React, { useState, ChangeEvent } from 'react';

interface ProfilePhotoInputProps {
  onFileSelect: (base64: string) => void;
  label?: string;
}

const ProfilePhotoInput: React.FC<ProfilePhotoInputProps> = ({
  onFileSelect,
  label = 'NOVA FOTO DE PERFIL (OPCIONAL)'
}) => {
  const [fileName, setFileName] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setFileName('');
      onFileSelect('');
      return;
    }
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileSelect(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
        {label}
      </label>
      
      <div className="relative">
        <div className="flex items-center border border-gray-200 bg-white rounded-lg focus-within:ring-2 focus-within:ring-blue-200">
          <label
            htmlFor="profile-upload"
            className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 cursor-pointer rounded-l-lg border-r border-gray-200"
          >
            Procurar
          </label>
          <label
            htmlFor="profile-upload"
            className="flex-1 px-4 py-3 text-sm text-gray-600 cursor-pointer"
          >
            {fileName || 'Nenhum ficheiro selecionado'}
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      
      <p className="mt-1 text-xs text-gray-500">
        SVG, PNG, JPG.
      </p>
    </div>
  );
};

export default ProfilePhotoInput;
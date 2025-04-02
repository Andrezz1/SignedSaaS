import React, { useState, ChangeEvent, FormEvent } from 'react';

const EditProfile: React.FC = () => {
  // Valores iniciais simulados; no uso real, estes dados virão do auth do Wasp.
  const [profilePicture, setProfilePicture] = useState<string>('https://i.pravatar.cc/300');
  const [name, setName] = useState<string>('John Doe');
  const [title, setTitle] = useState<string>('Software Developer');
  const [organization, setOrganization] = useState<string>('Estep Bilişim');
  const [email, setEmail] = useState<string>('john.doe@example.com');
  const [phone, setPhone] = useState<string>('+1 (555) 123-4567');
  const [location, setLocation] = useState<string>('San Francisco, CA');

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ name, title, organization, email, phone, location });
  };

  const handleCancel = () => {
    console.log("Cancel clicked");
  };

  return (
    <div className="bg-gradient-to-r from-indigo-800 to-blue-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">Edit Profile</h2>
            <p className="mt-1 text-gray-600">Manage your account information</p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col items-center">
            <div className="relative">
              <img
                src={profilePicture}
                alt="Profile Picture"
                className="rounded-full w-32 h-32 border-4 border-indigo-800 transition-transform duration-300 hover:scale-105"
              />
              <input
                type="file"
                name="profile"
                id="upload_profile"
                hidden
                onChange={handleProfilePictureChange}
              />
              <label
                htmlFor="upload_profile"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 text-white text-sm font-semibold cursor-pointer transition-colors"
              >
                Change
              </label>
            </div>
            <button className="mt-2 text-indigo-800 font-medium hover:underline">
              Update Profile Picture
            </button>
          </div>
        </div>
        {/* Formulário */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization
              </label>
              <input
                type="text"
                id="organization"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

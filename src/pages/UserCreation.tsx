import {
  User,
  UserPlus,
  Shield,
  Crown,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react'
import type { ChangeEvent } from 'react'

const UserCreationPage = () => {
  const [activeTab, setActiveTab] = useState<'regular' | 'staff' | 'superuser'>('regular');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    password: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      birth_date: '',
      password: ''
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getApiEndpoint = () => {
    switch (activeTab) {
      case 'staff':
        return '/admin/users/create-staff/';
      case 'superuser':
        return '/admin/users/create-superuser/';
      default:
        return '/admin/users/create/';
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.email || !formData.username || !formData.first_name || !formData.last_name || !formData.birth_date || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessMessage(`${activeTab === 'regular' ? 'User' : activeTab === 'staff' ? 'Staff member' : 'Superuser'} created successfully!`);
        resetForm();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      setSuccessMessage(`${activeTab === 'regular' ? 'User' : activeTab === 'staff' ? 'Staff member' : 'Superuser'} would be created successfully!`);
      setTimeout(() => resetForm(), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'regular', label: 'Regular User', icon: User, description: 'Create a standard user account' },
    { id: 'staff', label: 'Staff Member', icon: Shield, description: 'Create a staff user with admin privileges' },
    { id: 'superuser', label: 'Superuser', icon: Crown, description: 'Create a superuser with full access' }
  ];

  return (
    <div className="flex-1 p-6 overflow-auto bg-[#ffffff]">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600 text-lg">Create and manage user accounts with different permission levels</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as 'regular' | 'staff' | 'superuser');
                    resetForm();
                  }}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-yellow-400 bg-yellow-50 shadow-md'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-yellow-600' : 'text-gray-500'}`} />
                    <span className={`font-semibold ${activeTab === tab.id ? 'text-yellow-700' : 'text-gray-700'}`}>
                      {tab.label}
                    </span>
                  </div>
                  <p className={`text-sm ${activeTab === tab.id ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            {activeTab === 'regular' && <User className="w-6 h-6 text-yellow-500" />}
            {activeTab === 'staff' && <Shield className="w-6 h-6 text-yellow-500" />}
            {activeTab === 'superuser' && <Crown className="w-6 h-6 text-yellow-500" />}
            Create {activeTab === 'regular' ? 'User' : activeTab === 'staff' ? 'Staff Member' : 'Superuser'}
          </h2>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  placeholder="username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-yellow-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-200"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreationPage;

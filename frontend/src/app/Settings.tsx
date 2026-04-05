// src/app/Settings.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, LogOut, Bell, Shield, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import axios from 'axios';

type Tab = 'profile' | 'notifications' | 'privacy' | 'password';

export function Settings() {
  const navigate = useNavigate();
  // Added updateUser here to safely merge profile changes!
  const { user, token, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    institution: user?.institution || '',
  });

  // 2. Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: user?.email_alerts ?? true,
    weeklySummary: user?.weekly_summary ?? true,
  });

  // 3. Privacy State
  const [privacy, setPrivacy] = useState({
    publicProfile: user?.public_profile ?? false,
    dataSharing: user?.data_sharing ?? true,
  });

  // 4. Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Clear messages when switching tabs
  useEffect(() => {
    setSuccessMsg('');
    setErrorMsg('');
  }, [activeTab]);

  // --- HANDLERS ---

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Save the response to capture the updated user data from Laravel
      const response = await axios.put('http://localhost:8000/api/settings/profile', profileData, getAuthHeaders());
      
      // 2. Update the React Context (this updates the header immediately without wiping progress!)
      if (updateUser) {
          updateUser(response.data.user);
      }
      
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.put('http://localhost:8000/api/settings/notifications', {
        emailAlerts: notifications.emailAlerts,
        weeklySummary: notifications.weeklySummary
      }, getAuthHeaders());
      
      setSuccessMsg('Notification preferences saved!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.put('http://localhost:8000/api/settings/privacy', {
        publicProfile: privacy.publicProfile,
        dataSharing: privacy.dataSharing
      }, getAuthHeaders());
      
      setSuccessMsg('Privacy settings saved!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update privacy settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setErrorMsg('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.put('http://localhost:8000/api/settings/password', passwordData, getAuthHeaders());
      
      setSuccessMsg('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' }); 
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Status Message Component (Reusable)
  const StatusMessage = () => (
    <>
      {errorMsg && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and profile details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <User className="w-5 h-5" /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'privacy' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'password' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Key className="w-5 h-5" /> Password
          </button>
        </div>

        {/* Main Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <StatusMessage />

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Profile Information</h3>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Institution / School</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-5 w-5 text-gray-400" /></div>
                      <input 
                        type="text" 
                        value={profileData.institution}
                        onChange={(e) => setProfileData({...profileData, institution: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
                  <h3 className="font-bold text-red-800">Account Actions</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Logging out will clear your current session.</p>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition-colors">
                    <LogOut className="w-5 h-5" /> Log Out Securely
                  </button>
                </div>
              </div>
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Notification Preferences</h3>
              </div>
              <form onSubmit={handleNotificationsSubmit} className="p-6 space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Email Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when AI finishes generating a quiz.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                  />
                </label>
                <hr className="border-gray-100" />
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Weekly Summary</p>
                    <p className="text-sm text-gray-500">Receive a weekly breakdown of your study stats.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklySummary}
                    onChange={(e) => setNotifications({...notifications, weeklySummary: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                  />
                </label>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Privacy Settings</h3>
              </div>
              <form onSubmit={handlePrivacySubmit} className="p-6 space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Public Profile</p>
                    <p className="text-sm text-gray-500">Allow other students to see your basic profile.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacy.publicProfile}
                    onChange={(e) => setPrivacy({...privacy, publicProfile: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                  />
                </label>
                <hr className="border-gray-100" />
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Data Sharing</p>
                    <p className="text-sm text-gray-500">Help improve the AI by sharing anonymous quiz results.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privacy.dataSharing}
                    onChange={(e) => setPrivacy({...privacy, dataSharing: e.target.checked})}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                  />
                </label>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Change Password</h3>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    required
                    placeholder="••••••••" 
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    required
                    minLength={8}
                    placeholder="••••••••" 
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                    required
                    minLength={8}
                    placeholder="••••••••" 
                    className={`block w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all ${
                      passwordData.new_password && passwordData.new_password_confirmation !== passwordData.new_password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200'
                    }`} 
                  />
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
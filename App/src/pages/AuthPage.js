import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Mail, Lock, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [userType, setUserType] = useState(null); // 'politician' or 'citizen'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    constituency: '',
    party: '',
    district: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TODO: Add Firebase authentication here
    
    // For now, redirect based on user type
    if (userType === 'politician') {
      navigate('/politician-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // User Type Selection Screen
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              Join{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
                Belaku
              </span>
            </h1>
            <p className="text-xl text-gray-300">Choose how you want to continue</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Politician Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => setUserType('politician')}
              className="cursor-pointer p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-yellow-500/50 transition-all"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-4">Politician</h2>
              <p className="text-gray-300 text-center mb-6">
                Create your profile, share initiatives, engage with constituents, and track your impact
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400">✓</span>
                  Professional dashboard & analytics
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400">✓</span>
                  Post initiatives & projects
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400">✓</span>
                  Direct citizen engagement
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400">✓</span>
                  Track feedback & sentiment
                </li>
              </ul>

              <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
                Continue as Politician
              </button>
            </motion.div>

            {/* Citizen Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => setUserType('citizen')}
              className="cursor-pointer p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-yellow-500/50 transition-all"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-4">Citizen</h2>
              <p className="text-gray-300 text-center mb-6">
                Stay informed, participate in discussions, track initiatives, and make your voice heard
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-400">✓</span>
                  Track government initiatives
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-400">✓</span>
                  Participate in discussions
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-400">✓</span>
                  Find your candidates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-blue-400">✓</span>
                  Provide feedback on bills
                </li>
              </ul>

              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                Continue as Citizen
              </button>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/')}
            className="mt-8 mx-auto flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  // Login/Signup Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              userType === 'politician' 
                ? 'bg-gradient-to-br from-yellow-400 to-red-500' 
                : 'bg-gradient-to-br from-blue-400 to-purple-500'
            }`}>
              {userType === 'politician' ? <User className="w-10 h-10" /> : <Users className="w-10 h-10" />}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-300">
              {userType === 'politician' ? 'Politician Portal' : 'Citizen Portal'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {userType === 'politician' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Constituency</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="constituency"
                          value={formData.constituency}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                          placeholder="Your constituency"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Political Party</label>
                      <input
                        type="text"
                        name="party"
                        value={formData.party}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                        placeholder="Your political party"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">District</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                        placeholder="Your district"
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                userType === 'politician'
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500 hover:shadow-lg hover:shadow-yellow-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/50'
              }`}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-yellow-400 font-semibold">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setUserType(null)}
            className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Choose Different Account Type
          </button>
        </div>
      </motion.div>
    </div>
  );
}
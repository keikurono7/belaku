import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, BarChart3, FileText, MessageSquare, TrendingUp, 
  Users, Award, Calendar, Settings, LogOut, Plus, Eye, Heart, Share2 
} from 'lucide-react';

export default function PoliticianDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  const stats = [
    { label: 'Total Followers', value: '15.2K', change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Posts Published', value: '48', change: '+8', icon: FileText, color: 'from-yellow-500 to-orange-500' },
    { label: 'Projects Completed', value: '12', change: '+3', icon: Award, color: 'from-green-500 to-emerald-500' },
    { label: 'Engagement Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
  ];

  const recentPosts = [
    { 
      id: 1, 
      title: 'New Road Development Initiative', 
      date: '2 days ago', 
      views: '2.3K', 
      likes: 456, 
      comments: 89,
      status: 'Published'
    },
    { 
      id: 2, 
      title: 'Healthcare Expansion Program', 
      date: '5 days ago', 
      views: '3.1K', 
      likes: 678, 
      comments: 124,
      status: 'Published'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white">
      
      {/* Top Navigation */}
      <div className="border-b border-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Politician Dashboard</h1>
                <p className="text-sm text-gray-400">Manage your profile and engage with constituents</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg'
                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <span className="text-sm text-green-400">{stat.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-gradient-to-br from-yellow-500/20 to-red-500/20 border border-yellow-500/30 rounded-2xl flex items-center gap-4 hover:border-yellow-500/50 transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">Create New Post</p>
                    <p className="text-sm text-gray-400">Share updates with constituents</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-all"
                >
                  <Award className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">Add Project</p>
                    <p className="text-sm text-gray-400">Track new initiative</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center gap-4 hover:border-green-500/50 transition-all"
                >
                  <MessageSquare className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-semibold">View Messages</p>
                    <p className="text-sm text-gray-400">Respond to constituents</p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Posts</h2>
                <button className="text-yellow-400 hover:text-yellow-300 font-semibold">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            {post.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments} comments
                      </span>
                      <button className="ml-auto flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs - Profile, Posts, Projects, Analytics, Messages */}
        {activeTab !== 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-3xl font-bold mb-4">{tabs.find(t => t.id === activeTab)?.label} Content</h2>
            <p className="text-gray-400">This section is under development</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
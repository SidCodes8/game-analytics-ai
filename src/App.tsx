import React, { useState, useRef } from 'react';
import { 
  Upload, MessageCircle, BarChart3, Brain, FileSpreadsheet, Sparkles, 
  ArrowRight, CheckCircle, AlertCircle, Home, TrendingUp, Users, 
  Bot, FileText, Moon, Sun, Download, Filter, Calendar, Smartphone,
  Globe, DollarSign, Activity, Target, Zap, Settings, ChevronDown,
  PieChart, LineChart, BarChart, Layers, AlertTriangle, Star
} from 'lucide-react';

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
}

type PageType = 'upload' | 'overview' | 'analytics' | 'ml-insights' | 'chatbot' | 'reports';
type ThemeType = 'dark' | 'light';

function App() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploaded: false,
    error: null
  });
  const [currentPage, setCurrentPage] = useState<PageType>('upload');
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [dateRange, setDateRange] = useState('30d');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setUploadState({
          file: null,
          uploading: false,
          uploaded: false,
          error: 'Please upload an Excel (.xlsx, .xls) or CSV file'
        });
        return;
      }

      setUploadState({
        file,
        uploading: false,
        uploaded: false,
        error: null
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        uploaded: true 
      }));

      setTimeout(() => {
        setCurrentPage('overview');
      }, 1500);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: 'Upload failed. Please try again.'
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;
        handleFileSelect({ target: { files: dt.files } } as any);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const themeClasses = {
    dark: {
      bg: 'bg-slate-900',
      cardBg: 'bg-slate-800',
      text: 'text-white',
      textSecondary: 'text-slate-300',
      border: 'border-slate-700',
      accent: 'bg-purple-600'
    },
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'bg-purple-600'
    }
  };

  const t = themeClasses[theme];

  if (currentPage === 'upload') {
    return <UploadPage 
      uploadState={uploadState}
      handleFileSelect={handleFileSelect}
      handleUpload={handleUpload}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      fileInputRef={fileInputRef}
      theme={theme}
      toggleTheme={toggleTheme}
    />;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      {/* Header */}
      <header className={`${t.cardBg} ${t.border} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">🎮 Gaming Analytics AI</h1>
                <p className="text-sm text-slate-400">ML-Powered Player Behavior & Revenue Optimization</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${t.cardBg} ${t.border} border hover:bg-opacity-80 transition-colors`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 ${t.cardBg} ${t.border} border-r min-h-screen p-6`}>
          {/* Quick Stats */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className={`${t.cardBg} p-3 rounded-lg ${t.border} border`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">DAU</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg font-bold">12,847</div>
                <div className="text-xs text-green-500">+5.2%</div>
              </div>
              <div className={`${t.cardBg} p-3 rounded-lg ${t.border} border`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Revenue</span>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-lg font-bold">$45,231</div>
                <div className="text-xs text-green-500">+12.8%</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className={`w-full p-2 rounded-lg ${t.cardBg} ${t.border} border text-sm`}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Device</label>
                <select 
                  value={deviceFilter} 
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className={`w-full p-2 rounded-lg ${t.cardBg} ${t.border} border text-sm`}
                >
                  <option value="all">All Devices</option>
                  <option value="mobile">Mobile</option>
                  <option value="pc">PC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Segment</label>
                <select 
                  value={segmentFilter} 
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className={`w-full p-2 rounded-lg ${t.cardBg} ${t.border} border text-sm`}
                >
                  <option value="all">All Users</option>
                  <option value="whale">Whales</option>
                  <option value="dolphin">Dolphins</option>
                  <option value="minnow">Minnows</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Navigation</h3>
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'ml-insights', label: 'ML Insights', icon: Brain },
                { id: 'chatbot', label: 'AI Chatbot', icon: Bot },
                { id: 'reports', label: 'Reports', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentPage(id as PageType)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentPage === id 
                      ? 'bg-purple-600 text-white' 
                      : `hover:${t.cardBg} ${t.textSecondary} hover:${t.text}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentPage === 'overview' && <OverviewPage theme={theme} />}
          {currentPage === 'analytics' && <AnalyticsPage theme={theme} />}
          {currentPage === 'ml-insights' && <MLInsightsPage theme={theme} />}
          {currentPage === 'chatbot' && <ChatbotPage theme={theme} />}
          {currentPage === 'reports' && <ReportsPage theme={theme} />}
        </main>
      </div>
    </div>
  );
}

// Upload Page Component
function UploadPage({ uploadState, handleFileSelect, handleUpload, handleDragOver, handleDrop, fileInputRef, theme, toggleTheme }: any) {
  const backgroundPatternClass = "absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className={backgroundPatternClass}></div>
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
        </button>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header */}
        <div className="text-center mb-12 max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Gaming Analytics
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> AI</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Upload your gaming data and get AI-powered insights for player behavior, 
            retention strategies, and in-app purchase optimization
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
              <MessageCircle className="w-4 h-4" />
              AI Chat Assistant
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
              <BarChart3 className="w-4 h-4" />
              Advanced Analytics
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
              <Brain className="w-4 h-4" />
              ML Predictions
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {!uploadState.uploaded ? (
              <>
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    uploadState.file 
                      ? 'border-purple-400 bg-purple-500/10' 
                      : 'border-slate-400 hover:border-purple-400 hover:bg-purple-500/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                      uploadState.file ? 'bg-purple-500' : 'bg-slate-600'
                    }`}>
                      <FileSpreadsheet className="w-8 h-8 text-white" />
                    </div>
                    
                    {uploadState.file ? (
                      <div className="text-center">
                        <p className="text-white font-medium mb-2">{uploadState.file.name}</p>
                        <p className="text-slate-300 text-sm">
                          {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-white font-medium mb-2">
                          Drop your Excel file here, or click to browse
                        </p>
                        <p className="text-slate-400 text-sm">
                          Supports .xlsx, .xls, and .csv files
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadState.error && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300">{uploadState.error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Choose File
                  </button>
                  
                  <button
                    onClick={handleUpload}
                    disabled={!uploadState.file || uploadState.uploading}
                    className={`flex-1 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      uploadState.file && !uploadState.uploading
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {uploadState.uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        Analyze Data
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                <p className="text-slate-300 mb-6">
                  Your data has been processed. Launching analytics dashboard...
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Expected Format Info */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Expected Data Format
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>Your Excel file should contain columns like:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                <span className="bg-white/10 rounded px-2 py-1 text-xs">User_ID</span>
                <span className="bg-white/10 rounded px-2 py-1 text-xs">Total_Revenue_USD</span>
                <span className="bg-white/10 rounded px-2 py-1 text-xs">Device_Type</span>
                <span className="bg-white/10 rounded px-2 py-1 text-xs">Game_Purchases</span>
                <span className="bg-white/10 rounded px-2 py-1 text-xs">Signup_Date</span>
                <span className="bg-white/10 rounded px-2 py-1 text-xs">Last_Login</span>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Don't worry about exact column names - our AI will automatically detect and map your schema!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-400 text-sm">
          <p>Powered by AI & Machine Learning • Built for Gaming Industry</p>
        </div>
      </div>
    </div>
  );
}

// Overview Page Component
function OverviewPage({ theme }: { theme: ThemeType }) {
  const t = theme === 'dark' ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    border: 'border-slate-700'
  } : {
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: 2 minutes ago</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Daily Active Users', value: '12,847', change: '+5.2%', icon: Users, color: 'blue' },
          { title: 'Total Revenue', value: '$45,231', change: '+12.8%', icon: DollarSign, color: 'green' },
          { title: 'ARPPU', value: '$23.45', change: '+3.1%', icon: Target, color: 'purple' },
          { title: 'Retention Rate', value: '68.2%', change: '-2.1%', icon: Activity, color: 'orange' }
        ].map((kpi, index) => (
          <div key={index} className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                <kpi.icon className={`w-5 h-5 text-${kpi.color}-600`} />
              </div>
              <span className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </span>
            </div>
            <h3 className={`text-sm font-medium ${t.textSecondary} mb-1`}>{kpi.title}</h3>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Revenue Trends</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg">Daily</button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white rounded-lg">Weekly</button>
            <button className="px-3 py-1 text-sm text-slate-400 hover:text-white rounded-lg">Monthly</button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-slate-700 rounded-lg">
          <div className="text-center">
            <LineChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400">Interactive chart will be rendered here</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">AI Insights</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <p className="text-sm">Whale segment revenue increased 15% this week, driven by new premium content releases.</p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm">Mobile users showing 8% higher retention than PC users - consider mobile-first features.</p>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <p className="text-sm">Churn risk detected for 234 mid-tier players - recommend targeted retention campaign.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Page Component
function AnalyticsPage({ theme }: { theme: ThemeType }) {
  const [activeTab, setActiveTab] = useState('retention');
  
  const t = theme === 'dark' ? {
    cardBg: 'bg-slate-800',
    border: 'border-slate-700'
  } : {
    cardBg: 'bg-white',
    border: 'border-gray-200'
  };

  const tabs = [
    { id: 'retention', label: 'Retention', icon: Activity },
    { id: 'funnels', label: 'Funnels', icon: Target },
    { id: 'cohorts', label: 'Cohorts', icon: Users },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'geography', label: 'Geography', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Deep Dive</h1>

      {/* Tab Navigation */}
      <div className={`${t.cardBg} p-1 rounded-xl ${t.border} border`}>
        <div className="flex space-x-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        {activeTab === 'retention' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Retention Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Retention Curve Chart</p>
                </div>
              </div>
              <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Cohort Heatmap</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'funnels' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Conversion Funnels</h2>
            <div className="space-y-4">
              {[
                { step: 'App Install', users: 10000, conversion: 100 },
                { step: 'Tutorial Complete', users: 8500, conversion: 85 },
                { step: 'First Purchase', users: 2550, conversion: 25.5 },
                { step: 'Second Purchase', users: 1275, conversion: 12.8 }
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{step.step}</span>
                      <span className="text-sm text-slate-400">{step.users.toLocaleString()} users</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${step.conversion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{step.conversion}%</div>
                    {index > 0 && (
                      <div className="text-sm text-red-400">
                        -{(100 - step.conversion).toFixed(1)}% drop
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add other tab contents similarly */}
        {activeTab !== 'retention' && activeTab !== 'funnels' && (
          <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">{tabs.find(t => t.id === activeTab)?.label} analysis will be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ML Insights Page Component
function MLInsightsPage({ theme }: { theme: ThemeType }) {
  const t = theme === 'dark' ? {
    cardBg: 'bg-slate-800',
    border: 'border-slate-700'
  } : {
    cardBg: 'bg-white',
    border: 'border-gray-200'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ML Insights</h1>

      {/* ML Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">Churn Prediction</h3>
          </div>
          <div className="text-2xl font-bold mb-2">94.2%</div>
          <p className="text-sm text-slate-400">Model Accuracy</p>
        </div>
        <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">User Segments</h3>
          </div>
          <div className="text-2xl font-bold mb-2">4</div>
          <p className="text-sm text-slate-400">Clusters Identified</p>
        </div>
        <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Anomalies</h3>
          </div>
          <div className="text-2xl font-bold mb-2">3</div>
          <p className="text-sm text-slate-400">Detected This Week</p>
        </div>
      </div>

      {/* Player Segmentation */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <h2 className="text-xl font-semibold mb-6">Player Segmentation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">Segmentation Scatter Plot</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { segment: 'Whales', users: 234, revenue: '$28,450', color: 'red' },
              { segment: 'Dolphins', users: 1,247, revenue: '$12,340', color: 'blue' },
              { segment: 'Minnows', users: 3,891, revenue: '$4,230', color: 'green' },
              { segment: 'Free Users', users: 7,475, revenue: '$0', color: 'gray' }
            ].map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 bg-${segment.color}-500 rounded-full`}></div>
                  <span className="font-medium">{segment.segment}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{segment.users.toLocaleString()} users</div>
                  <div className="text-sm text-slate-400">{segment.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Churn Risk Users */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">High Churn Risk Users</h2>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
            Export List
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3">User ID</th>
                <th className="text-left py-3">Segment</th>
                <th className="text-left py-3">Last Active</th>
                <th className="text-left py-3">Churn Risk</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'user_001', segment: 'Whale', lastActive: '2 days ago', risk: '89%' },
                { id: 'user_045', segment: 'Dolphin', lastActive: '5 days ago', risk: '76%' },
                { id: 'user_123', segment: 'Minnow', lastActive: '1 week ago', risk: '82%' }
              ].map((user, index) => (
                <tr key={index} className="border-b border-slate-700">
                  <td className="py-3 font-mono text-sm">{user.id}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.segment === 'Whale' ? 'bg-red-500/20 text-red-400' :
                      user.segment === 'Dolphin' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.segment}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{user.lastActive}</td>
                  <td className="py-3">
                    <span className="text-red-400 font-bold">{user.risk}</span>
                  </td>
                  <td className="py-3">
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">
                      Send Offer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Chatbot Page Component
function ChatbotPage({ theme }: { theme: ThemeType }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hello! I'm your Gaming Analytics AI assistant. I can help you analyze player behavior, suggest monetization strategies, and answer questions about your data. What would you like to know?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const t = theme === 'dark' ? {
    cardBg: 'bg-slate-800',
    border: 'border-slate-700'
  } : {
    cardBg: 'bg-white',
    border: 'border-gray-200'
  };

  const quickSuggestions = [
    "Show revenue trends for whale players",
    "Why did retention drop last month?",
    "Suggest offers for casual spenders",
    "Which players are likely to churn?",
    "How can I improve DAU for mobile users?"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `Based on your data analysis, here are insights about "${userMessage}": This is a simulated response. In the full implementation, this would connect to the Perplexity API to provide real AI-generated insights based on your gaming analytics data.`
      }]);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Analytics Assistant</h1>

      <div className={`${t.cardBg} rounded-xl ${t.border} border h-[600px] flex flex-col`}>
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-white'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 p-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">AI Assistant</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-sm rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your gaming data..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Send</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reports Page Component
function ReportsPage({ theme }: { theme: ThemeType }) {
  const t = theme === 'dark' ? {
    cardBg: 'bg-slate-800',
    border: 'border-slate-700'
  } : {
    cardBg: 'bg-white',
    border: 'border-gray-200'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Export</h1>

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold">PDF Report</h3>
          </div>
          <p className="text-slate-400 mb-6">
            Generate a comprehensive PDF report with key metrics, charts, and AI insights.
          </p>
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include KPI metrics</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include charts and visualizations</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include ML insights</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Include AI recommendations</span>
            </label>
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Generate PDF</span>
          </button>
        </div>

        <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-semibold">PowerPoint Report</h3>
          </div>
          <p className="text-slate-400 mb-6">
            Create a presentation-ready PowerPoint with executive summary and key findings.
          </p>
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Executive summary slide</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Key metrics overview</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Player segmentation analysis</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Recommendations slide</span>
            </label>
          </div>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Generate PPTX</span>
          </button>
        </div>
      </div>

      {/* AI-Generated Recommendations */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">AI-Generated Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-green-400">Revenue Optimization</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Implement dynamic pricing for whale segment (potential +23% revenue)</li>
              <li>• Launch limited-time offers for dormant dolphins</li>
              <li>• Introduce subscription tiers for consistent revenue</li>
              <li>• Optimize in-app purchase placement in game flow</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-blue-400">Retention Strategies</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Send push notifications to users inactive for 3+ days</li>
              <li>• Create comeback bonuses for churned players</li>
              <li>• Implement daily login rewards system</li>
              <li>• Add social features to increase engagement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className={`${t.cardBg} p-6 rounded-xl ${t.border} border`}>
        <h2 className="text-xl font-semibold mb-6">Report History</h2>
        <div className="space-y-3">
          {[
            { name: 'Weekly Analytics Report - Dec 2024', type: 'PDF', date: '2 hours ago', size: '2.4 MB' },
            { name: 'Monthly Executive Summary - Nov 2024', type: 'PPTX', date: '1 week ago', size: '5.1 MB' },
            { name: 'Q4 Performance Analysis', type: 'PDF', date: '2 weeks ago', size: '3.8 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-slate-400">{report.type} • {report.size} • {report.date}</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
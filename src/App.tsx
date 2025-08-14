import React, { useState, useRef } from 'react';
import { Upload, MessageCircle, BarChart3, Brain, FileSpreadsheet, Sparkles, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
}

function App() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploaded: false,
    error: null
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract complex SVG data URI to avoid JSX parser issues
  const backgroundPatternClass = "absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
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

    // Simulate upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        uploaded: true 
      }));

      // Transition to dashboard after a brief delay
      setTimeout(() => {
        setShowDashboard(true);
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

  if (showDashboard) {
    return <AnalyticsDashboard fileName={uploadState.file?.name || ''} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className={backgroundPatternClass}></div>
      
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

// Analytics Dashboard Component (placeholder for now)
function AnalyticsDashboard({ fileName }: { fileName: string }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Analyzing: {fileName}</p>
        </div>
        
        {/* Dashboard content will be implemented here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-400">12,847</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-400">$45,231</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">ARPPU</h3>
            <p className="text-3xl font-bold text-blue-400">$23.45</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Churn Rate</h3>
            <p className="text-3xl font-bold text-red-400">12.3%</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            AI Analytics Assistant
          </h2>
          <div className="bg-slate-700 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
            <p className="text-slate-400">Chat interface will be implemented here...</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about your gaming data..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
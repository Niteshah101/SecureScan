import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, ShieldCheck, Loader2, Info, Package, AlertCircle, Sparkles, Upload, FileJson, X } from 'lucide-react';
import CveCard from './CveCard';
import { motion, AnimatePresence } from 'motion/react';

interface ScanResult {
  packageName: string;
  version?: string;
  cves: any[];
}

export default function Scanner() {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('');
  const [batchResults, setBatchResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performScan = async (packageName: string, packageVersion?: string) => {
    const response = await axios.get('/api/cves', {
      params: { 
        keyword: packageName,
        version: packageVersion || undefined
      }
    });
    const vulnerabilities = response.data?.vulnerabilities || [];
    return vulnerabilities.map((v: any) => v.cve);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setBatchResults([]);
    
    try {
      const cves = await performScan(query, version);
      setBatchResults([{ packageName: query, version, cves }]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to scan for vulnerabilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        if (!Array.isArray(content)) {
          throw new Error('JSON must be an array of objects like [{"name": "pkg", "version": "1.0"}]');
        }

        setLoading(true);
        setError(null);
        setSearched(true);
        setBatchResults([]);

        const results: ScanResult[] = [];
        for (const item of content) {
          const name = item.name || item.packageName;
          const ver = item.version;
          if (name) {
            try {
              const cves = await performScan(name, ver);
              results.push({ packageName: name, version: ver, cves });
            } catch (err) {
              console.warn(`Failed to scan ${name}:`, err);
            }
          }
        }
        setBatchResults(results);
      } catch (err: any) {
        setError('Invalid JSON format. Please use: [{"name": "package", "version": "1.0"}]');
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 px-4 py-12">
      {/* Search Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center justify-center gap-3">
          <Package className="text-blue-500" size={36} />
          SecureScan Engine
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Audit software packages against the NVD database. Upload a manifest or search directly.
        </p>
        
        <div className="max-w-3xl mx-auto mt-10 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Software Name (e.g., openssh)"
                className="block w-full h-[58px] pl-12 pr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-50"
              />
            </div>
            
            <div className="md:w-1/4 relative group">
              <input 
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Version (Opt)"
                className="block w-full h-[58px] px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-50 font-mono text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="h-[58px] px-8 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center min-w-[120px] shadow-lg shadow-black/5 dark:shadow-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Run Scan'}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full h-14 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-all group"
          >
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="font-semibold">Upload JSON Package List</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              onChange={handleFileUpload} 
            />
          </button>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <ShieldAlert className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
            </div>
            <p className="text-zinc-500 font-medium animate-pulse">Running security audit...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-2xl text-center space-y-2"
          >
            <div className="flex justify-center mb-2">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="font-bold text-red-950 dark:text-red-200">Scan Failed</h3>
            <p className="text-red-700 dark:text-red-400 text-sm max-w-sm mx-auto">{error}</p>
            <button onClick={() => setError(null)} className="text-xs font-bold text-red-500 uppercase mt-4 underline underline-offset-4">Dismiss</button>
          </motion.div>
        ) : batchResults.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {batchResults.map((result, idx) => (
              <div key={`${result.packageName}-${idx}`} className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <FileJson size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                        {result.packageName}
                        {result.version && <span className="ml-2 font-mono text-xs text-zinc-500">v{result.version}</span>}
                      </h3>
                      <p className="text-xs text-zinc-400">{result.cves.length} vulnerabilities detected</p>
                    </div>
                  </div>
                  {result.cves.length === 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} /> Secure
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {result.cves.map((cve: any) => (
                    <div key={cve.id}>
                      <CveCard cve={cve} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : searched ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-emerald-600 border border-emerald-100 dark:border-emerald-900/20">
              <ShieldCheck size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Operational Security Confirmed</h3>
              <p className="text-zinc-500 max-w-sm">
                No matching critical CVEs were found for your query. 
              </p>
              <button 
                onClick={() => setSearched(false)}
                className="mt-4 text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline"
              >
                Clear Search
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 pt-10">
            {[
              { 
                icon: <Search className="text-blue-500" />, 
                title: "Precision Query", 
                desc: "Target specific software and versions using NVD 2.0's optimized indexing." 
              },
              { 
                icon: <Sparkles className="text-purple-500" />, 
                title: "Gemini Analysis", 
                desc: "Every vulnerability is cross-referenced with Gemini AI for human-readable fixes." 
              },
              { 
                icon: <Upload className="text-emerald-500" />, 
                title: "Bulk Auditing", 
                desc: "Upload JSON manifests to audit entire infrastructure dependencies in seconds." 
              }
            ].map((f, i) => (
              <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="p-2 bg-white dark:bg-zinc-800 w-fit rounded-lg shadow-sm">{f.icon}</div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50">{f.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

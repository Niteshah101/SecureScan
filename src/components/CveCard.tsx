import React, { useState } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCve, type CveAnalysis } from '../lib/gemini';
import { cn } from '../lib/utils';

export interface CveCardProps {
  cve: any;
}

export default function CveCard({ cve }: CveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<CveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const cveId = cve.id;
  const description = cve.descriptions.find((d: any) => d.lang === 'en')?.value || 'No description available.';
  const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData || cve.metrics?.cvssMetricV2?.[0]?.cvssData;
  const baseScore = metrics?.baseScore || 'N/A';
  const baseSeverity = metrics?.baseSeverity || (baseScore >= 7 ? 'HIGH' : baseScore >= 4 ? 'MEDIUM' : 'LOW');

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'HIGH': return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      case 'LOW': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      default: return 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5';
    }
  };

  const handleExpand = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && !analysis) {
      setLoading(true);
      const result = await analyzeCve(cveId, description);
      setAnalysis(result);
      setLoading(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full border",
            getSeverityColor(baseSeverity)
          )}>
            {baseScore >= 7 ? <AlertTriangle size={18} /> : <Shield size={18} />}
          </div>
          <div>
            <h3 className="font-mono font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              {cveId}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border uppercase font-sans tracking-wide",
                getSeverityColor(baseSeverity)
              )}>
                {baseSeverity} {baseScore !== 'N/A' && `(${baseScore})`}
              </span>
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 max-w-xl">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href={`https://nvd.nist.gov/vuln/detail/${cveId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
          >
            <ExternalLink size={18} />
          </a>
          {isExpanded ? <ChevronUp className="text-zinc-400" /> : <ChevronDown className="text-zinc-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-100 dark:border-zinc-800"
          >
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Full Description</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Gemini AI Analysis */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 relative overflow-hidden">
                   <div className="flex items-center gap-2 mb-4 relative z-10">
                      <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                        <Sparkles size={16} />
                      </div>
                      <h4 className="font-bold text-blue-950 dark:text-blue-200">AI Vulnerability Insight</h4>
                      {loading && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
                   </div>

                   {loading ? (
                     <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-blue-200/50 dark:bg-blue-800/20 rounded w-3/4"></div>
                        <div className="h-4 bg-blue-200/50 dark:bg-blue-800/20 rounded w-full"></div>
                        <div className="h-4 bg-blue-200/50 dark:bg-blue-800/20 rounded w-5/6"></div>
                     </div>
                   ) : analysis ? (
                     <div className="space-y-4 relative z-10">
                        <div>
                           <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Executive Summary</p>
                           <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed">
                             {analysis.summary}
                           </p>
                        </div>
                        
                        <div>
                           <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Why this matters</p>
                           <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed">
                             {analysis.severityReasoning}
                           </p>
                        </div>

                        <div>
                           <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Remediation Steps</p>
                           <ul className="space-y-2">
                             {analysis.remediation.map((step, i) => (
                               <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-400">
                                 <CheckCircle2 size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                                 {step}
                               </li>
                             ))}
                           </ul>
                        </div>
                     </div>
                   ) : (
                     <p className="text-sm text-zinc-500 italic">Click to generate analysis...</p>
                   )}
                   
                   {/* Decorative gradient overlay */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

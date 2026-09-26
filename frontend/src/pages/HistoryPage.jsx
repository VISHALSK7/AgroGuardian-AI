import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Download, Eye, Leaf, Bug, BarChart3, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, Filter, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Cards';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

const TYPE_ICONS = {
  disease: { icon: Leaf, color: '#22c55e' },
  pest: { icon: Bug, color: '#fbbf24' },
  yield: { icon: BarChart3, color: '#63b3ed' },
};

const HistoryPage = () => {
  const { t } = useTranslation();
  const activeLanguage = useAppStore((s) => s.language) || 'en';

  const handleExportCSV = () => {
    if (!historyData || historyData.length === 0) {
      toast.error('No predictions found to export.');
      return;
    }
    
    // Build CSV Content
    const headers = ['ID', 'Date', 'Time', 'Type', 'Crop', 'Result', 'Confidence (%)', 'Status'];
    const rows = historyData.map(r => [
      r.id,
      r.date,
      r.time,
      r.type,
      r.crop,
      r.result.replace(/,/g, ' '),
      r.confidence,
      r.status === 'danger' ? 'Critical' : r.status === 'warning' ? 'Alert' : 'Good'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download File
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agroguardian_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully!');
  };
  
  // Filters
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Sort
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  useEffect(() => {
    setLoading(true);
    api.get('/predict/disease/history', { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.predictions || [];
        const mapped = items.map((item) => {
          const dt = new Date(item.created_at || Date.now());
          const locale = activeLanguage === 'kn' ? 'kn-IN' : activeLanguage === 'hi' ? 'hi-IN' : 'en-IN';
          const dateStr = dt.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
          const timeStr = dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
          return {
            id: item._id ? item._id.substring(0, 8).toUpperCase() : 'SCAN',
            date: dateStr,
            time: timeStr,
            type: item.type || 'disease',
            crop: item.crop || 'apple',
            result: item.disease || 'Healthy',
            confidence: Math.round((item.confidence || 0) * 100),
            status: item.severity === 'Severe' ? 'danger' : item.severity === 'Moderate' ? 'warning' : 'success',
            raw: item
          };
        });
        setHistoryData(mapped);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // activeLanguage defined at top

  useEffect(() => {
    if (historyData.length === 0 || activeLanguage === 'en') return;

    const translateHistory = async () => {
      try {
        const uniqueTexts = {};
        historyData.forEach((item, idx) => {
          if (item.type === 'disease' || item.type === 'pest') {
            uniqueTexts[`result_${idx}`] = item.result;
          }
        });

        if (Object.keys(uniqueTexts).length === 0) return;

        const res = await api.post('/chatbot/translate', {
          texts: uniqueTexts,
          language: activeLanguage
        });

        if (res.data?.data?.translated) {
          const trans = res.data.data.translated;
          setHistoryData(prev => prev.map((item, idx) => {
            const translatedVal = trans[`result_${idx}`];
            if (translatedVal) {
              return { ...item, result: translatedVal };
            }
            return item;
          }));
        }
      } catch (err) {
        console.error("Failed to translate history:", err);
      }
    };

    translateHistory();
  }, [activeLanguage, historyData.length]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filteredData = useMemo(() => {
    let raw = historyData.filter((r) => {
      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchCrop = cropFilter === 'all' || r.crop === cropFilter;
      const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) || 
                          r.result.toLowerCase().includes(search.toLowerCase());
      
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const matchDate = dateFilter === 'all' || (dateFilter === 'today' ? r.date.includes(todayStr) : true);
      return matchType && matchCrop && matchSearch && matchDate;
    });

    raw.sort((a, b) => {
      if (sortField === 'id') return sortDir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      if (sortField === 'confidence') return sortDir === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence;
      return 0; 
    });

    return raw;
  }, [historyData, search, typeFilter, cropFilter, dateFilter, sortField, sortDir]);

  // Paginate
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} style={{ color: '#22c55e' }} /> : <ChevronDown size={12} style={{ color: '#22c55e' }} />;
  };

  // Extract unique crops for filter
  const allCrops = useMemo(() => {
    return [...new Set(historyData.map(d => d.crop))];
  }, [historyData]);

  // Build trend from real data
  const trendData = useMemo(() => {
    const dayMap = {};
    const dateLabels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const matchKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const displayLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dayMap[matchKey] = { date: displayLabel, Disease: 0, Pest: 0 };
      dateLabels.push(matchKey);
    }
    
    historyData.forEach((item) => {
      if (dayMap[item.date]) {
        if (item.type === 'disease') dayMap[item.date].Disease += 1;
        if (item.type === 'pest') dayMap[item.date].Pest += 1;
      }
    });
    
    return dateLabels.map(key => dayMap[key]);
  }, [historyData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ag-text)' }}>{t('history.title')}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ag-text-muted)' }}>{t('history.subtitle')}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary text-sm py-2 px-4 shadow-sm border border-green-500/10"
        >
          <Download size={15} /> {t('history.exportCSV') || 'Export CSV'}
        </button>
      </div>

      {/* Analytics Graph */}
      <Card className="shadow-lg border-opacity-30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#dfe4e0' }}>{t('history.predictionVolume') || 'Prediction Volume'}</h3>
            <p className="text-xs" style={{ color: '#bccbb9' }}>{t('history.last7Days') || 'Last 7 Days Activity'}</p>
          </div>
          <span className="chip" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>+12.4% vs last week</span>
        </div>
        {loading ? (
          <div className="h-[170px] flex items-center justify-center">
            <Loader size={24} className="animate-spin text-green-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={trendData} margin={{ left: -25, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDisease" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.35}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                <linearGradient id="gradPest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,74,61,0.15)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#889e8b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#889e8b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(20,26,22,0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(61,74,61,0.4)', borderRadius: '10px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="Disease" stroke="#22c55e" strokeWidth={2} fill="url(#gradDisease)" />
              <Area type="monotone" dataKey="Pest" stroke="#fbbf24" strokeWidth={2} fill="url(#gradPest)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#bccbb9' }} />
          <input
            value={search}
            onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
            placeholder={t('history.search') || 'Search by ID or Result...'}
            className="input-field pl-10 h-11 w-full text-sm placeholder-[#6b8271] shadow-sm"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Crop Dropdown */}
          <div className="relative">
             <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#bccbb9' }} />
             <select 
               value={cropFilter} 
               onChange={(e) => {setCropFilter(e.target.value); setCurrentPage(1);}}
               className="input-field pl-9 h-11 appearance-none pr-9 cursor-pointer text-sm font-medium shadow-sm"
             >
               <option value="all">{t('history.allCrops') || 'All Crops'}</option>
               {allCrops.map(c => <option key={c} value={c}>{t(`crop.${c}`)}</option>)}
             </select>
          </div>

          {/* Type Dropdown */}
          <div className="relative">
             <select 
               value={typeFilter} 
               onChange={(e) => {setTypeFilter(e.target.value); setCurrentPage(1);}}
               className="input-field pl-4 h-11 appearance-none pr-9 cursor-pointer text-sm font-medium capitalize shadow-sm"
             >
               <option value="all">{t('history.allPredictions') || 'All Predictions'}</option>
               <option value="disease">{t('history.filterDisease') || 'Disease Scan'}</option>
               <option value="pest">{t('history.filterPest') || 'Pest Risk'}</option>
               <option value="yield">{t('history.filterYield') || 'Yield Forecast'}</option>
             </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
             <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#bccbb9' }} />
             <select 
               value={dateFilter} 
               onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
               className="input-field pl-9 h-11 appearance-none pr-9 cursor-pointer text-sm font-medium shadow-sm"
             >
               <option value="all">{t('history.allTime') || 'All Time'}</option>
               <option value="today">{t('history.today') || 'Today'}</option>
               <option value="week">{t('history.pastWeek') || 'Past Week'}</option>
             </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }} className="shadow-xl">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-[#2a3829] scrollbar-track-transparent">
          <table className="w-full text-sm relative">
            <thead className="sticky top-0 z-10 backdrop-blur-md" style={{ background: 'rgba(15,20,18,0.95)', borderBottom: '1px solid rgba(61,74,61,0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <tr>
                {['ID', 'Date', 'Type', 'Crop', 'Result', 'Confidence', 'Status'].map((h) => {
                  const headerKey = `history.${h.toLowerCase()}`;
                  return (
                    <th
                      key={h}
                      onClick={() => handleSort(h.toLowerCase())}
                      className="text-left py-4 px-5 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ color: '#889e8b' }}
                    >
                      <span className="flex items-center gap-1.5 ">
                        {t(headerKey) || h}
                        <SortIcon field={h.toLowerCase()} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => {
                const { icon: TypeIcon, color } = TYPE_ICONS[row.type];
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#1a211e] transition-colors group cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(61,74,61,0.15)' }}
                  >
                    <td className="py-3.5 px-5 text-xs font-mono font-medium" style={{ color: '#e8eee9' }}>{row.id}</td>
                    <td className="py-3.5 px-5 text-xs whitespace-nowrap" style={{ color: '#bccbb9' }}>
                      <span className="block font-medium" style={{ color: '#dfe4e0' }}>{row.date}</span>
                      <span className="text-[10px] opacity-75">{row.time}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                          <TypeIcon size={12} style={{ color }} />
                        </div>
                        <span className="text-[11px] uppercase tracking-wide font-bold" style={{ color }}>
                          {t('history.filter' + row.type.charAt(0).toUpperCase() + row.type.slice(1)) || row.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-medium" style={{ color: '#bccbb9' }}>{t(`crop.${row.crop}`)}</td>
                    <td className="py-3.5 px-5 text-xs" style={{ color: '#dfe4e0' }}>
                      <span className="truncate block max-w-40 font-medium">{row.result}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{row.confidence}%</span>
                        <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(61,74,61,0.3)', overflow: 'hidden' }}>
                          <div className="h-full rounded-full" style={{ width: `${row.confidence}%`, background: '#22c55e' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                       <span className={`chip chip-${row.status} text-[10px] uppercase font-bold tracking-wider py-1 px-2.5 shadow-sm border border-white/5`}>
                        {row.status === 'success' ? (t('history.statusGood') || 'Good') : row.status === 'warning' ? (t('history.statusAlert') || 'Alert') : (t('history.statusCritical') || 'Critical')}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {loading ? (
            <div className="py-16 text-center">
              <Loader size={36} className="animate-spin text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#bccbb9]">{t('common.loading') || 'Loading records...'}</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="py-16 text-center">
              <History size={36} style={{ color: '#4a6050', opacity: 0.5, margin: '0 auto 12px' }} />
              <p className="text-sm font-medium" style={{ color: '#dfe4e0' }}>{t('history.empty') || 'No records found'}</p>
            </div>
          ) : null}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(61,74,61,0.2)', background: 'rgba(20,26,22,0.8)' }}>
            <p className="text-xs" style={{ color: '#889e8b' }}>
              {activeLanguage === 'kn' ? (
                <>ಫಲಿತಾಂಶಗಳು <span className="font-bold text-[#c8d5ca]">{(currentPage - 1) * rowsPerPage + 1}</span> ರಿಂದ <span className="font-bold text-[#c8d5ca]">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> (ಒಟ್ಟು <span className="font-bold text-[#c8d5ca]">{filteredData.length}</span>ರಲ್ಲಿ)</>
              ) : activeLanguage === 'hi' ? (
                <>परिणाम <span className="font-bold text-[#c8d5ca]">{(currentPage - 1) * rowsPerPage + 1}</span> से <span className="font-bold text-[#c8d5ca]">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> (कुल <span className="font-bold text-[#c8d5ca]">{filteredData.length}</span> में से)</>
              ) : (
                <>Showing <span className="font-bold text-[#c8d5ca]">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-[#c8d5ca]">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-bold text-[#c8d5ca]">{filteredData.length}</span> results</>
              )}
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
                style={{ border: '1px solid rgba(61,74,61,0.5)', color: '#bccbb9' }}
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                   let pageNum = i + 1;
                   if (totalPages > 5 && currentPage > 3) {
                     pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                     if (pageNum > totalPages) pageNum = totalPages;
                   }
                   if (pageNum > totalPages) return null;
                   
                   const isActive = pageNum === currentPage;
                   return (
                     <button
                       key={pageNum}
                       onClick={() => setCurrentPage(pageNum)}
                       className="text-xs w-7 h-7 rounded-md font-semibold transition-all duration-200"
                       style={{ 
                         background: isActive ? '#22c55e' : 'transparent', 
                         color: isActive ? '#003915' : '#889e8b',
                         boxShadow: isActive ? '0 0 10px rgba(34,197,94,0.2)' : 'none'
                       }}
                     >
                       {pageNum}
                     </button>
                   );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
                style={{ border: '1px solid rgba(61,74,61,0.5)', color: '#bccbb9' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default HistoryPage;

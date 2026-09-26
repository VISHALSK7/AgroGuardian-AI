import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Droplets, Wind, Sun, Thermometer, CloudRain, Loader,
  MapPin, RefreshCw, Shield, AlertTriangle, ChevronDown, ChevronUp,
  Zap, Leaf, Navigation, Calendar, Clock, Search, Brain, AlertCircle
} from 'lucide-react';
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Label
} from 'recharts';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { weatherService } from '../services/api';
import API from '../services/api';
import VoicePlayer from '../components/ui/VoicePlayer';
import toast from 'react-hot-toast';

const RISK_COLORS = { Low: '#22c55e', Medium: '#fbbf24', High: '#f97316', Critical: '#ef4444' };
const RISK_BG     = { Low: 'rgba(34,197,94,0.08)', Medium: 'rgba(251,191,36,0.08)', High: 'rgba(249,115,22,0.08)', Critical: 'rgba(239,68,68,0.08)' };
const RISK_BORDER = { Low: 'rgba(34,197,94,0.25)', Medium: 'rgba(251,191,36,0.25)', High: 'rgba(249,115,22,0.25)', Critical: 'rgba(239,68,68,0.25)' };
const RISK_EMOJI  = { Low: '✅', Medium: '⚠️', High: '🔶', Critical: '🔴' };

const CITIES = ['Mysore', 'Mandya', 'Hassan', 'Bangalore', 'Tumkur', 'Shimoga'];

const CROPS = [
  { id: 'Apple',  emoji: '🍎', name: 'Apple' },
  { id: 'Corn',   emoji: '🌽', name: 'Corn / Maize' },
  { id: 'Grape',  emoji: '🍇', name: 'Grape' },
  { id: 'Mango',  emoji: '🥭', name: 'Mango' },
];

/* ─── Weather Icon by condition text ─── */
const getWeatherEmoji = (riskIndicator) => {
  const map = { Low: '☀️', Medium: '⛅', High: '🌧️', Critical: '🌩️' };
  return map[riskIndicator] || '🌤️';
};

/* ─── Severity Color Styles ─── */
const SEVERITY_STYLES = {
  normal: {
    bg: 'rgba(26,31,28,0.7)',
    border: 'rgba(42,56,41,0.45)',
    text: '#8a9b8d',
    accent: '#22c55e',
    glow: 'none',
    animate: ''
  },
  slight: {
    bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(26, 31, 28, 0.8))',
    border: 'rgba(251, 191, 36, 0.3)',
    text: '#fbbf24',
    accent: '#fbbf24',
    glow: '0 0 12px rgba(251, 191, 36, 0.1)',
    animate: ''
  },
  moderate: {
    bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.09), rgba(26, 31, 28, 0.8))',
    border: 'rgba(249, 115, 22, 0.45)',
    text: '#f97316',
    accent: '#f97316',
    glow: '0 0 15px rgba(249, 115, 22, 0.15)',
    animate: ''
  },
  high: {
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(26, 31, 28, 0.85))',
    border: 'rgba(239, 68, 68, 0.5)',
    text: '#ef4444',
    accent: '#ef4444',
    glow: '0 0 15px rgba(239, 68, 68, 0.2)',
    animate: ''
  },
  critical: {
    bg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(18, 5, 5, 0.95))',
    border: 'rgba(220, 38, 38, 0.75)',
    text: '#f87171',
    accent: '#dc2626',
    glow: '0 0 20px rgba(220, 38, 38, 0.35)',
    animate: 'animate-pulse'
  },
  safe: {
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(26, 31, 28, 0.8))',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#22c55e',
    accent: '#22c55e',
    glow: '0 0 12px rgba(34, 197, 94, 0.1)',
    animate: ''
  }
};

/* ─── Metric Severity Helpers ─── */
const getTempSeverity = (temp) => {
  if (!temp) return 'normal';
  const t = Number(temp);
  if (t >= 22 && t <= 30) return 'normal'; // Optimal/Normal
  if (t >= 18 && t <= 34) return 'slight'; // Slight Risk/Yellow
  return 'moderate'; // Moderate/Orange
};

const getHumiditySeverity = (humidity) => {
  if (!humidity) return 'normal';
  const h = Number(humidity);
  if (h >= 90) return 'critical';
  if (h >= 80) return 'high';
  if (h >= 70) return 'slight'; // Slight Risk/Yellow
  return 'normal';
};

const getWindSeverity = (wind) => {
  if (!wind) return 'normal';
  const w = Number(wind);
  if (w >= 12) return 'safe'; // Active spore dispersion reduces risk -> Green
  if (w < 5) return 'slight'; // Low airflow -> Yellow
  return 'normal';
};

const getRainfallSeverity = (rainfall) => {
  if (!rainfall) return 'normal';
  const r = Number(rainfall);
  if (r > 15) return 'critical';
  if (r > 5) return 'high';
  if (r > 1) return 'slight'; // Slight risk
  return 'normal';
};

/* ─── Metric Card ─── */
const MetricCard = ({ icon: Icon, label, value, unit, color, delay = 0, severity = 'normal' }) => {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.normal;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden ${style.animate}`}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(8px)',
        boxShadow: style.glow,
      }}
    >
      {severity !== 'normal' && severity !== 'safe' && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" style={{ backgroundColor: style.accent }} />
          <span className="text-[8px] font-black uppercase tracking-wider text-gray-400" style={{ color: style.text }}>
            {severity}
          </span>
        </div>
      )}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${style.accent}12`,
          border: `1px solid ${style.accent}25`
        }}>
        <Icon size={18} style={{ color: style.accent }} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{label}</p>
        <p className="text-lg font-extrabold text-white">{value}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span></p>
      </div>
    </motion.div>
  );
};


/* ═══════════════════════════════════════════════════════════════ */
/* MAIN PAGE COMPONENT                                            */
/* ═══════════════════════════════════════════════════════════════ */
const WeatherPage = () => {
  const { t } = useTranslation();
  const appLanguage = useAppStore((s) => s.language) || 'en';

  // ── Real-time weather states ──
  const [city, setCity] = useState('Mysore,IN');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // ── Disease prediction states ──
  const [predCrop, setPredCrop] = useState('');
  const [predLocation, setPredLocation] = useState('Mysore');
  const [predDate, setPredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [predTime, setPredTime] = useState('12:00');
  const [predLoading, setPredLoading] = useState(false);
  const [predResult, setPredResult] = useState(null);
  const [expandedDisease, setExpandedDisease] = useState(null);

  // GPS
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── Fetch real-time weather ──
  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await weatherService.getForecast(7, city);
      setWeatherData(res.data.data);
    } catch (e) {
      const msg = e.response?.data?.message || t('weatherFetchError') || 'Failed to fetch weather data.';
      setWeatherError(msg);
      toast.error(msg);
    } finally {
      setWeatherLoading(false);
    }
  }, [city]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // ── GPS Handler ──
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      toast.error(t('gpsNotSupported') || 'GPS not supported by your browser');
      return;
    }
    setGpsLoading(true);
    const toastId = toast.loading(t('capturingGPS') || 'Capturing GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        try {
          const res = await weatherService.getForecast(7, coordinates);
          const data = res.data.data;
          if (data?.location) {
            const name = data.location.name || 'My Farm';
            setCity(coordinates);
            setPredLocation(name);
            toast.success(`${t('gpsResolved') || 'GPS resolved to'}: ${name}`, { id: toastId });
          } else {
            setCity(coordinates);
            setPredLocation('My Farm');
            toast.success(`${t('gpsLoaded') || 'GPS loaded'}: ${coordinates}`, { id: toastId });
          }
        } catch {
          setCity(coordinates);
          setPredLocation('My Farm');
          toast.success(`${t('gpsLoaded') || 'GPS loaded'}: ${coordinates}`, { id: toastId });
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        toast.error(t('gpsFailed') || 'Failed to get GPS. Check browser permissions.', { id: toastId });
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Disease Spread Prediction ──
  const handlePredictDisease = async (e) => {
    if (e) e.preventDefault();
    if (!predCrop) {
      toast.error(appLanguage === 'kn' ? 'ದಯವಿಟ್ಟು ವಿಶ್ಲೇಷಿಸಲು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ!' : appLanguage === 'hi' ? 'कृपया विश्लेषण के लिए एक फसल चुनें!' : 'Please select a crop for analysis!');
      return;
    }
    setPredLoading(true);
    try {
      const res = await weatherService.predictFuture({
        crop: predCrop,
        location: predLocation,
        date: predDate,
        time: predTime,
        language: appLanguage,
      });
      setPredResult(res.data.data);
      setExpandedDisease(0);
      toast.success(t('predictionSuccess') || `Disease risk prediction loaded for ${predCrop}!`);
    } catch (err) {
      console.error(err);
      toast.error(t('predictionFailed') || 'Failed to predict disease spread.');
    } finally {
      setPredLoading(false);
    }
  };

  // Removed auto-prediction on crop change to require manual click on 'Predict' button

  useEffect(() => {
    if (!predResult || !predResult.diseases) return;
    
    const translateWeatherResult = async () => {
      try {
        const textsToTranslate = {};
        predResult.diseases.forEach((dis, idx) => {
          textsToTranslate[`disease_name_${idx}`] = dis.disease_name;
          textsToTranslate[`farmer_explanation_${idx}`] = dis.farmer_explanation;
          textsToTranslate[`why_explanation_${idx}`] = dis.why_explanation;
          textsToTranslate[`incubation_window_${idx}`] = dis.incubation_window;
          textsToTranslate[`historical_memory_${idx}`] = dis.historical_memory;
          textsToTranslate[`crop_stage_${idx}`] = dis.crop_stage;
          textsToTranslate[`correlation_engine_${idx}`] = dis.correlation_engine;
          
          const actions = dis.recommended_actions || {};
          textsToTranslate[`action_immediate_${idx}`] = actions.immediate_action;
          textsToTranslate[`action_preventive_${idx}`] = actions.preventive_action;
          textsToTranslate[`action_chemical_${idx}`] = actions.chemical_control;
          textsToTranslate[`action_biological_${idx}`] = actions.biological_control;
          textsToTranslate[`action_irrigation_${idx}`] = actions.irrigation_control;
        });
        
        const res = await API.post('/chatbot/translate', {
          texts: textsToTranslate,
          language: appLanguage
        });
        
        if (res.data?.data?.translated) {
          const trans = res.data.data.translated;
          setPredResult(prev => {
            if (!prev || !prev.diseases) return prev;
            const updatedDiseases = prev.diseases.map((dis, idx) => {
              const actions = dis.recommended_actions || {};
              return {
                ...dis,
                disease_name: trans[`disease_name_${idx}`] || dis.disease_name,
                farmer_explanation: trans[`farmer_explanation_${idx}`] || dis.farmer_explanation,
                why_explanation: trans[`why_explanation_${idx}`] || dis.why_explanation,
                incubation_window: trans[`incubation_window_${idx}`] || dis.incubation_window,
                historical_memory: trans[`historical_memory_${idx}`] || dis.historical_memory,
                crop_stage: trans[`crop_stage_${idx}`] || dis.crop_stage,
                correlation_engine: trans[`correlation_engine_${idx}`] || dis.correlation_engine,
                recommended_actions: {
                  ...actions,
                  immediate_action: trans[`action_immediate_${idx}`] || actions.immediate_action,
                  preventive_action: trans[`action_preventive_${idx}`] || actions.preventive_action,
                  chemical_control: trans[`action_chemical_${idx}`] || actions.chemical_control,
                  biological_control: trans[`action_biological_${idx}`] || actions.biological_control,
                  irrigation_control: trans[`action_irrigation_${idx}`] || actions.irrigation_control
                }
              };
            });
            return {
              ...prev,
              diseases: updatedDiseases
            };
          });
        }
      } catch (err) {
        console.error("Failed to translate weather disease predictions:", err);
      }
    };
    
    translateWeatherResult();
  }, [appLanguage]);

  // ── Derived data ──
  const forecast = weatherData?.forecast || [];
  const currentDay = forecast[0] || {};

  const chartData = forecast.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    temp: d.temperature,
    humidity: d.humidity,
    rainfall: d.rainfall || 0,
  }));

  // ── Build voice text for a disease card ──
  const buildResultVoiceText = (disease) => {
    const parts = [];
    parts.push(`${disease.disease_name}. ${t('riskLevel') || 'Risk Level'}: ${disease.risk_level}.`);
    parts.push(`${t('spreadProbability') || 'Spread probability'}: ${disease.spread_probability}%.`);
    parts.push(`${t('infectionVelocity') || 'Infection Speed'}: ${disease.infection_velocity}.`);
    parts.push(`${t('outbreakWindow') || 'Outbreak Window'}: ${disease.outbreak_window}.`);
    return parts.join(' ');
  };

  const buildCausesVoiceText = (disease) => {
    return disease.farmer_explanation || '';
  };

  const buildCureVoiceText = (disease) => {
    const parts = [];
    const actions = disease.recommended_actions || {};
    if (actions.immediate_action) parts.push(`${t('immediateAction') || 'Immediate action'}: ${actions.immediate_action}`);
    if (actions.preventive_action) parts.push(`${t('prevention') || 'Prevention'}: ${actions.preventive_action}`);
    if (actions.chemical_control) parts.push(`${t('chemicalControl') || 'Chemical control'}: ${actions.chemical_control}`);
    if (actions.biological_control) parts.push(`${t('biologicalControl') || 'Biological control'}: ${actions.biological_control}`);
    if (actions.irrigation_control) parts.push(`${t('irrigationControl') || 'Irrigation Advice'}: ${actions.irrigation_control}`);
    return parts.join(' ');
  };

  const getSpeakLabel = (type) => {
    if (appLanguage === 'kn') {
      if (type === 'result') return '📊 ಫಲಿತಾಂಶ ಕೇಳಿ';
      if (type === 'causes') return '❓ ಕಾರಣಗಳನ್ನು ಕೇಳಿ';
      if (type === 'cure') return '🛡️ ಪರಿಹಾರ ಕೇಳಿ';
    } else if (appLanguage === 'hi') {
      if (type === 'result') return '📊 परिणाम सुनें';
      if (type === 'causes') return '❓ कारण सुनें';
      if (type === 'cure') return '🛡️ उपचार सुनें';
    } else {
      if (type === 'result') return '🔊 Listen Result';
      if (type === 'causes') return '🔊 Listen Causes';
      if (type === 'cure') return '🔊 Listen Cure & Prevention';
    }
    return '🔊 Listen';
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-7">

      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#e8eee9' }}>
            <Cloud size={22} className="text-green-400" />
            {t('weatherDisease') || 'Weather & Disease Spread'}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#8a9b8d' }}>
            {t('weatherDiseaseSubtitle') || 'Real-time weather and AI disease spread prediction for your crops'}
          </p>
        </div>
        <button
          onClick={fetchWeather}
          disabled={weatherLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            color: '#22c55e',
          }}
        >
          <RefreshCw size={12} className={weatherLoading ? 'animate-spin' : ''} />
          {t('refresh') || 'Refresh'}
        </button>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: REAL-TIME WEATHER                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section>
        {/* Location Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <MapPin size={14} className="text-green-400" />
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setPredLocation(e.target.value.split(',')[0]); }}
            className="text-xs rounded-lg px-3 py-2 cursor-pointer outline-none"
            style={{ background: 'rgba(16,20,18,0.85)', border: '1px solid rgba(61,74,61,0.5)', color: '#dfe4e0' }}
          >
            {CITIES.map(c => <option key={c} value={`${c},IN`}>{c}</option>)}
            {!CITIES.some(c => city.startsWith(c)) && (
              <option value={city}>📍 {city}</option>
            )}
          </select>
          <button
            onClick={handleCaptureGPS}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#22c55e',
            }}
          >
            {gpsLoading
              ? <Loader size={12} className="animate-spin" />
              : <Navigation size={12} />
            }
            {t('useGPSLocation') || 'Use GPS'}
          </button>
        </div>

        {/* Loading / Error */}
        {weatherLoading && !weatherData && (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader size={28} className="animate-spin text-green-400" />
            <p className="text-xs text-gray-400">{t('loadingWeather') || 'Loading weather data...'}</p>
          </div>
        )}

        {weatherError && !weatherData && (
          <div className="p-4 rounded-xl text-center text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {weatherError}
          </div>
        )}

        {/* Current Weather Cards */}
        {weatherData && (
          <div className="space-y-5">
            {/* Big hero weather banner */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #141a16, #0f1512)', border: '1px solid rgba(42,56,41,0.5)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 50% 70% at 80% 40%, rgba(34,197,94,0.06), transparent)' }} />
              <div className="relative z-10 flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <span className="text-5xl">{getWeatherEmoji(currentDay.risk_indicator)}</span>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">{currentDay.temperature || '--'}°C</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {weatherData?.location?.resolved_location || city}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="ml-auto hidden sm:block">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: RISK_BG[currentDay.risk_indicator] || RISK_BG.Low,
                      border: `1px solid ${RISK_BORDER[currentDay.risk_indicator] || RISK_BORDER.Low}`,
                      color: RISK_COLORS[currentDay.risk_indicator] || RISK_COLORS.Low,
                    }}>
                    {RISK_EMOJI[currentDay.risk_indicator]} {t('overallRisk') || 'Overall Risk'}: {currentDay.risk_indicator || 'Low'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                icon={Thermometer}
                label={t('temperature') || 'Temperature'}
                value={currentDay.temperature || '--'}
                unit="°C"
                color="#fbbf24"
                delay={0.05}
                severity={getTempSeverity(currentDay.temperature)}
              />
              <MetricCard
                icon={Droplets}
                label={t('humidity') || 'Humidity'}
                value={currentDay.humidity || '--'}
                unit="%"
                color="#63b3ed"
                delay={0.1}
                severity={getHumiditySeverity(currentDay.humidity)}
              />
              <MetricCard
                icon={Wind}
                label={t('wind') || 'Wind'}
                value={currentDay.wind || '--'}
                unit="km/h"
                color="#a78bfa"
                delay={0.15}
                severity={getWindSeverity(currentDay.wind)}
              />
              <MetricCard
                icon={CloudRain}
                label={t('rainfall') || 'Rainfall'}
                value={currentDay.rainfall || '0'}
                unit="mm"
                color="#38bdf8"
                delay={0.2}
                severity={getRainfallSeverity(currentDay.rainfall)}
              />
            </div>

            {/* 7-Day Forecast Strip */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(26,31,28,0.7)', border: '1px solid rgba(42,56,41,0.45)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-1.5">
                <Calendar size={13} />
                {t('sevenDayForecast') || '7-Day Forecast'}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {forecast.map((d, i) => (
                  <div key={d.date}
                    className="flex-shrink-0 p-3 rounded-xl text-center min-w-[90px] transition-all"
                    style={{
                      background: i === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(38,43,41,0.3)',
                      border: i === 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(61,74,61,0.15)',
                    }}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <span className="text-2xl block my-1">{getWeatherEmoji(d.risk_indicator)}</span>
                    <p className="text-sm font-extrabold text-white">{d.temperature}°C</p>
                    <p className="text-[10px] text-blue-400">{d.humidity}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature + Humidity Chart */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(26,31,28,0.7)', border: '1px solid rgba(42,56,41,0.45)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-1.5">
                <Zap size={13} />
                {t('weeklyTrend') || 'Weekly Weather Trend'}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#63b3ed" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,74,61,0.15)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#bccbb9', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#bccbb9', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#1c211e', border: '1px solid rgba(61,74,61,0.45)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                      <p className="font-semibold mb-1.5 text-gray-300">{label}</p>
                      {payload.map((p, idx) => (
                        <p key={idx} style={{ color: p.color || p.stroke }} className="flex items-center gap-1.5 py-0.5">
                          <span>{p.name.includes('Rainfall') ? '🌧️' : p.name.includes('Temp') ? '🌡️' : '💧'}</span>
                          <span>{p.name}:</span>
                          <span className="font-extrabold text-white">{p.value}{p.name.includes('Rainfall') ? ' mm' : p.name.includes('Temp') ? '°C' : '%'}</span>
                        </p>
                      ))}
                    </div>) : null}
                  />
                  <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{ fontSize: 11, color: '#bccbb9' }} />
                  <Area type="monotone" name={t('humidity') || 'Humidity (%)'} dataKey="humidity" stroke="#63b3ed" strokeWidth={2} fill="url(#areaHum)" />
                  <Line type="monotone" name={t('temperature') || 'Temperature (°C)'} dataKey="temp" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3, fill: '#fbbf24', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Bar type="monotone" name={t('rainfall') || 'Rainfall (mm)'} dataKey="rainfall" fill="#38bdf8" barSize={12} radius={[3, 3, 0, 0]} fillOpacity={0.6} />
                  <ReferenceLine y={80} stroke="#f87171" strokeDasharray="4 4" strokeWidth={1.5}>
                    <Label value={t('fungalZone') || 'FUNGAL ZONE (>80% RH)'} position="top" fill="#f87171" style={{ fontSize: '9px', fontWeight: 'black', letterSpacing: '0.05em' }} />
                  </ReferenceLine>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2: DISEASE SPREAD PREDICTION                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section>
        <div className="rounded-2xl p-5 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(26,31,28,0.85), rgba(18,22,20,0.95))',
            border: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>

          {/* Section Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <Shield size={16} color="white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('diseaseSpreadPrediction') || 'Disease Spread Prediction'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {t('diseaseSpreadDesc') || 'Select crop, location and date to predict disease risks'}
              </p>
            </div>
          </div>

          {/* Prediction Form */}
          <form onSubmit={handlePredictDisease} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">

            {/* Crop */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Leaf size={10} /> {t('selectCrop') || 'Crop'}
              </label>
              <select
                value={predCrop}
                onChange={(e) => setPredCrop(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2.5 cursor-pointer outline-none"
                style={{ background: 'rgba(16,20,18,0.85)', border: '1px solid rgba(61,74,61,0.5)', color: '#dfe4e0' }}
              >
                <option value="">
                  {appLanguage === 'kn' ? '-- ಬೆಳೆ ಆರಿಸಿ --' : appLanguage === 'hi' ? '-- फसल चुनें --' : '-- Select Crop --'}
                </option>
                {CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {appLanguage === 'kn' && t(`crop.${c.id.toLowerCase()}`) ? t(`crop.${c.id.toLowerCase()}`) : appLanguage === 'hi' && t(`crop.${c.id.toLowerCase()}`) ? t(`crop.${c.id.toLowerCase()}`) : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <MapPin size={10} /> {t('selectLocation') || 'Location'}
              </label>
              <div className="flex gap-1.5">
                <select
                  value={predLocation}
                  onChange={(e) => setPredLocation(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2.5 cursor-pointer outline-none"
                  style={{ background: 'rgba(16,20,18,0.85)', border: '1px solid rgba(61,74,61,0.5)', color: '#dfe4e0' }}
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  {!CITIES.includes(predLocation) && (
                    <option value={predLocation}>📍 {predLocation}</option>
                  )}
                </select>
                <button type="button" onClick={handleCaptureGPS} disabled={gpsLoading}
                  className="p-2 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                  title={t('useGPSLocation') || 'Use GPS'}
                >
                  {gpsLoading ? <Loader size={13} className="animate-spin" /> : <Navigation size={13} />}
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Calendar size={10} /> {t('selectDate') || 'Date'}
              </label>
              <input
                type="date"
                value={predDate}
                onChange={(e) => setPredDate(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2.5 outline-none"
                style={{ background: 'rgba(16,20,18,0.85)', border: '1px solid rgba(61,74,61,0.5)', color: '#dfe4e0' }}
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {t('selectTime') || 'Time'}
              </label>
              <select
                value={predTime}
                onChange={(e) => setPredTime(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2.5 cursor-pointer outline-none"
                style={{ background: 'rgba(16,20,18,0.85)', border: '1px solid rgba(61,74,61,0.5)', color: '#dfe4e0' }}
              >
                <option value="06:00">{t('earlyMorning') || '6:00 AM – Morning'}</option>
                <option value="12:00">{t('midday') || '12:00 PM – Midday'}</option>
                <option value="16:00">{t('afternoon') || '4:00 PM – Afternoon'}</option>
                <option value="20:00">{t('evening') || '8:00 PM – Evening'}</option>
              </select>
            </div>

            {/* Submit */}
            <button type="submit" disabled={predLoading}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: predLoading ? 'rgba(34,197,94,0.3)' : 'linear-gradient(90deg, #16a34a, #22c55e)',
                color: '#ffffff',
                boxShadow: predLoading ? 'none' : '0 4px 15px rgba(34,197,94,0.3)',
              }}
            >
              {predLoading ? (
                <><Loader size={13} className="animate-spin" /> {t('analyzing') || 'Analyzing...'}</>
              ) : (
                <><Search size={13} /> {t('predictDiseaseRisk') || 'Predict Disease Risk'}</>
              )}
            </button>
          </form>
        </div>

        {/* ── PREDICTION RESULTS ── */}
        <AnimatePresence mode="wait">
          {!predResult ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 rounded-2xl text-center border"
              style={{
                background: 'rgba(26,31,28,0.4)',
                border: '1px solid rgba(42,56,41,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Leaf size={36} className="mx-auto mb-3 text-green-500/60 animate-pulse" />
              <h4 className="text-sm font-bold text-white mb-1">
                {appLanguage === 'kn' ? 'ಬೆಳೆ ರೋಗ ಹರಡುವಿಕೆ ವಿಶ್ಲೇಷಣೆ' : appLanguage === 'hi' ? 'फसल रोग प्रसार विश्लेषण' : 'Crop Disease Spread Analysis'}
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                {appLanguage === 'kn'
                  ? 'ರೋಗ ಹರಡುವಿಕೆ ಅಪಾಯದ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಪರಿಹಾರ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಮೇಲಿನ ಪಟ್ಟಿಯಲ್ಲಿ ಬೆಳೆಯನ್ನು ಆರಿಸಿ.'
                  : appLanguage === 'hi'
                  ? 'रोग प्रसार जोखिम पूर्वानुमान और समाधान देखने के लिए कृपया ऊपर एक फसल चुनें।'
                  : 'Please select a crop in the form above to trigger the real-time AI disease spread risk engine and expert remedies.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {/* Alert Banner */}
              {predResult.alert && (
                <div className="py-2.5 px-4 rounded-xl flex items-center gap-2"
                  style={{
                    background: predResult.alert.startsWith('✓') ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: predResult.alert.startsWith('✓') ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                  {predResult.alert.startsWith('✓') ? (
                    <Shield size={14} className="text-green-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-red-400 shrink-0 animate-pulse" />
                  )}
                  <p className="text-xs font-medium" style={{ color: predResult.alert.startsWith('✓') ? '#a7f3d0' : '#fca5a5' }}>
                    {predResult.alert}
                  </p>
                </div>
              )}

              {/* Predicted Weather Summary */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(26,31,28,0.6)', border: '1px solid rgba(42,56,41,0.3)' }}>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                  {t('predictedConditions') || 'Predicted Weather Conditions'} — {predResult.input?.location}, {predResult.input?.date} {predResult.input?.time}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      label: t('temperature') || 'Temperature',
                      val: `${predResult.weather?.temperature}°C`,
                      trend: predResult.weather?.trends?.temperature,
                      severity: getTempSeverity(predResult.weather?.temperature)
                    },
                    {
                      label: t('humidity') || 'Humidity',
                      val: `${predResult.weather?.humidity}%`,
                      trend: predResult.weather?.trends?.humidity,
                      severity: getHumiditySeverity(predResult.weather?.humidity)
                    },
                    {
                      label: t('rainfall') || 'Rainfall',
                      val: `${predResult.weather?.rainfall} mm`,
                      trend: predResult.weather?.trends?.rainfall,
                      severity: getRainfallSeverity(predResult.weather?.rainfall)
                    },
                    {
                      label: t('wind') || 'Wind',
                      val: `${predResult.weather?.wind} km/h`,
                      trend: predResult.weather?.trends?.wind,
                      severity: getWindSeverity(predResult.weather?.wind)
                    },
                  ].map(({ label, val, trend, severity }) => {
                    const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.normal;
                    return (
                      <div
                        key={label}
                        className="p-2 rounded-lg text-center relative overflow-hidden transition-all duration-300"
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          boxShadow: style.glow
                        }}
                      >
                        {severity !== 'normal' && severity !== 'safe' && (
                          <div className="absolute top-1 right-1 flex items-center">
                            <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: style.accent }} />
                          </div>
                        )}
                        <p className="text-[9px] text-gray-400 uppercase">{label}</p>
                        <p className="text-sm font-bold" style={{ color: style.accent }}>{val}</p>
                        {trend && (
                          <p className="text-[10px] font-bold mt-0.5" style={{ color: trend.includes('↑') ? '#4ade80' : trend.includes('↓') ? '#f87171' : '#a0aec0' }}>
                            {trend}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disease Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                  <Shield size={13} />
                  {t('diseaseRiskResults') || 'Disease Risk Results'} — {predResult.input?.crop}
                </h3>

                {(!predResult.diseases || predResult.diseases.length === 0) ? (
                  <div className="p-6 rounded-2xl text-center border transition-all duration-300" style={{ background: 'rgba(26,31,28,0.4)', border: '1px solid rgba(42,56,41,0.25)', backdropFilter: 'blur(8px)' }}>
                    <Shield size={28} className="mx-auto mb-2 text-green-500/60 animate-pulse" />
                    <p className="text-sm font-bold text-gray-200">
                      {appLanguage === 'kn' ? 'ಯಾವುದೇ ಪ್ರಮುಖ ರೋಗ ಹರಡುವಿಕೆ ನಿರೀಕ್ಷೆಯಿಲ್ಲ' : appLanguage === 'hi' ? 'कोई प्रमुख रोग प्रसार की उम्मीद नहीं है' : 'No major disease outbreak expected'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {appLanguage === 'kn' ? 'ಪ್ರಸ್ತುತ ಅಪಾಯದ ಮಟ್ಟ: ಕಡಿಮೆ' : appLanguage === 'hi' ? 'वर्तमान जोखिम स्तर: कम' : 'Current risk level: Low'}
                    </p>
                  </div>
                ) : (
                  (predResult.diseases || []).map((disease, idx) => {
                    const isExpanded = expandedDisease === idx;
                    const riskColor = RISK_COLORS[disease.risk_level] || RISK_COLORS.Medium;
                    const riskBg = RISK_BG[disease.risk_level] || RISK_BG.Medium;
                    const riskBorder = RISK_BORDER[disease.risk_level] || RISK_BORDER.Medium;

                    return (
                      <motion.div
                        key={disease.disease_id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: 'rgba(26,31,28,0.75)', border: `1px solid ${riskBorder}` }}
                      >
                        {/* Disease Header — always visible */}
                        <button
                          onClick={() => setExpandedDisease(isExpanded ? null : idx)}
                          className="w-full p-4 flex items-center gap-3 text-left transition-all"
                          style={{ background: isExpanded ? riskBg : 'transparent' }}
                        >
                          <div className="text-2xl">{RISK_EMOJI[disease.risk_level]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{disease.disease_name}</p>
                            <p className="text-[10px] text-gray-400 italic flex items-center gap-1.5 flex-wrap">
                              <span>{disease.pathogen} ({disease.type})</span>
                              <span>•</span>
                              <span className="text-cyan-400 font-semibold">{t('weather.riskConfidence') || 'Risk Confidence:'} {disease.confidence_score || 82}%</span>
                              <span>•</span>
                              <span className="font-semibold" style={{ color: disease.expected_severity === 'Severe' ? '#f87171' : disease.expected_severity === 'Moderate' ? '#fb923c' : '#4ade80' }}>
                                {t('disease.severity') || 'Severity:'} {t(disease.expected_severity) || disease.expected_severity || 'Moderate'}
                              </span>
                            </p>
                          </div>

                          {/* Risk Score Badge */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                              style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBorder}` }}>
                              {t(disease.risk_level) || disease.risk_level} — {disease.risk_score}%
                            </span>
                            {/* Spread Probability Mini Bar */}
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${disease.spread_probability}%`, background: riskColor }} />
                            </div>
                          </div>

                          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-4 text-gray-200">

                                 {/* Simple Overview (Confidence + Incubation Cycle + Expected Severity) */}
                                 <div className="flex flex-wrap gap-2 pt-2">
                                   <div className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5"
                                     style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                                     <Zap size={11} />
                                     {t('weather.riskConfidenceUpper') || 'RISK CONFIDENCE:'} {disease.confidence_score}%
                                   </div>
                                   <div className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5"
                                     style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
                                     <Shield size={11} />
                                     {t('weather.incubation') || 'INCUBATION:'} {disease.incubation_window}
                                   </div>
                                   <div className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5"
                                     style={{ 
                                       background: disease.expected_severity === 'Severe' ? 'rgba(239,68,68,0.08)' : disease.expected_severity === 'Moderate' ? 'rgba(249,115,22,0.08)' : 'rgba(34,197,94,0.08)', 
                                       border: disease.expected_severity === 'Severe' ? '1px solid rgba(239,68,68,0.25)' : disease.expected_severity === 'Moderate' ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(34,197,94,0.25)', 
                                       color: disease.expected_severity === 'Severe' ? '#f87171' : disease.expected_severity === 'Moderate' ? '#fb923c' : '#4ade80' 
                                     }}>
                                     <AlertCircle size={11} />
                                     {t('weather.severityUpper') || 'SEVERITY:'} {t(disease.expected_severity) || disease.expected_severity || 'Moderate'}
                                   </div>
                                 </div>

                                {/* Spread Probability Bar */}
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(38,43,41,0.4)', border: '1px solid rgba(61,74,61,0.2)' }}>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{t('spreadProbability') || 'Spread Probability'}</span>
                                    <span className="text-sm font-extrabold" style={{ color: riskColor }}>{disease.spread_probability}%</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${disease.spread_probability}%` }}
                                      transition={{ duration: 0.8, delay: 0.2 }}
                                      className="h-full rounded-full"
                                      style={{ background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})` }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-2 text-[10px] text-gray-400 items-center">
                                    <div>
                                      <span>{t('infectionVelocity') || 'Infection Speed'}: <span className="font-bold text-white">{disease.infection_velocity}</span></span>
                                      <span className="ml-3">{t('outbreakWindow') || 'Outbreak Window'}: <span className="font-bold text-white">{disease.outbreak_window}</span></span>
                                    </div>
                                    <VoicePlayer
                                      textToSpeak={buildResultVoiceText(disease)}
                                      label={getSpeakLabel('result')}
                                    />
                                  </div>
                                </div>

                                {/* 3-Day Risk Timeline */}
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(56,189,248,0.15)' }}>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                                    <Clock size={11} />
                                    {t('xaiTimelineTitle') || '3-Day Disease Risk Timeline'}
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(disease.timeline || []).map((tItem, tIdx) => {
                                      const tColor = RISK_COLORS[tItem.risk_level] || RISK_COLORS.Medium;
                                      const tBorder = RISK_BORDER[tItem.risk_level] || RISK_BORDER.Medium;
                                      const tBg = RISK_BG[tItem.risk_level] || RISK_BG.Medium;
                                      return (
                                        <div key={tIdx} className="p-2 rounded-lg text-center transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(16,20,18,0.6)', border: `1px solid ${tBorder}` }}>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase">{tItem.time}</p>
                                          <p className="text-sm font-extrabold mt-1" style={{ color: tColor }}>{tItem.risk_score}%</p>
                                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase" style={{ background: tBg, color: tColor, border: `1px solid ${tBorder}` }}>
                                            {t(tItem.risk_level) || tItem.risk_level}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Disease Risk Score Formula (Explainable AI) */}
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.02)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1.5">
                                    <Brain size={11} />
                                    {t('xaiTitle') || 'Explainable AI (XAI) — Disease Risk Formula'}
                                  </h4>
                                  <div className="p-2 rounded-lg mb-3" style={{ background: 'rgba(16,20,18,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('xaiBaseFormula') || 'Base Formula'}</p>
                                    <p className="text-[11px] font-semibold text-gray-200 leading-relaxed">
                                      {appLanguage === 'kn' ? 'ಅಪಾಯದ ಸ್ಕೋರ್ = ೦.೩೫ × ತೇವಾಂಶ + ೦.೨೫ × ಮಳೆ + ೦.೨೦ × ತಾಪಮಾನ + ೦.೨೦ × ಗಾಳಿ ವೇಗ' : appLanguage === 'hi' ? 'जोखिम स्कोर = 0.35 × आर्द्रता + 0.25 × वर्षा + 0.20 × तापमान + 0.20 × हवा की गति' : 'Risk Score = 0.35 × Humidity + 0.25 × Rainfall + 0.20 × Temperature + 0.20 × Wind Speed'}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    {[
                                      { factor: t('xaiHumidityContrib') || "Humidity Contribution", val: disease.h_contrib || 0, weight: 35, color: "#63b3ed", displayVal: `${predResult.weather?.humidity}%` },
                                      { factor: t('xaiRainfallContrib') || "Rainfall Contribution", val: disease.r_contrib || 0, weight: 25, color: "#38bdf8", displayVal: `${predResult.weather?.rainfall} mm` },
                                      { factor: t('xaiTempContrib') || "Temperature Contribution", val: disease.t_contrib || 0, weight: 20, color: "#fbbf24", displayVal: `${predResult.weather?.temperature}°C` },
                                      { factor: t('xaiWindContrib') || "Wind Speed Contribution", val: disease.w_contrib || 0, weight: 20, color: "#a78bfa", displayVal: `${predResult.weather?.wind} km/h` }
                                    ].map((contribItem, cIdx) => (
                                      <div key={cIdx} className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-medium">
                                          <span className="text-gray-400">{contribItem.factor} ({contribItem.displayVal} × {contribItem.weight}%)</span>
                                          <span className="font-extrabold" style={{ color: contribItem.color }}>{contribItem.val}%</span>
                                        </div>
                                        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                          <div className="h-full rounded-full" style={{ width: `${(contribItem.val / (disease.risk_score || 1)) * 100}%`, backgroundColor: contribItem.color }} />
                                        </div>
                                      </div>
                                    ))}
                                    <div className="border-t border-gray-700/50 pt-2 mt-2 flex justify-between items-center text-xs font-bold text-white">
                                      <span>{t('xaiCalculatedRiskScore') || 'Calculated Disease Risk Score:'}</span>
                                      <span className="text-sm font-black px-2 py-0.5 rounded-md" style={{ color: riskColor, background: riskBg, border: `1px solid ${riskBorder}` }}>
                                        {disease.risk_score}% ({t(disease.risk_level) || disease.risk_level})
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* WHY — Cause Explanation (Farmer Friendly only) */}
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-1">
                                    <AlertTriangle size={11} />
                                    {t('diseaseCauses') || 'Why This Risk?'}
                                  </h4>
                                  <p className="text-xs leading-relaxed text-gray-200">
                                    {disease.farmer_explanation}
                                  </p>
                                  <div className="mt-2.5 flex justify-end">
                                    <VoicePlayer
                                      textToSpeak={buildCausesVoiceText(disease)}
                                      label={getSpeakLabel('causes')}
                                    />
                                  </div>
                                </div>

                                {/* 7. CURE — Prevention & Treatment */}
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1">
                                    <Shield size={11} />
                                    {t('diseaseCure') || 'Cure & Prevention'}
                                  </h4>
                                  <div className="grid md:grid-cols-2 gap-3">
                                    {/* Immediate + Chemical */}
                                    <div className="space-y-2">
                                      {disease.recommended_actions?.immediate_action && (
                                        <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                                          <p className="text-[9px] font-bold uppercase text-red-400 mb-1">{t('immediateAction') || '⚡ Immediate Action'}</p>
                                          <p className="text-[11px] text-gray-200 leading-relaxed">{disease.recommended_actions.immediate_action}</p>
                                        </div>
                                      )}
                                      {disease.recommended_actions?.chemical_control && (
                                        <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                                          <p className="text-[9px] font-bold uppercase text-yellow-400 mb-1">{t('chemicalControl') || '🧪 Chemical Treatment'}</p>
                                          <p className="text-[11px] text-gray-200 leading-relaxed">{disease.recommended_actions.chemical_control}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Preventive + Biological */}
                                    <div className="space-y-2">
                                      {disease.recommended_actions?.preventive_action && (
                                        <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                                          <p className="text-[9px] font-bold uppercase text-green-400 mb-1">{t('prevention') || '🛡️ Prevention'}</p>
                                          <p className="text-[11px] text-gray-200 leading-relaxed">{disease.recommended_actions.preventive_action}</p>
                                        </div>
                                      )}
                                      {disease.recommended_actions?.biological_control && (
                                        <div className="p-2 rounded-lg" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.1)' }}>
                                          <p className="text-[9px] font-bold uppercase text-purple-400 mb-1">{t('biologicalControl') || '🌿 Organic/Biological'}</p>
                                          <p className="text-[11px] text-gray-200 leading-relaxed">{disease.recommended_actions.biological_control}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Irrigation Control */}
                                  {disease.recommended_actions?.irrigation_control && (
                                    <div className="p-2 rounded-lg mt-2" style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.1)' }}>
                                      <p className="text-[9px] font-bold uppercase text-cyan-400 mb-1">{t('irrigationControl') || '💧 Irrigation Advice'}</p>
                                      <p className="text-[11px] text-gray-200 leading-relaxed">{disease.recommended_actions.irrigation_control}</p>
                                    </div>
                                  )}
                                  <div className="mt-3 flex justify-end">
                                    <VoicePlayer
                                      textToSpeak={buildCureVoiceText(disease)}
                                      label={getSpeakLabel('cure')}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>



            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </motion.div>
  );
};

export default WeatherPage;

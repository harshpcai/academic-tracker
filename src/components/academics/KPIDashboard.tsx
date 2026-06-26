import { useEffect, useRef, useState } from 'react';
import { TrendingUp, BookOpen, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateGPA,
  calculatePercentageAverage,
  getGPAColor,
  getGPALabel,
  getTotalCredits,
  getPendingDeadlines,
  getExamRiskScore,
  getRiskColor,
  getRiskLabel,
} from '../../utils/helpers';

function AnimatedCounter({ value, duration = 1500, decimals = 2 }: { value: number; duration?: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startValue.current = display;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue.current + (value - startValue.current) * eased;
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span>{decimals === 0 ? Math.round(display) : display.toFixed(decimals)}</span>;
}

function CircularGauge({ value, max, color, size = 80, strokeWidth = 6 }: { value: number; max: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const dashOffset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
      />
    </svg>
  );
}

export default function KPIDashboard() {
  const { state } = useAcademic();
  const gpa = calculateGPA(state.courses);
  const percentage = calculatePercentageAverage(state.courses);
  const credits = getTotalCredits(state.courses);
  const pending = getPendingDeadlines(state.srTopics);
  const riskScore = getExamRiskScore(state.courses);
  const riskColor = getRiskColor(riskScore);
  const gpaColor = getGPAColor(gpa);

  const kpis: {
    label: string;
    value: number;
    decimals: number;
    icon: typeof TrendingUp;
    color: string;
    sublabel: string;
    gauge: boolean;
    gaugeMax?: number;
  }[] = [
    {
      label: 'Cumulative GPA',
      value: gpa,
      decimals: 2,
      icon: TrendingUp,
      color: gpaColor,
      sublabel: getGPALabel(gpa),
      gauge: true,
      gaugeMax: 4.0,
    },
    {
      label: 'Total Credits',
      value: credits,
      decimals: 0,
      icon: BookOpen,
      color: '#818cf8',
      sublabel: `${state.courses.length} courses`,
      gauge: false,
    },
    {
      label: 'Pending Reviews',
      value: pending,
      decimals: 0,
      icon: Calendar,
      color: pending > 0 ? '#f59e0b' : '#10b981',
      sublabel: 'Due today',
      gauge: false,
    },
    {
      label: 'Exam Risk',
      value: riskScore,
      decimals: 0,
      icon: AlertTriangle,
      color: riskColor,
      sublabel: getRiskLabel(riskScore),
      gauge: true,
      gaugeMax: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="glass rounded-xl p-5 card-hover animate-enter"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md" style={{ background: `${kpi.color}15` }}>
                    <Icon size={16} style={{ color: kpi.color }} />
                  </div>
                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{kpi.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary" style={{ color: kpi.color }}>
                    <AnimatedCounter value={kpi.value} decimals={kpi.decimals} />
                  </span>
                  {kpi.gauge && kpi.gaugeMax !== undefined && (
                    <CircularGauge value={kpi.value} max={kpi.gaugeMax} color={kpi.color} size={36} strokeWidth={4} />
                  )}
                </div>
                <span className="text-xs text-text-secondary mt-1 block">{kpi.sublabel}</span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="col-span-1 sm:col-span-2 lg:col-span-4 glass rounded-xl p-5 animate-enter animate-enter-delay-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary-glow" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Academic Status</span>
          </div>
          <span
            className="badge"
            style={{
              background: `${gpaColor}15`,
              color: gpaColor,
              border: `1px solid ${gpaColor}30`,
            }}
          >
            {getGPALabel(gpa)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-text-tertiary block mb-1">Average Percentage</span>
            <span className="text-lg font-semibold text-text-primary">{percentage}%</span>
            <div className="w-full h-1.5 bg-surface-elevated rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%`, background: gpaColor }}
              />
            </div>
          </div>
          <div>
            <span className="text-xs text-text-tertiary block mb-1">Credit Completion</span>
            <span className="text-lg font-semibold text-text-primary">{credits} ECTS</span>
            <div className="w-full h-1.5 bg-surface-elevated rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (credits / 180) * 100)}%`, background: '#818cf8' }}
              />
            </div>
          </div>
          <div>
            <span className="text-xs text-text-tertiary block mb-1">Risk Assessment</span>
            <span className="text-lg font-semibold" style={{ color: riskColor }}>{riskScore}/100</span>
            <div className="w-full h-1.5 bg-surface-elevated rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${riskScore}%`, background: riskColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertCircle, Clock, Award } from 'lucide-react';
import { getProgress, getSessions, ProgressEntry, Session } from '@/lib/storage';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

function StatCard({ icon, label, value, sublabel, color = '#2e86ab' }: StatCardProps) {
  return (
    <div className="border border-[#e2e8f0] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span style={{ color }} className="opacity-80">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-[#0d1b2a]">{value}</p>
      <p className="text-sm text-[#64748b] mt-0.5">{label}</p>
      {sublabel && <p className="text-xs text-[#94a3b8] mt-1">{sublabel}</p>}
    </div>
  );
}

interface BarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

function Bar({ label, value, max, color = '#2e86ab' }: BarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-[#0d1b2a]">{label}</span>
        <span className="text-sm text-[#64748b]">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface WeeklyBarProps {
  day: string;
  minutes: number;
  maxMinutes: number;
}

function WeeklyBar({ day, minutes, maxMinutes }: WeeklyBarProps) {
  const pct = maxMinutes > 0 ? Math.round((minutes / maxMinutes) * 100) : 0;
  const height = Math.max(4, Math.round((pct / 100) * 80));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs text-[#64748b]">{minutes > 0 ? `${minutes}m` : ''}</span>
      <div className="w-8 bg-[#f1f5f9] rounded-full overflow-hidden" style={{ height: '80px' }}>
        <div
          className="w-full rounded-full bg-[#2e86ab] absolute bottom-0"
          style={{
            height: `${height}px`,
            marginTop: `${80 - height}px`,
            backgroundColor: '#2e86ab',
          }}
        />
      </div>
      <span className="text-xs text-[#64748b]">{day}</span>
    </div>
  );
}

function WeeklyChart({ data }: { data: { day: string; minutes: number }[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  return (
    <div className="flex items-end gap-2 justify-between">
      {data.map((d) => {
        const pct = Math.round((d.minutes / maxMinutes) * 100);
        const heightPct = Math.max(4, pct);
        return (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[10px] text-[#64748b] h-4 flex items-end">
              {d.minutes > 0 ? `${d.minutes}m` : ''}
            </span>
            <div className="w-full h-20 flex items-end">
              <div
                className="w-full rounded-t-lg bg-[#2e86ab]"
                style={{ height: `${heightPct}%`, opacity: d.minutes > 0 ? 1 : 0.15 }}
              />
            </div>
            <span className="text-[10px] text-[#64748b]">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressView() {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setProgress(getProgress());
    setSessions(getSessions());
  }, []);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

  // Weekly activity: last 7 days
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const now = new Date();
  const weekData = weekDays.map((day, i) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - (6 - i));
    const dayStr = dayDate.toDateString();
    const daySessions = sessions.filter(
      (s) => new Date(s.date).toDateString() === dayStr
    );
    const minutes = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    return { day, minutes };
  });

  // Subject distribution
  const subjectCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const subj = s.subject || 'Non specificato';
    subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
  });
  const maxSubjectCount = Math.max(...Object.values(subjectCounts), 1);

  // Average score from progress
  const allScores = progress.flatMap((p) => p.scores);
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  // Topics needing review (score < 60)
  const toReview = progress.filter((p) => {
    const avg = p.scores.length > 0
      ? p.scores.reduce((a, b) => a + b, 0) / p.scores.length
      : 0;
    return avg < 60;
  });

  // Best streak (placeholder — count consecutive days)
  const studyDates = [...new Set(sessions.map((s) => new Date(s.date).toDateString()))].sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let streak = 0;
  for (let i = 0; i < studyDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(studyDates[i - 1]);
      const curr = new Date(studyDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, streak);
  }
  const todayStr = new Date().toDateString();
  const hasStudiedToday = studyDates.includes(todayStr);
  if (hasStudiedToday) currentStreak = streak;

  const isEmpty = totalSessions === 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0d1b2a]">Progressi</h1>
          <p className="text-sm text-[#64748b] mt-1">Il tuo percorso di studio.</p>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl border border-[#e2e8f0] flex items-center justify-center mb-4 text-[#64748b]">
              <TrendingUp size={20} />
            </div>
            <p className="text-sm font-medium text-[#0d1b2a] mb-1">Nessun dato ancora</p>
            <p className="text-xs text-[#64748b] max-w-xs">
              I tuoi progressi appariranno qui dopo le prime sessioni di studio.
            </p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard
                icon={<Clock size={18} />}
                label="Sessioni totali"
                value={totalSessions}
                sublabel={`${totalMinutes} minuti`}
                color="#2e86ab"
              />
              <StatCard
                icon={<Target size={18} />}
                label="Punteggio medio"
                value={allScores.length > 0 ? `${avgScore}%` : '—'}
                sublabel={`${allScores.length} test completati`}
                color="#52b788"
              />
              <StatCard
                icon={<Award size={18} />}
                label="Serie attuale"
                value={`${currentStreak} gg`}
                sublabel={`Migliore: ${maxStreak} giorni`}
                color="#f59e0b"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Messaggi scambiati"
                value={totalMessages}
                sublabel="con FEYMAN AG01"
                color="#8b5cf6"
              />
            </div>

            {/* Weekly activity */}
            <div className="border border-[#e2e8f0] rounded-2xl p-5 mb-4">
              <p className="text-sm font-medium text-[#0d1b2a] mb-4">Attività questa settimana</p>
              <WeeklyChart data={weekData} />
            </div>

            {/* Subject distribution */}
            {Object.keys(subjectCounts).length > 0 && (
              <div className="border border-[#e2e8f0] rounded-2xl p-5 mb-4">
                <p className="text-sm font-medium text-[#0d1b2a] mb-4">Materie studiate</p>
                {Object.entries(subjectCounts).map(([subj, count]) => (
                  <Bar
                    key={subj}
                    label={subj}
                    value={count}
                    max={maxSubjectCount}
                    color="#2e86ab"
                  />
                ))}
              </div>
            )}

            {/* Topics to review */}
            {toReview.length > 0 && (
              <div className="border border-[#e2e8f0] rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={15} className="text-[#f59e0b]" />
                  <p className="text-sm font-medium text-[#0d1b2a]">Da ripassare</p>
                </div>
                <div className="space-y-2">
                  {toReview.map((entry) => {
                    const avg = Math.round(
                      entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length
                    );
                    return (
                      <div
                        key={entry.topicId}
                        className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0"
                      >
                        <div>
                          <p className="text-sm text-[#0d1b2a]">{entry.topic}</p>
                          <p className="text-xs text-[#64748b]">{entry.subject}</p>
                        </div>
                        <span className="text-sm font-medium text-[#f59e0b]">{avg}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personal records */}
            {progress.length > 0 && (
              <div className="border border-[#e2e8f0] rounded-2xl p-5">
                <p className="text-sm font-medium text-[#0d1b2a] mb-3">Record personali</p>
                <div className="space-y-3">
                  {progress
                    .map((p) => ({
                      ...p,
                      avg:
                        p.scores.length > 0
                          ? Math.round(p.scores.reduce((a, b) => a + b, 0) / p.scores.length)
                          : 0,
                      best: p.scores.length > 0 ? Math.max(...p.scores) : 0,
                    }))
                    .sort((a, b) => b.best - a.best)
                    .slice(0, 5)
                    .map((entry) => (
                      <div
                        key={entry.topicId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-[#0d1b2a]">{entry.topic}</p>
                          <p className="text-xs text-[#64748b]">{entry.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#52b788]">{entry.best}%</p>
                          <p className="text-xs text-[#94a3b8]">migliore</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

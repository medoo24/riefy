import { useState } from 'react'
import { useVocabularyBank } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import { Trash2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const STATUS_COLORS: Record<string, string> = {
  new: 'var(--a2)',
  learning: 'var(--gold)',
  known: 'var(--green)',
}

interface VocabularyPageProps {
  mode?: 'language' | 'medical'
}

export default function VocabularyPage({ mode = 'language' }: VocabularyPageProps) {
  const { user } = useAuth()
  const isMedical = mode === 'medical'
  const { vocab, loading, refresh } = useVocabularyBank()
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'known'>('all')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleDelete = async (id: string) => {
    await supabase.from('vocabulary_bank').delete().eq('id', id)
    refresh()
    showToast(isMedical ? 'Deleted' : 'Gelöscht')
  }

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('vocabulary_bank').update({ status }).eq('id', id)
    refresh()
  }

  // Filter list by selected mode: language ('de') vs medical ('en')
  const modeVocab = vocab.filter(v => isMedical ? v.language === 'en' : v.language === 'de')
  const filtered = filter === 'all' ? modeVocab : modeVocab.filter(v => v.status === filter)

  if (!user) {
    return (
      <main className="page-container">
        <div className="page-header"><h1>{isMedical ? 'Medical Vocabulary' : 'Vokabelheft'}</h1></div>
        <div className="empty-state">
          <p>
            {isMedical 
              ? 'Please log in to view your medical vocabulary.' 
              : 'Bitte anmelden, um dein Vokabelheft zu sehen.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>{isMedical ? 'Vocabulary Bank' : 'Vokabelheft'}</h1>
            <p className="text-muted">
              {isMedical 
                ? `${modeVocab.length} saved medical terms` 
                : `${modeVocab.length} gespeicherte Wörter`}
            </p>
          </div>
          <button className="btn-icon" onClick={refresh} title={isMedical ? 'Refresh' : 'Aktualisieren'}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="level-tabs">
        {(['all', 'new', 'learning', 'known'] as const).map(s => (
          <button
            key={s}
            className={`level-tab${filter === s ? ' active-all' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' 
              ? (isMedical ? 'All' : 'Alle') 
              : s === 'new' 
                ? (isMedical ? 'New' : 'Neu') 
                : s === 'learning' 
                  ? (isMedical ? 'Learning' : 'Lerne') 
                  : (isMedical ? 'Mastered' : 'Kann ich')}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>{isMedical ? 'No terms in this category.' : 'Keine Wörter in dieser Kategorie.'}</p>
          <p className="text-xs text-muted-2" style={{ marginTop: 6 }}>
            {isMedical 
              ? 'Save terms in exercises and terminology modules using the bookmark icon.' 
              : 'Speichere Sätze und Wörter mit dem Lesezeichen-Symbol.'}
          </p>
        </div>
      )}

      <div className="vocab-grid">
        {filtered.map(entry => (
          <div key={entry.id} className="vocab-card animate-fade">
            <div className="flex items-center justify-between mb-1">
              <span className={`level-badge level-${entry.level}`}>{entry.level}</span>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: STATUS_COLORS[entry.status] ?? 'var(--text-3)',
                flexShrink: 0,
              }} title={entry.status} />
            </div>

            <div className="vocab-term" style={{ fontFamily: 'Inter, sans-serif' }}>{entry.term}</div>
            <div 
              className="vocab-translation" 
              dir={isMedical ? 'ltr' : 'rtl'}
              style={{ fontSize: isMedical ? '0.88rem' : undefined }}
            >
              {entry.translation}
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
              {entry.times_seen}× {isMedical ? 'seen' : 'gesehen'} · {isMedical ? `from ${entry.source.replace('medical_', '')}` : `aus ${entry.source}`}
            </div>

            {/* Status change */}
            <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
              {(['new', 'learning', 'known'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(entry.id, s)}
                  style={{
                    fontSize: '0.68rem', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${entry.status === s ? STATUS_COLORS[s] : 'var(--border)'}`,
                    background: entry.status === s ? `${STATUS_COLORS[s]}22` : 'transparent',
                    color: entry.status === s ? STATUS_COLORS[s] : 'var(--text-3)',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                    transition: 'all 120ms',
                  }}
                >
                  {s === 'new' 
                    ? (isMedical ? 'New' : 'Neu') 
                    : s === 'learning' 
                      ? (isMedical ? 'Learning' : 'Lerne') 
                      : (isMedical ? 'Mastered' : 'Kann ich')}
                </button>
              ))}
              <button
                onClick={() => handleDelete(entry.id)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--text-3)', cursor: 'pointer', padding: '2px 4px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </main>
  )
}

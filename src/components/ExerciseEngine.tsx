import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Volume2, Square, Mic, MicOff, CheckCircle2, XCircle,
  BookmarkPlus, ChevronRight, ChevronLeft, HelpCircle, Eye, RefreshCw, Sparkles, Sliders
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'

export type StudyMode = 'write' | 'mcq' | 'listen-write' | 'listen-see-write' | 'speak'

interface ExerciseItem {
  id: string
  text: string          // The target German or English text
  translation: string   // The translation or hint in Arabic/English
  level: string         // e.g. A1, B2 or Category
  audioUrl?: string | null
  extra?: string | null // e.g. explanation, plural, article
  categoryLabel?: string
}

interface ExerciseEngineProps {
  items: ExerciseItem[]
  language: 'de-DE' | 'en-US'
  translationLangLabel: string
  onCompleteItem?: (id: string) => void
  onSaveItem?: (item: { term: string; translation: string; level: string }) => void
}

const SPECIAL_CHARS = ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']

export default function ExerciseEngine({
  items,
  language,
  translationLangLabel,
  onCompleteItem,
  onSaveItem
}: ExerciseEngineProps) {
  const { user } = useAuth()
  
  // Progress key unique to this items deck
  const progressKey = `riefy_progress_${language}_${items[0]?.id || 'default'}`
  
  // Load initial index (auto-resume progress)
  const [idx, setIdx] = useState(() => {
    const saved = localStorage.getItem(progressKey)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (parsed >= 0 && parsed < items.length) {
        return parsed
      }
    }
    return 0
  })

  const [mode, setMode] = useState<StudyMode>('write')
  const [typed, setTyped] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [mcqOptions, setMcqOptions] = useState<string[]>([])
  
  // Audio & TTS settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => localStorage.getItem(`riefy_voice_${language}`) || '')
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem(`riefy_rate_${language}`) || '1.0'))
  const [showSettings, setShowSettings] = useState(false)

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const [speechError, setSpeechError] = useState('')

  const [revealed, setRevealed] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | '' } | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const item = items[idx]
  const target = item?.text ?? ''

  // Persist index whenever it changes
  useEffect(() => {
    localStorage.setItem(progressKey, String(idx))
  }, [idx, progressKey])

  // Load browser voices and select premium Google UK English Female voice by default for English
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      setVoices(allVoices)
      
      const langPrefix = language.split('-')[0] // 'en' or 'de'
      const langSpecificVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix))

      // If no custom voice is saved yet, find the best Google voice by default
      if (!localStorage.getItem(`riefy_voice_${language}`)) {
        let bestVoice = null
        if (language === 'en-US') {
          // Priority 1: Google UK English Female
          bestVoice = langSpecificVoices.find(v => 
            v.name.toLowerCase().includes('google') && 
            v.name.toLowerCase().includes('uk') && 
            v.name.toLowerCase().includes('female')
          )
          // Priority 2: Google UK English
          if (!bestVoice) {
            bestVoice = langSpecificVoices.find(v => 
              v.name.toLowerCase().includes('google') && 
              v.name.toLowerCase().includes('uk')
            )
          }
          // Priority 3: Any Google English
          if (!bestVoice) {
            bestVoice = langSpecificVoices.find(v => v.name.toLowerCase().includes('google'))
          }
          // Priority 4: Any English natural voice
          if (!bestVoice) {
            bestVoice = langSpecificVoices.find(v => v.name.toLowerCase().includes('natural'))
          }
        } else {
          // German Google voice default
          bestVoice = langSpecificVoices.find(v => v.name.toLowerCase().includes('google'))
        }
        
        // Fallback if none found
        if (!bestVoice) {
          bestVoice = langSpecificVoices[0]
        }
        
        if (bestVoice) {
          setSelectedVoiceName(bestVoice.name)
          localStorage.setItem(`riefy_voice_${language}`, bestVoice.name)
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [language])

  // Handle voice configuration persistence
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value
    setSelectedVoiceName(voiceName)
    localStorage.setItem(`riefy_voice_${language}`, voiceName)
  }

  // Handle speech rate configuration persistence
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value)
    setSpeed(rate)
  }

  const setSpeed = (rate: number) => {
    setSpeechRate(rate)
    localStorage.setItem(`riefy_rate_${language}`, String(rate))
  }

  // Stop current audio output
  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioPlaying(false)
  }, [])

  // TTS helper using user configured speed and voice
  const playTTS = useCallback((textToSpeak: string) => {
    if (!textToSpeak) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = language
    utterance.rate = speechRate
    
    const voice = voices.find(v => v.name === selectedVoiceName)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setAudioPlaying(true)
    utterance.onend = () => setAudioPlaying(false)
    utterance.onerror = () => setAudioPlaying(false)
    
    window.speechSynthesis.speak(utterance)
  }, [language, selectedVoiceName, speechRate, voices])

  // Play audio url or fallback to TTS
  const playAudio = useCallback(() => {
    const isMedical = language === 'en-US'
    
    // In medical mode, customize text to speak
    if (isMedical) {
      if (mode === 'mcq') {
        const letters = ['A', 'B', 'C', 'D']
        const optionsSpeech = mcqOptions.map((opt, i) => `Option ${letters[i] || (i + 1)}: ${opt}`).join('. ')
        const fullSpeech = `Question: ${item?.translation || ''}. ${optionsSpeech}`
        playTTS(fullSpeech)
        return
      } else {
        const extraText = item?.extra ? `. Explanation: ${item.extra}` : ''
        const fullSpeech = `${target}. Definition: ${item?.translation || ''}${extraText}`
        playTTS(fullSpeech)
        return
      }
    }

    // Standard Language Mode logic (play sound URL or fallback to standard TTS of the target text)
    if (item?.audioUrl) {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(item.audioUrl)
      audioRef.current = audio
      
      audio.onplay = () => setAudioPlaying(true)
      audio.onended = () => setAudioPlaying(false)
      audio.onerror = () => playTTS(target)
      
      audio.play().catch(() => playTTS(target))
    } else {
      playTTS(target)
    }
  }, [item, target, playTTS, language, mode, mcqOptions])

  // Play/Stop toggle helper
  const toggleAudio = () => {
    if (audioPlaying) {
      stopAudio()
    } else {
      playAudio()
    }
  }

  // MCQ Options generator — strips duplicates
  const generateMcqOptions = useCallback((correctText: string) => {
    if (items.length < 2) return [correctText]
    
    // Get unique target texts to prevent duplicate options
    const uniqueTexts = Array.from(new Set(items.map(x => x.text.trim())))
    const list = uniqueTexts.filter(x => x !== correctText.trim())
    
    const shuffled = [...list].sort(() => 0.5 - Math.random())
    const distractors = shuffled.slice(0, 3)
    const combined = [...distractors, correctText.trim()]
    return combined.sort(() => 0.5 - Math.random())
  }, [items])

  const { addXp } = useProgress()
  const [rewardedIdxs, setRewardedIdxs] = useState<Record<number, boolean>>({})

  // 1. Reset card state ONLY when index, mode, or item ID changes
  useEffect(() => {
    setTyped('')
    setSelectedOption(null)
    setSpokenText('')
    setSpeechScore(null)
    setSpeechError('')
    setRevealed(false)

    if (item && mode === 'mcq') {
      setMcqOptions(generateMcqOptions(item.text))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, mode, item?.id])

  // Reset rewarded indices when items change
  useEffect(() => {
    setRewardedIdxs({})
  }, [items])

  // 2. Separate auto-play trigger for listen modes
  useEffect(() => {
    if (item && (mode === 'listen-write' || mode === 'listen-see-write' || mode === 'speak')) {
      const timer = setTimeout(() => playAudio(), 300)
      return () => {
        clearTimeout(timer)
        stopAudio()
      }
    }
  }, [idx, mode, item?.id, playAudio, stopAudio])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  // Standard correctness checks
  const isComplete = typed.trim().toLowerCase() === target.trim().toLowerCase()
  const isMcqCorrect = selectedOption === target
  const isSpeakCorrect = speechScore !== null && speechScore >= 80

  // Handle completion and trigger progress save
  const handleSuccess = useCallback(() => {
    setRevealed(true)
    if (!rewardedIdxs[idx]) {
      setRewardedIdxs(prev => ({ ...prev, [idx]: true }))
      addXp(10) // Add 10 XP for correct completion
    }
    if (onCompleteItem && item) {
      onCompleteItem(item.id)
    }
  }, [onCompleteItem, item, idx, rewardedIdxs, addXp])

  // Listen for typing completion (including listen-write)
  useEffect(() => {
    if (mode === 'write' || mode === 'listen-see-write' || mode === 'listen-write') {
      if (isComplete && typed.length > 0) {
        handleSuccess()
      }
    }
  }, [isComplete, typed, mode, handleSuccess])

  const handleNext = () => {
    setIdx(i => Math.min(i + 1, items.length - 1))
  }

  const handlePrev = () => {
    setIdx(i => Math.max(i - 1, 0))
  }

  const showToast = (msg: string, type: 'success' | 'error' | '' = '') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2200)
  }

  const handleSave = async () => {
    if (!item) return
    if (onSaveItem) {
      onSaveItem({
        term: item.text,
        translation: item.translation,
        level: item.level
      })
      showToast('Saved to vocabulary bank! ✓', 'success')
    }
  }

  // Speech Recognition trigger
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge or Safari.')
      return
    }

    setSpeechError('')
    setSpokenText('')
    setSpeechScore(null)

    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.lang = language
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setIsListening(true)
    
    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript
      setSpokenText(resultText)
      
      const cleanTarget = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim()
      const cleanSpoken = resultText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim()
      
      const score = calculateSimilarity(cleanTarget, cleanSpoken)
      setSpeechScore(score)
      if (score >= 80) {
        handleSuccess()
      }
    }

    rec.onerror = (e: any) => {
      console.error(e)
      setSpeechError('Microphone error or speech not understood.')
      setIsListening(false)
    }

    rec.onend = () => setIsListening(false)
    rec.start()
  }

  // Basic word similarity percentage
  const calculateSimilarity = (s1: string, s2: string): number => {
    const w1 = s1.split(/\s+/)
    const w2 = s2.split(/\s+/)
    let matches = 0
    w1.forEach(word => {
      if (w2.includes(word)) matches++
    })
    const ratio = (matches / Math.max(w1.length, w2.length)) * 100
    return Math.round(ratio)
  }

  // Character-by-character highlight rendering
  const renderChars = () => {
    return target.split('').map((ch, i) => {
      const typedCh = typed[i]
      let cls = 'char char-pending'
      if (i < typed.length) {
        cls = typedCh?.toLowerCase() === ch.toLowerCase() ? 'char-correct' : 'char-wrong'
      } else if (i === typed.length) {
        cls = 'char-cursor'
      }
      return <span key={i} className={`char ${cls}`}>{ch}</span>
    })
  }

  const insertSpecialChar = (ch: string) => {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart ?? typed.length
    const end = input.selectionEnd ?? typed.length
    const newVal = typed.slice(0, start) + ch + typed.slice(end)
    setTyped(newVal)
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + 1, start + 1)
    }, 0)
  }

  if (!item) return null

  const progress = items.length > 0 ? (idx / items.length) * 100 : 0
  const isLanguageMode = language === 'de-DE'
  const targetVoices = voices.filter(v => v.lang.toLowerCase().startsWith(language.split('-')[0]))

  return (
    <div>
      {/* Mode Switches */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 20,
        background: 'var(--bg-2)',
        padding: 4,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        {(['write', 'mcq', 'listen-write', 'listen-see-write', 'speak'] as StudyMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="btn btn-ghost btn-sm"
            style={{
              flex: 1,
              minWidth: '90px',
              border: 'none',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-2)',
              fontSize: '0.78rem',
              padding: '6px 8px',
              borderRadius: '8px'
            }}
          >
            {m === 'write' ? 'Write' :
             m === 'mcq' ? 'MCQ' :
             m === 'listen-write' ? 'Listen & Write' :
             m === 'listen-see-write' ? 'Listen, See & Write' : 'Speak'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2" style={{ marginBottom: 8 }}>
        <span className="text-xs text-muted-2">{idx + 1} / {items.length}</span>
        <span className={`level-badge level-${item.level}`}>{item.level}</span>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="exercise-card animate-fade">
        {/* Category Label */}
        {item.categoryLabel && (
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            marginBottom: 8
          }}>
            {item.categoryLabel}
          </div>
        )}

        {/* ── MODE 1: Write / Typing Mode ── */}
        {(mode === 'write' || mode === 'listen-see-write') && (
          <div className="german-text" style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.45rem)', lineHeight: 1.5 }}>
            {renderChars()}
          </div>
        )}

        {/* ── MODE 2: MCQ Mode ── */}
        {mode === 'mcq' && (
          <div style={{ marginBottom: 20 }}>
            {/* Translation / Hint displayed in midline above the options */}
            <div style={{
              textAlign: 'center',
              padding: '16px 20px',
              background: 'var(--bg-3)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              marginBottom: 20,
            }}>
              <div className="translation-label" style={{ marginBottom: 6 }}>{translationLangLabel}</div>
              <div style={{
                fontFamily: translationLangLabel.includes('Arabic') ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
                direction: translationLangLabel.includes('Arabic') ? 'rtl' : 'ltr',
                fontSize: translationLangLabel.includes('Arabic') ? '1.25rem' : '1.05rem',
                fontWeight: 600,
                color: 'var(--text-0)',
                lineHeight: 1.5
              }}>
                {item.translation}
              </div>
            </div>

            <div className="translation-label" style={{ marginBottom: 8 }}>Select the correct matching phrase:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mcqOptions.map((opt, oIdx) => {
                let btnCls = 'grammar-option'
                if (selectedOption || revealed) {
                  if (opt === target) btnCls += ' correct'
                  else if (opt === selectedOption) btnCls += ' wrong'
                }
                return (
                  <button
                    key={oIdx}
                    className={btnCls}
                    disabled={selectedOption !== null || revealed}
                    onClick={() => {
                      setSelectedOption(opt)
                      setRevealed(true)
                      if (opt === target) handleSuccess()
                    }}
                    style={{ fontSize: '0.98rem', fontFamily: 'Inter, sans-serif' }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── MODE 3: Dictation (Listen & Write) Mode ── */}
        {mode === 'listen-write' && (
          <div style={{
            padding: '30px 20px',
            background: 'var(--bg-3)',
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--border-active)',
            textAlign: 'center',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={toggleAudio} style={{ borderRadius: 'var(--radius-full)' }}>
                {audioPlaying ? <Square size={16} /> : <Volume2 size={16} />} {audioPlaying ? 'Stop Audio' : 'Listen / Play'}
              </button>
            </div>
            <p className="text-muted-2 text-xs" style={{ marginTop: 10 }}>Listen to the recording and type what you hear below.</p>
          </div>
        )}

        {/* ── MODE 4: Speak Mode ── */}
        {mode === 'speak' && (
          <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 20 }}>
            <div className="translation-label" style={{ marginBottom: 8 }}>Listen and Repeat:</div>
            <div className="german-text" style={{ fontSize: '1.25rem', marginBottom: 16 }}>{target}</div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button className="btn-icon" onClick={toggleAudio} title={audioPlaying ? "Stop model speech" : "Play model speech"} style={{ padding: 12 }}>
                {audioPlaying ? <Square size={20} /> : <Volume2 size={20} />}
              </button>
              <button
                onClick={toggleListening}
                className="btn btn-primary"
                style={{
                  background: isListening ? 'var(--red)' : 'var(--accent)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 24px'
                }}
              >
                {isListening ? (
                  <>
                    <MicOff size={16} className="animate-pulse" /> Listening...
                  </>
                ) : (
                  <>
                    <Mic size={16} /> Click to Speak
                  </>
                )}
              </button>
            </div>

            {spokenText && (
              <div style={{ marginTop: 20, textAlign: 'left', padding: 14, background: 'var(--bg-3)', borderRadius: 'var(--radius)' }} className="animate-fade">
                <div className="translation-label" style={{ marginBottom: 4 }}>You said:</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-0)', fontWeight: 600 }}>"{spokenText}"</div>
                {speechScore !== null && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} style={{ color: 'var(--gold)' }} />
                    <span className="text-xs font-semibold" style={{ color: isSpeakCorrect ? 'var(--green)' : 'var(--gold)' }}>
                      Match Accuracy: {speechScore}% {isSpeakCorrect ? '(Passed ✓)' : '(Try again)'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {speechError && (
              <div style={{ marginTop: 12, color: 'var(--red)', fontSize: '0.85rem' }}>{speechError}</div>
            )}
          </div>
        )}

        {/* German special character bar for typing-based modes */}
        {isLanguageMode && (mode === 'write' || mode === 'listen-write' || mode === 'listen-see-write') && !revealed && (
          <div className="special-chars" style={{ marginTop: 16 }}>
            {SPECIAL_CHARS.map(ch => (
              <button key={ch} className="special-char-btn" onClick={() => insertSpecialChar(ch)}>
                {ch}
              </button>
            ))}
          </div>
        )}

        {/* Input box for typing modes */}
        {(mode === 'write' || mode === 'listen-write' || mode === 'listen-see-write') && (
          <div className="typing-input-wrapper" style={{ marginTop: 16 }}>
            <input
              ref={inputRef}
              autoFocus
              className={`typing-input${isComplete ? ' correct' : typed.length > 0 && !isComplete ? ' wrong' : ''}`}
              value={typed}
              onChange={e => { if (!revealed) setTyped(e.target.value) }}
              onKeyDown={e => { if (e.key === 'Enter' && revealed) handleNext() }}
              placeholder={
                mode === 'listen-write'
                  ? 'Type what you hear…'
                  : 'Type here…'
              }
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        )}

        {/* Translation reveal / explanation panel (NOT shown in MCQ mode here) */}
        {mode !== 'mcq' && (revealed || mode === 'speak' || mode === 'listen-see-write') && (
          <div className="translation-reveal animate-fade" style={{ marginTop: 20 }}>
            <div className="translation-label">{translationLangLabel}</div>
            <div
              className="translation-text"
              style={{
                fontFamily: translationLangLabel.includes('Arabic') ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
                direction: translationLangLabel.includes('Arabic') ? 'rtl' : 'ltr',
                fontSize: translationLangLabel.includes('Arabic') ? '1.15rem' : '0.98rem'
              }}
            >
              {item.translation}
            </div>
            {item.extra && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                {item.extra}
              </div>
            )}
          </div>
        )}

        {/* Explanation shown after choice selection or reveal in MCQ mode */}
        {mode === 'mcq' && (selectedOption || revealed) && (
          <div className="translation-reveal animate-fade" style={{ marginTop: 20 }}>
            <div className="translation-label">Explanation / Clinical Pearl</div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-1)', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
              {selectedOption === target ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 600, marginBottom: 8 }}>
                  <CheckCircle2 size={16} /> Correct Option Selected!
                </div>
              ) : selectedOption ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>
                  <XCircle size={16} /> Incorrect Option Selected. Correct was: {target}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-light)', fontWeight: 600, marginBottom: 8 }}>
                  <CheckCircle2 size={16} /> Revealed Correct Option: {target}
                </div>
              )}
              {item.extra && <p style={{ marginTop: 4 }}>{item.extra}</p>}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn-icon" onClick={toggleAudio} title={audioPlaying ? "Stop Audio" : "Play Audio"}>
            {audioPlaying ? <Square size={16} /> : <Volume2 size={16} />}
          </button>
          
          {onSaveItem && user && (
            <button className="btn-icon" onClick={handleSave} title="Save to Vocab">
              <BookmarkPlus size={16} />
            </button>
          )}

          <button 
            className="btn-icon" 
            onClick={() => setShowSettings(!showSettings)} 
            title="Voice & Speed Settings"
            style={{ background: showSettings ? 'var(--accent-dim)' : 'transparent', color: showSettings ? 'var(--accent-light)' : 'var(--text-2)' }}
          >
            <Sliders size={16} />
          </button>

          {/* Right-aligned constant navigation block */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={handlePrev} 
              disabled={idx === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              title="Previous Question"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {!revealed ? (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setRevealed(true)}
                style={{ borderColor: 'var(--accent-light)' }}
              >
                Reveal
              </button>
            ) : (
              <button 
                className="btn btn-ghost btn-sm" 
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed', color: 'var(--green)' }}
              >
                Revealed ✓
              </button>
            )}

            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleNext} 
              disabled={idx === items.length - 1}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              title="Next Question"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Voice and Speed configuration settings block */}
        {showSettings && (
          <div className="translation-reveal animate-fade" style={{ marginTop: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-0)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={14} style={{ color: 'var(--accent-light)' }} /> Audio & TTS Settings
            </div>
            
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">TTS Voice</label>
              <select 
                className="form-input" 
                value={selectedVoiceName} 
                onChange={handleVoiceChange}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                {targetVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} {v.localService ? '(Local)' : ''}
                  </option>
                ))}
                {targetVoices.length === 0 && (
                  <option value="">No custom voices available for {language}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label className="form-label">Speech Speed</label>
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>{speechRate}x</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={speechRate} 
                  onChange={handleRateChange} 
                  style={{ flex: 1, accentColor: 'var(--accent)' }}
                />
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => setSpeed(1.0)}
                  style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Alert */}
      <div className={`toast${toast ? ' show' : ''}${toast?.type ? ` ${toast.type}` : ''}`}>
        {toast?.msg}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import { getInitialFiles, getCodeTemplates } from './utils/fakeCodeTemplates';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import VSCodeLayout from './components/VSCodeLayout';
import { Terminal as TermIcon, Monitor, ArrowRight, Shield, Globe } from 'lucide-react';

const PROJECT_NAMES = [
  'enterprise-portal-service',
  'core-auth-gateway',
  'nexus-data-pipeline',
  'quantum-render-engine',
  'phoenix-mesh-broker',
  'sentinel-security-handler',
  'aurora-cloud-adapter',
  'genesis-ledger-api',
  'synergy-analytics-suite',
  'apex-worker-orchestrator'
];

const TRANSLATIONS = {
  ko: {
    introTitle: "fakeCLI - 업무 위장용 코딩 시뮬레이터",
    introDesc: "회사나 공공장소에서 주변의 눈치 보지 않고 열심히 일하는 것처럼 위장(fake)하는 코딩 시뮬레이터입니다. 시뮬레이션 본 화면(VS Code UI)에 진입하면 모든 fake 흔적이 완벽하게 숨겨집니다.",
    fullscreenBanner: "더 그럴듯한 효과를 위해 **F11 키** 또는 이 배너를 클릭해 **전체화면**을 활성화하세요!",
    claudeCardTitle: "Claude Code",
    claudeCardDesc: "Claude Code CLI의 디자인, 프롬프트 입력 및 Thinking 툴박스 프로세스를 모사합니다. 코드 수정 승인 시 에디터 소스 자동 타이핑을 개시합니다.",
    antigravityCardTitle: "AntigravityCLI",
    antigravityCardDesc: "Google DeepMind의 키보드 지향 TUI 모니터링 환경을 모사합니다. 병렬 에이전트 대시보드 상태 및 대량의 컴파일/테스트 트레이스 로그를 출력합니다.",
    cardBtn: "구동하기",
    donationTitle: "☕ 개발자에게 따뜻한 커피 한 잔 선물하기 (암호화폐 후원)",
    footer: "© 2026 fakeCLI. 회사 업무 보안 위장 전용 툴킷.",
    disclaimer: "⚠️ 본 사이트는 학습 및 유머 목적으로 제작된 비상업적 시뮬레이터이며, Anthropic 또는 Google DeepMind와 어떠한 제휴나 관계도 없는 개인의 창작 프로젝트입니다."
  },
  en: {
    introTitle: "fakeCLI - Work Camouflage Coding Simulator",
    introDesc: "A coding simulator that makes you look like you are working hard. Once you enter the simulation (VS Code UI), all traces of 'fake' are completely hidden from colleagues and bosses.",
    fullscreenBanner: "For a more realistic effect, press **F11** or click this banner to enable **fullscreen** mode!",
    claudeCardTitle: "Claude Code",
    claudeCardDesc: "Simulate Claude Code's design, prompt input, and Thinking toolcall processes. Trigger automatic editor typing upon change approval.",
    antigravityCardTitle: "AntigravityCLI",
    antigravityCardDesc: "Simulate Google DeepMind's keyboard-driven TUI console. Display parallel agent dashboards and stream large amounts of compilation/test logs.",
    cardBtn: "Launch",
    donationTitle: "☕ Buy the Developer a Coffee (Crypto Donation)",
    footer: "© 2026 fakeCLI. Exclusive office work camouflage toolkit.",
    disclaimer: "⚠️ This site is a non-commercial simulator created for educational and entertainment purposes. It is an independent project with no official affiliation with Anthropic or Google DeepMind."
  }
};

const detectOS = () => {
  if (typeof window === 'undefined') return 'windows';
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  return 'windows';
};

function App() {
  const [activeMode, setActiveMode] = useState('intro');
  const [workspaceName, setWorkspaceName] = useState('enterprise-portal-service');
  const [osType, setOsType] = useState('windows');
  const [lang, setLang] = useState('en'); // 기본 언어: 영어
  
  // 가상 파일 시스템 상태
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('src/App.jsx');
  const [newFilesTracker, setNewFilesTracker] = useState({});

  // 에디터 타이핑 상태
  const [typingTarget, setTypingTarget] = useState(null);

  // Vibe 폭풍 코딩 모드 상태
  const [isVibeMode, setIsVibeMode] = useState(false);
  const [vibeProgress, setVibeProgress] = useState(0);

  // F11 전체화면 권장 알림창 상태
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 초기화 (OS 감지 및 랜덤 워크스페이스 선정)
  useEffect(() => {
    setOsType(detectOS());

    const randomIdx = Math.floor(Math.random() * PROJECT_NAMES.length);
    const chosenProject = PROJECT_NAMES[randomIdx];
    setWorkspaceName(chosenProject);

    // 언어에 맞춰 초기 파일셋 로드
    const baseFiles = getInitialFiles(lang);
    const parsed = JSON.parse(baseFiles['package.json']);
    parsed.name = chosenProject;
    baseFiles['package.json'] = JSON.stringify(parsed, null, 2);
    setFiles(baseFiles);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 언어 변경 시 파일 시스템 다국어 내용 갱신
  const handleLangChange = (selectedLang) => {
    setLang(selectedLang);
    
    // 파일 시스템 내용도 동적으로 전환 (수정 중이던 템플릿 포함)
    const baseFiles = getInitialFiles(selectedLang);
    const parsed = JSON.parse(baseFiles['package.json']);
    parsed.name = workspaceName;
    baseFiles['package.json'] = JSON.stringify(parsed, null, 2);

    // 사용자가 Login 이나 Dashboard 등을 이미 생성한 상태라면, 번역된 템플릿으로 치환
    setFiles(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key === 'src/App.jsx') {
          // App.jsx의 템플릿 문맥 보존 처리
          const templates = getCodeTemplates(selectedLang);
          const currentContent = updated[key] || '';
          if (currentContent.includes('appWithError') || currentContent.includes('BUG INCLUDED') || currentContent.includes('오류 포함')) {
            updated[key] = templates.appWithError.code;
          } else if (currentContent.includes('appRefactor') || currentContent.includes('IntegratedSystem') || currentContent.includes('통합본')) {
            updated[key] = templates.appRefactor.code;
          } else {
            updated[key] = baseFiles[key];
          }
        } else if (baseFiles[key]) {
          updated[key] = baseFiles[key];
        } else {
          // components 내 생성된 코드가 있으면 getCodeTemplates 분기 적용
          const templates = getCodeTemplates(selectedLang);
          if (key === 'src/components/Login.jsx' && templates.login) {
            updated[key] = templates.login.code;
          }
          if (key === 'src/components/Dashboard.jsx' && templates.dashboard) {
            updated[key] = templates.dashboard.code;
          }
          if (key === 'src/utils/helpers.js' && templates.helpersDebug) {
            updated[key] = templates.helpersDebug.code;
          }
          if (key === 'src/components/VibeVisualizer.jsx' && templates.vibeCode) {
            updated[key] = templates.vibeCode;
          }
        }
      });
      return updated;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`전체화면 전환에 실패했습니다: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSelectMode = (mode) => {
    const baseFiles = getInitialFiles(lang);
    const parsed = JSON.parse(baseFiles['package.json']);
    parsed.name = workspaceName;
    baseFiles['package.json'] = JSON.stringify(parsed, null, 2);

    setFiles(baseFiles);
    setActiveFile('src/App.jsx');
    setNewFilesTracker({});
    setTypingTarget(null);
    setIsVibeMode(false);
    setVibeProgress(0);
    
    setActiveMode(mode);
  };

  const handleTriggerTyping = (filename, templateKey) => {
    const templates = getCodeTemplates(lang);
    const template = templates[templateKey];
    if (!template) return;

    setFiles(prev => {
      if (!prev[filename]) {
        return {
          ...prev,
          [filename]: ''
        };
      }
      return prev;
    });

    if (filename.includes('components/')) {
      setNewFilesTracker(prev => ({
        ...prev,
        [filename]: true
      }));
    }

    setActiveFile(filename);
    setTypingTarget({
      filename: filename,
      code: template.code || template
    });
  };

  const handleTypingComplete = () => {
    setTypingTarget(null);
    if (window.triggerTerminalFinish) {
      window.triggerTerminalFinish();
    }
  };

  const handleToggleVibeMode = (enabled) => {
    setIsVibeMode(enabled);
    if (enabled) {
      const targetFilename = 'src/components/VibeVisualizer.jsx';
      setFiles(prev => ({
        ...prev,
        [targetFilename]: ''
      }));
      setNewFilesTracker(prev => ({
        ...prev,
        [targetFilename]: true
      }));
      setActiveFile(targetFilename);
      setVibeProgress(0);
    }
  };

  const handleVibeProgress = (progress) => {
    setVibeProgress(progress);
    const templates = getCodeTemplates(lang);
    if (progress >= templates.vibeCode.length) {
      setIsVibeMode(false);
      if (window.triggerTerminalFinish) {
        window.triggerTerminalFinish();
      }
    }
  };

  const handleFileSelect = (filename) => {
    setActiveFile(filename);
  };

  const handleFileUpdate = (filename, nextContent) => {
    setFiles(prev => ({
      ...prev,
      [filename]: nextContent
    }));
  };

  const t = TRANSLATIONS[lang];
  const templates = getCodeTemplates(lang);

  // 첫 화면(Intro Screen) 렌더링
  if (activeMode === 'intro') {
    return (
      <div className="intro-screen">
        <div className="glass-panel intro-container">
          
          {/* 다국어 선택 스위치 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '8px' }}>
            <button 
              onClick={() => handleLangChange('ko')} 
              className={`lang-btn ${lang === 'ko' ? 'active' : ''}`}
            >
              <Globe size={12} style={{ marginRight: '4px' }} />
              한국어
            </button>
            <button 
              onClick={() => handleLangChange('en')} 
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            >
              <Globe size={12} style={{ marginRight: '4px' }} />
              English
            </button>
          </div>

          {/* 헤더 타이틀 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-claude)', marginBottom: '10px' }}>
              <TermIcon size={36} />
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--txt-light)', letterSpacing: '-1px' }}>
                fakeCLI
              </h1>
            </div>
            <p className="intro-header-desc">
              {t.introDesc}
            </p>
          </div>

          {/* 전체화면 권장 알림 배너 */}
          {!isFullscreen && (
            <div className="fade-in intro-alert-banner" onClick={toggleFullscreen}>
              <Monitor size={18} style={{ color: 'var(--color-claude)' }} />
              <span style={{ fontSize: '13px' }}>
                {t.fullscreenBanner}
              </span>
            </div>
          )}

          {/* 모드 선택 카드 레이아웃 */}
          <div className="intro-cards-wrapper">
            {/* 1. Claude Code */}
            <div 
              className="intro-card claude" 
              onClick={() => handleSelectMode('claude')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(235, 126, 89, 0.15)', color: 'var(--color-claude)' }}>AI</span>
                
                {/* 안트로픽 클로드 공식 로고 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#eb7e59" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" style={{ flex: 'none' }}>
                  <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--txt-light)', marginBottom: '8px' }}>
                {t.claudeCardTitle}
              </h3>
              <p className="intro-card-desc">
                {t.claudeCardDesc}
              </p>
              <div className="card-footer">
                <span>{t.cardBtn}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* 2. AntigravityCLI */}
            <div 
              className="intro-card antigravity" 
              onClick={() => handleSelectMode('antigravity')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(62, 207, 142, 0.15)', color: 'var(--color-antigravity)' }}>TUI</span>
                
                {/* 구글 딥마인드 공식 로고 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#3ecf8e" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" style={{ flex: 'none' }}>
                  <path d="M5.988 1.622A8.539 8.539 0 003.45 8.446c.349 4.408 4.506 7.995 8.276 7.995 3.507 0 4.88-3.061 4.541-5.14a4.318 4.318 0 00-.95-2.073c.632.34 1.244.776 1.809 1.3 1.52 1.415 2.44 3.229 2.587 5.1C20.04 19.763 16.98 24 11.863 24c-1.695 0-3.48-.432-4.98-1.143C2.816 20.937 0 16.797 0 12.002 0 7.571 2.405 3.7 5.988 1.622zM12.136 0c1.696 0 3.481.432 4.98 1.143C21.186 3.063 24 7.203 24 11.998c0 4.431-2.405 8.303-5.988 10.38a8.539 8.539 0 002.538-6.824c-.349-4.408-4.506-7.995-8.276-7.995-3.507 0-4.88 3.061-4.541 5.14a4.3 4.3 0 00.953 2.073 8.723 8.723 0 01-1.81-1.3c-1.52-1.415-2.44-3.227-2.589-5.1C3.96 4.237 7.02 0 12.137 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--txt-light)', marginBottom: '8px' }}>
                {t.antigravityCardTitle}
              </h3>
              <p className="intro-card-desc">
                {t.antigravityCardDesc}
              </p>
              <div className="card-footer">
                <span>{t.cardBtn}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* 하단 푸터 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center' }}>
            <div style={{ color: 'rgba(217, 119, 86, 0.45)', fontSize: '11px', marginBottom: '16px', padding: '0 20px', lineHeight: '1.5' }}>
              {t.disclaimer}
            </div>
            
            {/* NOWPayments 기부 링크 탑재 */}
            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>
                {t.donationTitle}
              </p>
              <div className="nowpayments-donation-wrapper">
                <a 
                  href={`https://nowpayments.io/donation?api_key=${import.meta.env.VITE_NOWPAYMENTS_API_KEY || ''}`} 
                  target="_blank" 
                  rel="noreferrer noopener"
                  className="nowpayments-btn"
                >
                  <img 
                    src="https://nowpayments.io/images/embeds/donation-button-white.svg" 
                    alt="Cryptocurrency & Bitcoin donation button by NOWPayments" 
                  />
                </a>
              </div>
            </div>

            <div style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>
              {t.footer}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // VS Code 메인 시뮬레이션 화면 렌더링
  return (
    <VSCodeLayout 
      activeMode={activeMode} 
      activeFile={activeFile}
      workspaceName={workspaceName}
      osType={osType}
      onExit={() => setActiveMode('intro')}
      lang={lang}
    >
      <Sidebar 
        files={files} 
        activeFile={activeFile} 
        onFileSelect={handleFileSelect} 
        newFilesTracker={newFilesTracker}
        workspaceName={workspaceName}
        lang={lang}
      />
      <Editor 
        activeFile={activeFile} 
        files={files}
        onFileUpdate={handleFileUpdate}
        typingTarget={typingTarget}
        onTypingComplete={handleTypingComplete}
        isVibeMode={isVibeMode}
        onToggleVibeMode={handleToggleVibeMode}
        vibeTargetCode={templates.vibeCode}
        vibeProgress={vibeProgress}
        onVibeProgress={handleVibeProgress}
        lang={lang}
      />
      <Terminal 
        mode={activeMode}
        lang={lang}
        onTriggerTyping={handleTriggerTyping}
        onToggleVibeMode={handleToggleVibeMode}
        isVibeMode={isVibeMode}
        onExit={() => setActiveMode('intro')}
      />
    </VSCodeLayout>
  );
}

export default App;


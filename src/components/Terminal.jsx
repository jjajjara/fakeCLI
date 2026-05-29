import React, { useState, useEffect, useRef } from 'react';

// 지연 시간 상수 정의
const DELAY_SHORT = 400;
const DELAY_MEDIUM = 1000;
const DELAY_LONG = 2000;

// Antigravity CLI ASCII 로고 정의
const ANTIGRAVITY_ASCII_LOGO = `
   _   _  _ _____ ___ ___ ___  _____     _____ _______   __
  /_\\ | \\| |_   _|_ _/ __| _ \\/_\\ \\ \\   / /_ _|_   _\\ \\ / /
 / _ \\| .\` | | |  | | (_ |   / _ \\ \\ \\_/ / | |  | |  \\ V / 
/_/ \\_\\_|\\_| |_| |___\\___|_|_/_/ \\_\\ \\___/ |___| |_|   |_|  
  -- Google DeepMind Advanced Agentic Coding System v2.0 --
`;

// 터미널 다국어 사전 정의
const TERMINAL_LANG = {
  ko: {
    welcomeScan: "프로젝트 스캔 완료. package.json 탐지됨 (React v19.0.0)",
    welcomeHelp: "명령어를 입력하거나 질문을 입력하세요. (도움말: /help 또는 help)",
    welcomeTip1: '※ 핵심 기능: "/debug" 입력 시 10분 분량의 초장기 가상 디버깅이 시작됩니다.',
    welcomeTip2: '※ 팁: 작업 중 "Ctrl+C"를 누르면 언제든지 시뮬레이션이 취소되고 복귀합니다.',
    
    agWelcome: "Google DeepMind Antigravity CLI에 오신 것을 환영합니다.",
    agWelcomeHost: "호스트 환경 감지: OS: Windows 11, Shell: powershell",
    agWelcomeHelp: "준비 완료. 명령어 리스트를 보려면 \"help\" 또는 \"/help\"를 입력하세요.",
    agWelcomeTip1: '※ 핵심 기능: "run" 또는 "/run"을 입력하면 병렬 에이전트 TUI 감시 콘솔이 작동합니다.',
    agWelcomeTip2: '※ "/skills", "/artifacts" 등의 특수 슬래시 명령어로 가상의 에셋을 조회해 보세요.',
    
    sigintExit: "⚠️ [SIGINT] 프로세스가 사용자에 의해 강제 중단되었습니다.",
    sigintReset: "터미널 쉘 포커스를 초기화합니다.",
    
    helpTable: `┌─────────────────────────┬────────────────────────────────────────────────────┐
│ 명령어 (Command)         │ 설명 (Description)                                 │
├─────────────────────────┼────────────────────────────────────────────────────┤
│ /debug (또는 debug)      │ 10분 분량의 초장기 가상 디버깅 파이프라인 구동     │
│ ai "미션"               │ AI에게 코딩 미션 부여 (예: ai login, ai dashboard) │
│ vibe                    │ 폭풍 코딩 시뮬레이션 모드 진입                     │
│ clear (또는 cls)         │ 화면 버퍼 정리                                     │
│ exit                    │ 인트로 화면(첫 페이지)으로 복귀                    │
└─────────────────────────┴────────────────────────────────────────────────────┘`,
    
    agHelpTable: `┌─────────────────────────┬────────────────────────────────────────────────────┐
│ 명령어 (Command)         │ 설명 (Description)                                 │
├─────────────────────────┼────────────────────────────────────────────────────┤
│ run (또는 /run)         │ 병렬 에이전트 TUI 관제 콘솔 기동                   │
│ debug (또는 /debug)      │ 10분 분량의 초장기 가상 디버깅 파이프라인 구동     │
│ ai "미션"               │ AI에게 코딩 미션 부여 (예: ai login, ai dashboard) │
│ vibe                    │ 폭풍 코딩 시뮬레이션 모드 진입                     │
│ /skills                 │ 마운트된 자율 주행 스킬 리스트 로드                │
│ /artifacts              │ 생성된 가짜 계획서 및 코드 산출물 목록 조회        │
│ /what                   │ 현재 백그라운드 에이전트 태스크 상황 보고          │
│ clear (또는 cls)         │ 화면 버퍼 정리                                     │
│ exit                    │ 인트로 화면(첫 페이지)으로 복귀                    │
└─────────────────────────┴────────────────────────────────────────────────────┘`,

    skillsTitle: "📂 워크스페이스 내 활성 에이전트 스킬 목록:",
    artifactsTitle: "📂 로컬 워크스페이스 내 산출물(Artifacts) 목록:",
    whatTitle: "🔍 백그라운드 모니터 상태:",
    whatIdle: "현재 동작 중인 병렬 태스크가 없습니다. \"run\"을 입력하여 파이프라인을 기동하세요.",
    whatRunning: "병렬 에이전트들이 소스 코드 성능 튜닝 및 가속 알고리즘 개발을 연동 조율 중입니다.",
    cmdError: "powershell: '{0}' 용어가 cmdlet, 함수, 스크립트 또는 프로그램 이름으로 인식되지 않습니다.",
    
    // 디버그 시나리오 멘트
    dbgLoading: "🔧 가상 디버깅 스킬 [/debug] 로딩 중...",
    dbgIntro: "디버그 스킬을 구동합니다. 프로젝트 내 결함 탐지 및 통합 릴리즈 복구를 순차적으로 실행합니다.",
    dbgP1Start: "⚡ Phase 1: 로컬 빌드 상태 검증 및 가상 테스트 모듈 기동...",
    dbgP1Runs: "  ⏳ 실행 중  ",
    dbgP1Pass: "  ✓ 통과  ",
    dbgP1Fail: "  ❌ 실패  ",
    dbgP1FailDetail: "     ● App > 사용자 세션 강제 마운트 및 렌더링 테스트 실패\n       TypeError: Cannot read properties of undefined (reading 'name')\n         at App (src/App.jsx:18:42)",
    dbgP1Summary: "Tests:       1 failed, 6 passed, 7 total\nSnapshots:   0 total\nTime:        15.84s\n❌ [npm run test:debug] 에러 스택 감지 완료. 분석 단계로 진입합니다.",
    
    dbgP2Start: "⚡ Phase 2: 코드베이스 결함 분석 및 연관 파일 Grep 탐색...",
    dbgP2Match: "Grep 검색결과: 1 match found in src/App.jsx:18",
    dbgP2Report: "🤖 [분석 리포트] src/App.jsx 소스 내에서 currentUser의 초기값은 undefined 상태이나, 렌더링 영역(18라인)에서 안전장치 없이 currentUser.name에 직접 접근하여 에러를 유발하고 있습니다.\n이를 해결하기 위해 App.jsx를 조건부 렌더링으로 수정하겠습니다.",
    
    dbgP3Prompt: "Do you want to apply these changes? [y/N]",
    dbgP3TimeoutInfo: "ℹ/ (자율 주행 기능: 자리를 비우셔도 15초 후 자율 주행 모드로 자동 승인되어 진행됩니다.)",
    dbgP3TimeoutAct: "⏰ [자동 승인 타임아웃 15s 경과] 자동 승인(y)하고 리팩토링에 착수합니다.",
    
    dbgP4Start: "⚡ Phase 4: src/App.jsx 파일의 소스 코드를 개정하여 디버깅을 시작합니다...",
    
    dbgP5Start: "⚡ Phase 5: 리팩토링 코드 로컬 빌드 진단 실행 중...",
    dbgP5Fail: "❌ 빌드 실패: Module not found: Can't resolve 'src/utils/helpers.js' in src/App.jsx\n  진단 결과: 리팩토링 소스에서 성능 최적화 연산을 위해 helpers.js의 임포트가 명시되었으나 파일이 누락되었습니다.",
    dbgP5Install: "⚙️ 의존성 설치 진행: [run_command] npm install 실행 중...",
    dbgP5InstallBar: "  [{0}] {1}% - npm 레지스트리로부터 패키지 다운로드 중...",
    dbgP5InstallDone: "  ✓ added 14 packages, updated 2 packages in 12.4s",
    
    dbgP6Start: "⚡ Phase 6: 누락된 성능 최적화 유틸리티 모듈(helpers.js)을 생성하여 적용합니다...",
    
    dbgP7Start: "⚡ Phase 7: 수정 및 신규 추가된 전체 모듈에 대한 통합 테스트 최종 구동...",
    dbgP7Summary: "Test Suites: 9 passed, 9 total\nTests:       58 passed, 58 total\nTime:        24.12s\n🎉 모든 테스트 스위트 100% 통과 완료! 변경사항 커밋 단계 돌입.",
    dbgP7CommitMsg: "[main f1245a9] refactor: fix session user null pointer type error and optimize performance helper",
    dbgP7PushDone: "   d9a74cf..f1245a9  main -> main\n✓ git push origin main 전송 성공.",
    dbgP7Done: "✓ Claude Code가 디버깅 미션을 모두 성공적으로 완수했습니다! (총 소요 시간: 10분 12초)",
    
    // 일반 AI 멘트
    aiThinking: "Thinking... 분석 작업을 진행 중입니다.",
    aiSolution: "🤖 해결 방안이 수립되었습니다.",
    aiSolutionLogin: "App.jsx 내 로그인 세션을 처리하기 위해 Login.jsx 컴포넌트를 새로 생성하고 App.jsx를 리팩토링하겠습니다.\n\n수정할 내역:\n  - [NEW] src/components/Login.jsx\n  - [MODIFY] src/App.jsx",
    aiSolutionDash: "차트 및 시스템 모니터링 대시보드 컴포넌트를 추가하고 App.jsx에 통합 마운트하겠습니다.\n\n수정할 내역:\n  - [NEW] src/components/Dashboard.jsx\n  - [MODIFY] src/App.jsx",
    aiSolutionRefactor: "App.jsx의 초기 웰컴 UI를 아크릴 느낌의 파스텔 카드 스타일 컴포넌트로 리팩토링합니다.\n\n수정할 내역:\n  - [MODIFY] src/App.jsx",
    aiConfirm: "Do you want to apply these changes? [y/N]",
    aiApply: "⚡ 변경사항을 소스 파일에 작성 중...",
    aiDone: "✓ 변경사항이 성공적으로 반영되었습니다.\n💡 [npm run dev] 빌드 정상. 터미널 준비 완료.",
    
    // Antigravity TUI 멘트
    agTuiStart: "🚀 Antigravity Parallel Orchestrator 구동 시작...",
    agTuiMonitor: "TUI 멀티 에이전트 뷰포트를 바인딩합니다. (모니터링 모드 활성화)",
    agTuiStep1: "🔍 [Research] codebase 내 기존 헬퍼 최적화 라이브러리 스캔 진행 중...",
    agTuiStep2: "🤖 [Planner] 스캔 결과 기반 패키지 성능 보정 7단계 계획 설계 완료.",
    agTuiStep3: "🏗️ [Executor] src/utils/helpers.js 내 지수 백오프 컴파일 연산 모듈 수정 작성 중...",
    agTuiStep4: "✓ [Verifier] 단위 유닛 테스트 구동: 45 passed, 0 failed. 정적 분석 린트 패스.",
    agTuiDone: "✨ [Antigravity] 병렬 에이전트의 모든 관제 코딩 태스크가 완료되었습니다! (Status: 200 OK)",
    
    vibeStart: "⚙️ [HMR] Hot Module Replacement (HMR) active watcher booted.\n🚀 Client build listener bound to active key events buffer.\n💡 (Press Escape key or Ctrl+C to terminate client replacement daemon.)"
  },
  en: {
    welcomeScan: "Project scanned. package.json detected (React v19.0.0)",
    welcomeHelp: "Enter a command or ask a question. (Type /help or help for instructions)",
    welcomeTip1: '※ Key Feature: Type "/debug" to launch a 10-minute automated debugging skill.',
    welcomeTip2: '※ Tip: Press "Ctrl+C" at any time to abort the simulation and reset.',
    
    agWelcome: "Welcome to Google DeepMind Antigravity CLI.",
    agWelcomeHost: "Host environment detected: OS: Windows 11, Shell: powershell",
    agWelcomeHelp: "Ready. Type \"help\" or \"/help\" to view available commands.",
    agWelcomeTip1: '※ Key Feature: Type "run" or "/run" to activate the parallel agents TUI console.',
    agWelcomeTip2: '※ Try out specialized slash commands like "/skills", "/artifacts" to inspect assets.',
    
    sigintExit: "⚠️ [SIGINT] Process was forcefully terminated by user request.",
    sigintReset: "Resetting terminal shell focus.",
    
    helpTable: `┌─────────────────────────┬────────────────────────────────────────────────────┐
│ Command                 │ Description                                        │
├─────────────────────────┼────────────────────────────────────────────────────┤
│ /debug (or debug)       │ Launch a 10m automated debugging pipeline          │
│ ai "task"               │ Instruct AI to write code (e.g., ai login)         │
│ vibe                    │ Enter interactive turbo coding mode                │
│ clear (or cls)          │ Clear terminal screen                              │
│ exit                    │ Return to home selection screen                    │
└─────────────────────────┴────────────────────────────────────────────────────┘`,
    
    agHelpTable: `┌─────────────────────────┬────────────────────────────────────────────────────┐
│ Command                 │ Description                                        │
├─────────────────────────┼────────────────────────────────────────────────────┤
│ run (or /run)           │ Launch the parallel agents TUI monitor console     │
│ debug (or /debug)       │ Launch a 10m automated debugging pipeline          │
│ ai "task"               │ Instruct AI to write code (e.g., ai login)         │
│ vibe                    │ Enter interactive turbo coding mode                │
│ /skills                 │ Load active agent skills registered in workspace   │
│ /artifacts              │ View mock plans and generated source codes         │
│ /what                   │ Status report of background agents                 │
│ clear (or cls)          │ Clear terminal screen                              │
│ exit                    │ Return to home selection screen                    │
└─────────────────────────┴────────────────────────────────────────────────────┘`,

    skillsTitle: "📂 Registered Agent Skills in Workspace:",
    artifactsTitle: "📂 Camouflaged Artifacts found in Local Workspace:",
    whatTitle: "🔍 Background Orchestration Status:",
    whatIdle: "No active parallel tasks running. Type \"run\" to boot the agent pipeline.",
    whatRunning: "Parallel agents are coordinating system tuning and calculation optimizations.",
    cmdError: "powershell: The term '{0}' is not recognized as the name of a cmdlet, function, or script.",
    
    // Debug Scenario english
    dbgLoading: "🔧 Loading virtual debug skill [/debug]...",
    dbgIntro: "Booting debug skill. Initiating structural scans, testing, and full release recovery.",
    dbgP1Start: "⚡ Phase 1: Validating local build integrity and running test suites...",
    dbgP1Runs: "  ⏳ RUNS  ",
    dbgP1Pass: "  ✓ PASS  ",
    dbgP1Fail: "  ❌ FAIL  ",
    dbgP1FailDetail: "     ● App > Session force mount and rendering test failure\n       TypeError: Cannot read properties of undefined (reading 'name')\n         at App (src/App.jsx:18:42)",
    dbgP1Summary: "Tests:       1 failed, 6 passed, 7 total\nSnapshots:   0 total\nTime:        15.84s\n❌ [npm run test:debug] Error stack captured. Proceeding to diagnostic scan.",
    
    dbgP2Start: "⚡ Phase 2: Analysing codebase architecture and Grep searching files...",
    dbgP2Match: "Grep result: 1 match found in src/App.jsx:18",
    dbgP2Report: "🤖 [Diagnostic Report] In src/App.jsx, the initial value of currentUser is undefined, but rendering (line 18) directly accesses currentUser.name without guards.\nRecommended fix: Refactor App.jsx using conditional rendering and optional chaining.",
    
    dbgP3Prompt: "Do you want to apply these changes? [y/N]",
    dbgP3TimeoutInfo: "ℹ/ (Autopilot active: Autopilot will auto-approve with 'y' in 15 seconds if you are away.)",
    dbgP3TimeoutAct: "⏰ [Autopilot timeout 15s elapsed] Automatically approved (y). Rebuilding files...",
    
    dbgP4Start: "⚡ Phase 4: Rewriting src/App.jsx source code to fix session reference...",
    
    dbgP5Start: "⚡ Phase 5: Running local diagnostics on the modified codebase...",
    dbgP5Fail: "❌ Build Failed: Module not found: Can't resolve 'src/utils/helpers.js' in src/App.jsx\n  Diagnosis: Refactored source imports helpers.js for metric calculation, but the file is missing.",
    dbgP5Install: "⚙️ Installing missing components: [run_command] npm install...",
    dbgP5InstallBar: "  [{0}] {1}% - downloading packages from npm registry...",
    dbgP5InstallDone: "  ✓ added 14 packages, updated 2 packages in 12.4s",
    
    dbgP6Start: "⚡ Phase 6: Creating performance optimizer module (helpers.js)...",
    
    dbgP7Start: "⚡ Phase 7: Triggering final integration tests on all active modules...",
    dbgP7Summary: "Test Suites: 9 passed, 9 total\nTests:       58 passed, 58 total\nTime:        24.12s\n🎉 All integration test suites passed! Committing changes to git.",
    dbgP7CommitMsg: "[main f1245a9] refactor: fix session user null pointer type error and optimize performance helper",
    dbgP7PushDone: "   d9a74cf..f1245a9  main -> main\n✓ git push origin main successfully completed.",
    dbgP7Done: "✓ Claude Code has successfully resolved all debugging tasks! (Total Time: 10m 12s)",
    
    // Regular AI english
    aiThinking: "Thinking... Scanning workspace and active file buffers.",
    aiSolution: "🤖 Solution generated successfully.",
    aiSolutionLogin: "We will create a new Login.jsx component to handle session flows and refactor App.jsx to bind authentication.\n\nFiles to modify:\n  - [NEW] src/components/Login.jsx\n  - [MODIFY] src/App.jsx",
    aiSolutionDash: "Integrating admin metrics Dashboard.jsx component and mounting it into App.jsx.\n\nFiles to modify:\n  - [NEW] src/components/Dashboard.jsx\n  - [MODIFY] src/App.jsx",
    aiSolutionRefactor: "Refactoring App.jsx's initial welcome layout into clean glassmorphism pastel cards.\n\nFiles to modify:\n  - [MODIFY] src/App.jsx",
    aiConfirm: "Do you want to apply these changes? [y/N]",
    aiApply: "⚡ Writing changes to codebase...",
    aiDone: "✓ Changes applied successfully.\n💡 [npm run dev] Local build healthy. Terminal ready.",
    
    // Antigravity TUI english
    agTuiStart: "🚀 Booting Antigravity Parallel Agentic Pipeline...",
    agTuiMonitor: "Binding TUI multi-agent viewports. (Monitoring Mode Active)",
    agTuiStep1: "🔍 [Research] Searching codebase for pre-configured metric helpers...",
    agTuiStep2: "🤖 [Planner] Outlining 7-step compensation task chain based on research logs.",
    agTuiStep3: "🏗️ [Executor] Editing src/utils/helpers.js to inject exponential backoff loop...",
    agTuiStep4: "✓ [Verifier] Unit testing completed: 45 passed, 0 failed. Lint rules clear.",
    agTuiDone: "✨ [Antigravity] Camouflaged agents completed all tasks successfully! (Status: 200 OK)",
    
    vibeStart: "⚙️ [HMR] Hot Module Replacement (HMR) active watcher booted.\n🚀 Client build listener bound to active key events buffer.\n💡 (Press Escape key or Ctrl+C to terminate client replacement daemon.)"
  }
};

export function Terminal({ 
  mode, 
  lang, // 부모 App.jsx에서 내려받은 언어 설정 ('ko' | 'en')
  onTriggerTyping, 
  onToggleVibeMode, 
  isVibeMode,
  onExit
}) {
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Claude 디버깅 시뮬레이터 상태 기계
  const [debugPhase, setDebugPhase] = useState(null);
  const [debugTick, setDebugTick] = useState(0);
  const [isPausedForTyping, setIsPausedForTyping] = useState(false);

  // 일반 Claude AI 시뮬레이션 상태
  const [claudeStep, setClaudeStep] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // Antigravity CLI 에이전트 틱 상태 기계
  const [antigravityPhase, setAntigravityPhase] = useState(null);
  const [antigravityTick, setAntigravityTick] = useState(0);
  const [agentStatuses, setAgentStatuses] = useState({
    research: 'IDLE',
    planner: 'IDLE',
    executor: 'IDLE',
    verifier: 'IDLE'
  });

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const debugIntervalRef = useRef(null);
  const antigravityIntervalRef = useRef(null);
  const claudeAiIntervalRef = useRef(null);

  // 언어 팩 선택
  const t = TERMINAL_LANG[lang || 'ko'];

  const getPrompt = () => {
    if (mode === 'claude') {
      return (
        <span style={{ color: 'var(--color-claude)', fontWeight: 'bold' }}>
          claude-code &gt;&nbsp;
        </span>
      );
    }
    return (
      <span style={{ color: 'var(--color-antigravity)', fontWeight: 'bold' }}>
        antigravity-cli &gt;&nbsp;
      </span>
    );
  };

  const addLog = (type, text) => {
    setHistory(prev => [...prev, { type, text }]);
  };

  // 터미널 첫 구동 및 언어 스위칭 대응
  useEffect(() => {
    resetTerminal();
    
    const welcomeLines = [];
    if (mode === 'claude') {
      welcomeLines.push(
        { type: 'system', text: 'Claude Code v0.2.9' },
        { type: 'output', text: t.welcomeScan },
        { type: 'output', text: t.welcomeHelp },
        { type: 'output', text: t.welcomeTip1 },
        { type: 'output', text: t.welcomeTip2 }
      );
      setHistory(welcomeLines);
    } else {
      welcomeLines.push(
        { type: 'system', text: ANTIGRAVITY_ASCII_LOGO },
        { type: 'output', text: t.agWelcome },
        { type: 'output', text: t.agWelcomeHost },
        { type: 'output', text: t.agWelcomeHelp },
        { type: 'output', text: t.agWelcomeTip1 },
        { type: 'output', text: t.agWelcomeTip2 }
      );
      setHistory(welcomeLines);
    }
  }, [mode, lang]); // lang(언어 변경) 이벤트 수신 시 실시간 재렌더링

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Ctrl+C 및 Escape 중단 키 리스너
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleCtrlC();
      } else if (e.key === 'Escape') {
        if (isProcessing) {
          e.preventDefault();
          handleEscapeCancel();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [debugPhase, antigravityPhase, isProcessing, lang]);

  const resetTerminal = () => {
    if (debugIntervalRef.current) {
      clearInterval(debugIntervalRef.current);
      debugIntervalRef.current = null;
    }
    if (antigravityIntervalRef.current) {
      clearInterval(antigravityIntervalRef.current);
      antigravityIntervalRef.current = null;
    }
    if (claudeAiIntervalRef.current) {
      clearInterval(claudeAiIntervalRef.current);
      claudeAiIntervalRef.current = null;
    }
    setDebugPhase(null);
    setDebugTick(0);
    setAntigravityPhase(null);
    setAntigravityTick(0);
    setAgentStatuses({ research: 'IDLE', planner: 'IDLE', executor: 'IDLE', verifier: 'IDLE' });
    setIsPausedForTyping(false);
    setIsProcessing(false);
    setClaudeStep(null);
    setPendingAction(null);
    if (isVibeMode) {
      onToggleVibeMode(false);
    }
  };

  const handleCtrlC = () => {
    setHistory(prev => [
      ...prev,
      { type: 'output', text: '^C' },
      { type: 'system', text: t.sigintExit },
      { type: 'output', text: t.sigintReset }
    ]);
    resetTerminal();
  };

  const handleEscapeCancel = () => {
    setHistory(prev => [
      ...prev,
      { type: 'output', text: lang === 'ko' ? '⚠️ [ESC] 사용자가 분석 작업을 강제 중단했습니다.' : '⚠️ [ESC] Analysis forcefully aborted by user.' },
      { type: 'output', text: t.sigintReset }
    ]);
    resetTerminal();
  };

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    setHistory(prev => [...prev, { type: 'input', text: cmd }]);
    setInputValue('');

    if (claudeStep === 'confirming') {
      handleClaudeConfirmation(cmd);
      return;
    }

    if (isProcessing) return;
    processCommand(cmd);
  };

  const processCommand = (cmd) => {
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      return;
    }
    if (lowerCmd === 'exit') {
      onExit();
      return;
    }
    if (lowerCmd === 'vibe') {
      triggerVibeMode();
      return;
    }
    if (lowerCmd === '/debug' || lowerCmd === 'debug') {
      startLongDebugSimulation();
      return;
    }

    if (mode === 'claude') {
      handleClaudeCommands(lowerCmd, cmd);
    } else {
      // Antigravity에서 run, skills, artifacts, what 외의 명령어들은 AI 명령어로 동일하게 처리
      if (lowerCmd === 'run' || lowerCmd === '/run' || lowerCmd === '/skills' || lowerCmd === '/artifacts' || lowerCmd === '/what' || lowerCmd === 'help' || lowerCmd === '/help') {
        handleAntigravityRouter(lowerCmd, cmd);
      } else {
        // Antigravity AI 명령 처리
        if (lowerCmd.startsWith('ai ')) {
          const task = cmd.slice(3).replace(/['"]/g, '');
          simulateClaudeAI(task);
        } else {
          simulateClaudeAI(cmd);
        }
      }
    }
  };

  // -------------------------------------------------------------
  // [1] Claude Code 10분 초장기 디버깅 시뮬레이션 (다국어화 완료)
  // -------------------------------------------------------------
  const startLongDebugSimulation = () => {
    resetTerminal();
    setIsProcessing(true);
    setDebugPhase(1);
    setDebugTick(0);
    
    setHistory(prev => [
      ...prev,
      { type: 'system', text: t.dbgLoading },
      { type: 'output', text: mode === 'claude' 
        ? '╔══ Claude is using tools ══════════════════════════════════════╗' 
        : '┌── Antigravity Agent Tool Call ───────────────────────────────┐' },
      { type: 'output', text: mode === 'claude'
        ? '║  ✓ loading_skill(name="debug", type="comprehensive") (420ms)   ║'
        : '│  ✓ loading_skill(name="debug", type="comprehensive") (420ms)   │' },
      { type: 'output', text: mode === 'claude'
        ? '╚═══════════════════════════════════════════════════════════════╝'
        : '└──────────────────────────────────────────────────────────────┘' },
      { type: 'output', text: t.dbgIntro }
    ]);
  };

  useEffect(() => {
    if (debugPhase === null || isPausedForTyping) return;

    const runTick = () => {
      setDebugTick(prev => prev + 1);
    };

    debugIntervalRef.current = setInterval(runTick, 1800);
    return () => {
      if (debugIntervalRef.current) {
        clearInterval(debugIntervalRef.current);
      }
    };
  }, [debugPhase, isPausedForTyping]);

  useEffect(() => {
    if (debugPhase === null || isPausedForTyping) return;
    
    switch (debugPhase) {
      case 1:
        if (debugTick === 1) {
          addLog('output', t.dbgP1Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ run_command(command="npm run test:debug") (920ms)          ║'
            : '│  ✓ run_command(command="npm run test:debug") (920ms)          │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
        } else if (debugTick >= 2 && debugTick <= 12) {
          const testFiles = [
            'src/tests/auth.test.js', 'src/tests/router.test.js',
            'src/tests/ui.test.js', 'src/tests/helpers.test.js',
            'src/tests/metrics.test.js', 'src/tests/api.test.js'
          ];
          const fileIdx = Math.floor((debugTick - 2) / 2);
          if (debugTick % 2 === 0 && fileIdx < testFiles.length) {
            addLog('output', `${t.dbgP1Runs}${testFiles[fileIdx]}`);
          } else if (fileIdx < testFiles.length) {
            addLog('output', `${t.dbgP1Pass}${testFiles[fileIdx]} (480ms)`);
          }
        } else if (debugTick === 13) {
          addLog('output', `${t.dbgP1Runs}src/tests/App.test.js`);
        } else if (debugTick === 15) {
          addLog('output', `${t.dbgP1Fail}src/tests/App.test.js (1.2s)`);
          const details = t.dbgP1FailDetail.split('\n');
          details.forEach(line => addLog('output', line));
        } else if (debugTick === 17) {
          const summary = t.dbgP1Summary.split('\n');
          summary.forEach(line => addLog('output', line));
          
          setDebugPhase(2);
          setDebugTick(0);
        }
        break;

      case 2:
        if (debugTick === 1) {
          addLog('output', t.dbgP2Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ grep(query="currentUser.name", path="src/") (450ms)        ║'
            : '│  ✓ grep(query="currentUser.name", path="src/") (450ms)        │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
          addLog('output', t.dbgP2Match);
        } else if (debugTick >= 2 && debugTick <= 8) {
          const scanFiles = [
            'src/App.jsx', 'src/index.css', 'package.json',
            'src/components/Login.jsx', 'src/components/Dashboard.jsx'
          ];
          const scanIdx = debugTick - 2;
          if (scanIdx < scanFiles.length) {
            addLog('output', mode === 'claude'
              ? `║  ✓ read_file(path="${scanFiles[scanIdx]}") (${120 + scanIdx * 30}ms)`
              : `│  ✓ read_file(path="${scanFiles[scanIdx]}") (${120 + scanIdx * 30}ms)`);
          }
        } else if (debugTick === 9) {
          const report = t.dbgP2Report.split('\n');
          report.forEach(line => addLog('output', line));
          
          setDebugPhase(3);
          setDebugTick(0);
        }
        break;

      case 3:
        if (debugTick === 1) {
          addLog('system', t.dbgP3Prompt);
          addLog('output', t.dbgP3TimeoutInfo);
        } else if (debugTick === 8) {
          addLog('output', t.dbgP3TimeoutAct);
          
          setDebugPhase(4);
          setDebugTick(0);
          setIsPausedForTyping(true);
          onTriggerTyping('src/App.jsx', 'appWithError');
        }
        break;

      case 4:
        if (debugTick === 0) {
          addLog('output', t.dbgP4Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ write_file(path="src/App.jsx") (1200ms)                    ║'
            : '│  ✓ write_file(path="src/App.jsx") (1200ms)                    │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
          setIsPausedForTyping(true);
          onTriggerTyping('src/App.jsx', 'appRefactor');
          setDebugTick(1);
        }
        break;

      case 5:
        if (debugTick === 1) {
          addLog('output', t.dbgP5Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ run_command(command="npm run build") (780ms)               ║'
            : '│  ✓ run_command(command="npm run build") (780ms)               │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
        } else if (debugTick === 3) {
          const failLines = t.dbgP5Fail.split('\n');
          failLines.forEach(line => addLog('output', line));
        } else if (debugTick === 5) {
          addLog('output', t.dbgP5Install);
        } else if (debugTick >= 6 && debugTick <= 15) {
          const percent = (debugTick - 5) * 10;
          const bar = '='.repeat((debugTick - 5)) + ' '.repeat(10 - (debugTick - 5));
          addLog('output', t.dbgP5InstallBar.replace('{0}', bar).replace('{1}', percent));
        } else if (debugTick === 16) {
          addLog('output', t.dbgP5InstallDone);
          
          setDebugPhase(6);
          setDebugTick(0);
          setIsPausedForTyping(true);
          onTriggerTyping('src/utils/helpers.js', 'helpersDebug');
        }
        break;

      case 6:
        if (debugTick === 0) {
          addLog('output', t.dbgP6Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ write_file(path="src/utils/helpers.js") (1100ms)           ║'
            : '│  ✓ write_file(path="src/utils/helpers.js") (1100ms)           │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
          setIsPausedForTyping(true);
          onTriggerTyping('src/utils/helpers.js', 'helpersDebug');
          setDebugTick(1);
        }
        break;

      case 7:
        if (debugTick === 1) {
          addLog('output', t.dbgP7Start);
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ run_command(command="npm run test:all") (950ms)            ║'
            : '│  ✓ run_command(command="npm run test:all") (950ms)            │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
        } else if (debugTick >= 2 && debugTick <= 15) {
          const allTests = [
            'src/tests/auth.test.js', 'src/tests/router.test.js', 'src/tests/ui.test.js',
            'src/tests/helpers.test.js', 'src/tests/metrics.test.js', 'src/tests/api.test.js',
            'src/tests/App.test.js', 'src/tests/performance.test.js', 'src/tests/security.test.js'
          ];
          const testIdx = Math.floor((debugTick - 2) / 1.5);
          if (testIdx < allTests.length) {
            if (debugTick % 2 === 0) {
              addLog('output', `  ✓ PASS  ${allTests[testIdx]} (1.1s)`);
            }
          }
        } else if (debugTick === 16) {
          const summary = t.dbgP7Summary.split('\n');
          summary.forEach(line => addLog('output', line));
        } else if (debugTick === 18) {
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ run_command(command="git commit -am \'refactor: fix...\'")   ║'
            : '│  ✓ run_command(command="git commit -am \'refactor: fix...\'")   │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
          addLog('output', t.dbgP7CommitMsg);
        } else if (debugTick === 20) {
          addLog('output', mode === 'claude'
            ? '╔══ Claude is using tools ══════════════════════════════════════╗'
            : '┌── Antigravity Agent Tool Call ───────────────────────────────┐');
          addLog('output', mode === 'claude'
            ? '║  ✓ run_command(command="git push origin main") (1450ms)        ║'
            : '│  ✓ run_command(command="git push origin main") (1450ms)        │');
          addLog('output', mode === 'claude'
            ? '╚═══════════════════════════════════════════════════════════════╝'
            : '└──────────────────────────────────────────────────────────────┘');
          const pushLines = t.dbgP7PushDone.split('\n');
          pushLines.forEach(line => addLog('output', line));
        } else if (debugTick === 22) {
          addLog('system', t.dbgP7Done);
          resetTerminal();
        }
        break;

      default:
        break;
    }
  }, [debugPhase, debugTick, isPausedForTyping, lang]);


  // -------------------------------------------------------------
  // [2] Antigravity CLI TUI 고도화 라우터 (다국어화 완료)
  // -------------------------------------------------------------
  const handleAntigravityRouter = (lowerCmd, originalCmd) => {
    if (lowerCmd === 'help' || lowerCmd === '/help') {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: t.agHelpTable }
      ]);
      return;
    }

    if (lowerCmd === 'run' || lowerCmd === '/run') {
      startAntigravityTUIWorkflow();
      return;
    }

    if (lowerCmd === '/skills') {
      setHistory(prev => [
        ...prev,
        { type: 'system', text: t.skillsTitle },
        { type: 'output', text: '  - clinical-trials-database [CHEMBL_V2]' },
        { type: 'output', text: '  - protein-sequence-msa [CLUSTAL_OMEGA]' },
        { type: 'output', text: '  - literature-search-openalex [API]' },
        { type: 'output', text: '  - unibind-database [JASPAR_2026]' }
      ]);
      return;
    }

    if (lowerCmd === '/artifacts') {
      setHistory(prev => [
        ...prev,
        { type: 'system', text: t.artifactsTitle },
        { type: 'output', text: '  - [Plan] implementation_plan.md (3,420 bytes)' },
        { type: 'output', text: '  - [Task] task.md (1,502 bytes)' },
        { type: 'output', text: '  - [Walk] walkthrough.md (4,890 bytes)' }
      ]);
      return;
    }

    if (lowerCmd === '/what') {
      setHistory(prev => [
        ...prev,
        { type: 'system', text: t.whatTitle },
        { type: 'output', text: isProcessing && antigravityPhase === 'running' ? `  - ${t.whatRunning}` : `  - ${t.whatIdle}` }
      ]);
      return;
    }

    setHistory(prev => [
      ...prev,
      { type: 'output', text: t.cmdError.replace('{0}', originalCmd) }
    ]);
  };

  const startAntigravityTUIWorkflow = () => {
    resetTerminal();
    setIsProcessing(true);
    setAntigravityPhase('running');
    setAntigravityTick(0);
    setAgentStatuses({
      research: 'RUNNING',
      planner: 'IDLE',
      executor: 'IDLE',
      verifier: 'IDLE'
    });

    setHistory(prev => [
      ...prev,
      { type: 'system', text: t.agTuiStart },
      { type: 'output', text: t.agTuiMonitor }
    ]);
  };

  useEffect(() => {
    if (antigravityPhase !== 'running') return;

    const runAntigravityTick = () => {
      setAntigravityTick(prev => prev + 1);
    };

    antigravityIntervalRef.current = setInterval(runAntigravityTick, 2000);
    return () => {
      if (antigravityIntervalRef.current) {
        clearInterval(antigravityIntervalRef.current);
      }
    };
  }, [antigravityPhase]);

  useEffect(() => {
    if (antigravityPhase !== 'running') return;

    const renderTUIDashboard = (statuses) => {
      return `┌────────────────────────────────────────────────────────┐
│  Antigravity Parallel Orchestration Monitor            │
├──────────────────────────┬─────────────────────────────┤
│  Research Agent: ${statuses.research.padEnd(8)}  │  Planner Agent: ${statuses.planner.padEnd(10)}  │
│  Executor Agent: ${statuses.executor.padEnd(8)}  │  Verifier Agent: ${statuses.verifier.padEnd(9)}  │
└──────────────────────────┴─────────────────────────────┘`;
    };

    if (antigravityTick === 1) {
      setAgentStatuses({ research: 'WORKING', planner: 'IDLE', executor: 'IDLE', verifier: 'IDLE' });
      addLog('system', renderTUIDashboard({ research: 'WORKING', planner: 'IDLE', executor: 'IDLE', verifier: 'IDLE' }));
      addLog('output', t.agTuiStep1);
    } else if (antigravityTick === 3) {
      setAgentStatuses({ research: 'SUCCESS', planner: 'WORKING', executor: 'IDLE', verifier: 'IDLE' });
      addLog('system', renderTUIDashboard({ research: 'SUCCESS', planner: 'WORKING', executor: 'IDLE', verifier: 'IDLE' }));
      addLog('output', t.agTuiStep2);
    } else if (antigravityTick === 5) {
      setAgentStatuses({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'WORKING', verifier: 'IDLE' });
      addLog('system', renderTUIDashboard({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'WORKING', verifier: 'IDLE' }));
      addLog('output', t.agTuiStep3);
    } else if (antigravityTick === 8) {
      setAgentStatuses({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'SUCCESS', verifier: 'WORKING' });
      addLog('system', renderTUIDashboard({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'SUCCESS', verifier: 'WORKING' }));
      addLog('output', t.agTuiStep4);
    } else if (antigravityTick === 10) {
      setAgentStatuses({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'SUCCESS', verifier: 'SUCCESS' });
      addLog('system', renderTUIDashboard({ research: 'SUCCESS', planner: 'SUCCESS', executor: 'SUCCESS', verifier: 'SUCCESS' }));
      addLog('system', t.agTuiDone);
      resetTerminal();
    }
  }, [antigravityPhase, antigravityTick, lang]);


  // -------------------------------------------------------------
  // [3] Claude Code 기존 일반 명령어 처리
  // -------------------------------------------------------------
  const handleClaudeCommands = (lowerCmd, originalCmd) => {
    if (lowerCmd === 'help' || lowerCmd === '/help') {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: t.helpTable }
      ]);
      return;
    }

    if (lowerCmd.startsWith('ai ')) {
      const task = originalCmd.slice(3).replace(/['"]/g, '');
      simulateClaudeAI(task);
      return;
    }

    simulateClaudeAI(originalCmd);
  };

  const simulateClaudeAI = (task) => {
    setIsProcessing(true);
    setClaudeStep('thinking');
    
    setHistory(prev => [
      ...prev,
      { type: 'output', text: t.aiThinking }
    ]);

    let stepCount = 0;
    const logs = [
      '🔍 codebase analysis...',
      mode === 'claude'
        ? '╔══ Claude is using tools ══════════════════════════════════════╗'
        : '┌── Antigravity Agent Tool Call ───────────────────────────────┐',
      mode === 'claude'
        ? '║  ✓ read_file(path="src/App.jsx") (110ms)                      ║'
        : '│  ✓ read_file(path="src/App.jsx") (110ms)                      │',
      mode === 'claude'
        ? '║  ✓ grep(query="useContext", path="src/") (240ms)              ║'
        : '│  ✓ grep(query="useContext", path="src/") (240ms)              │',
      mode === 'claude'
        ? '╚═══════════════════════════════════════════════════════════════╝'
        : '└──────────────────────────────────────────────────────────────┘',
      t.aiSolution
    ];

    claudeAiIntervalRef.current = setInterval(() => {
      if (stepCount < logs.length) {
        addLog('output', logs[stepCount]);
        stepCount++;
      } else {
        if (claudeAiIntervalRef.current) {
          clearInterval(claudeAiIntervalRef.current);
          claudeAiIntervalRef.current = null;
        }
        
        let targetAction = null;
        let suggestionText = '';

        if (task.includes('login') || task.includes('로그인')) {
          targetAction = { type: 'login', files: ['src/components/Login.jsx', 'src/App.jsx'] };
          suggestionText = t.aiSolutionLogin;
        } else if (task.includes('dashboard') || task.includes('대시보드')) {
          targetAction = { type: 'dashboard', files: ['src/components/Dashboard.jsx', 'src/App.jsx'] };
          suggestionText = t.aiSolutionDash;
        } else {
          targetAction = { type: 'refactor', files: ['src/App.jsx'] };
          suggestionText = t.aiSolutionRefactor;
        }

        setPendingAction(targetAction);
        setClaudeStep('confirming');
        setHistory(prev => [
          ...prev,
          { type: 'output', text: suggestionText },
          { type: 'system', text: t.aiConfirm }
        ]);
      }
    }, 700);
  };

  const handleClaudeConfirmation = (cmd) => {
    const isApproved = cmd.toLowerCase() === 'y' || cmd.toLowerCase() === 'yes';

    if (!isApproved) {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: '❌ Canceled.' }
      ]);
      resetTerminal();
      return;
    }

    setClaudeStep('updating');
    setHistory(prev => [
      ...prev,
      { type: 'output', text: t.aiApply }
    ]);

    if (pendingAction.type === 'login') {
      setHistory(prev => [...prev, { type: 'output', text: mode === 'claude'
        ? '║  ✓ write_file(path="src/components/Login.jsx") (850ms)'
        : '│  ✓ write_file(path="src/components/Login.jsx") (850ms)' }]);
      setTimeout(() => {
        onTriggerTyping('src/components/Login.jsx', 'login');
      }, DELAY_MEDIUM);
    } else if (pendingAction.type === 'dashboard') {
      setHistory(prev => [...prev, { type: 'output', text: mode === 'claude'
        ? '║  ✓ write_file(path="src/components/Dashboard.jsx") (920ms)'
        : '│  ✓ write_file(path="src/components/Dashboard.jsx") (920ms)' }]);
      setTimeout(() => {
        onTriggerTyping('src/components/Dashboard.jsx', 'dashboard');
      }, DELAY_MEDIUM);
    } else {
      setHistory(prev => [...prev, { type: 'output', text: mode === 'claude'
        ? '║  ✓ write_file(path="src/App.jsx") (1100ms)'
        : '│  ✓ write_file(path="src/App.jsx") (1100ms)' }]);
      setTimeout(() => {
        onTriggerTyping('src/App.jsx', 'appRefactor');
      }, DELAY_MEDIUM);
    }
  };

  const handleEditorTypingFinished = () => {
    if (debugPhase !== null) {
      setIsPausedForTyping(false);
      
      if (debugPhase === 4) {
        setDebugPhase(5);
        setDebugTick(0);
      } else if (debugPhase === 6) {
        setDebugPhase(7);
        setDebugTick(0);
      }
      return;
    }

    if (pendingAction && pendingAction.type === 'login') {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: '✓ src/components/Login.jsx generated.' },
        { type: 'output', text: mode === 'claude'
          ? '║  ✓ write_file(path="src/App.jsx") (950ms)'
          : '│  ✓ write_file(path="src/App.jsx") (950ms)' }
      ]);
      setTimeout(() => {
        onTriggerTyping('src/App.jsx', 'appRefactor');
        setPendingAction({ type: 'appRefactor_chained' });
      }, DELAY_MEDIUM);
    } else if (pendingAction && pendingAction.type === 'dashboard') {
      setHistory(prev => [
        ...prev,
        { type: 'output', text: '✓ src/components/Dashboard.jsx generated.' },
        { type: 'output', text: mode === 'claude'
          ? '║  ✓ write_file(path="src/App.jsx") (950ms)'
          : '│  ✓ write_file(path="src/App.jsx") (950ms)' }
      ]);
      setTimeout(() => {
        onTriggerTyping('src/App.jsx', 'appRefactor');
        setPendingAction({ type: 'appRefactor_chained' });
      }, DELAY_MEDIUM);
    } else {
      const lines = t.aiDone.split('\n');
      setHistory(prev => [
        ...prev,
        { type: 'system', text: lines[0] },
        { type: 'output', text: lines[1] }
      ]);
      resetTerminal();
    }
  };

  window.triggerTerminalFinish = handleEditorTypingFinished;

  const triggerVibeMode = () => {
    if (isVibeMode) {
      onToggleVibeMode(false);
      addLog('output', '⏹️ [HMR] Hot Replacement watcher gracefully disconnected. Sync: OK');
      return;
    }

    onToggleVibeMode(true);
    const lines = t.vibeStart.split('\n');
    setHistory(prev => [
      ...prev,
      { type: 'system', text: lines[0] },
      { type: 'output', text: lines[1] },
      { type: 'output', text: lines[2] }
    ]);
  };

  return (
    <div 
      className="vscode-terminal glass-panel" 
      onClick={handleTerminalClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        padding: '12px',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-panel)',
        color: 'var(--txt-main)',
        minHeight: '100%'
      }}
    >
      <div className="terminal-history" style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {history.map((log, i) => {
          if (log.type === 'input') {
            return (
              <div key={i} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
                {getPrompt()}
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'system') {
            return (
              <div key={i} style={{ color: mode === 'claude' ? 'var(--color-claude)' : 'var(--color-antigravity)', fontWeight: 'bold', margin: '6px 0' }}>
                {log.text}
              </div>
            );
          }
          return (
            <div key={i} style={{ color: 'var(--txt-main)', marginBottom: '4px', lineHeight: '1.4' }}>
              {log.text}
            </div>
          );
        })}

        {isProcessing && debugPhase === null && antigravityPhase === null && claudeStep === 'thinking' && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', color: 'var(--txt-muted)' }}>
            <span className="spinner" style={{ marginRight: '8px' }} />
            <span>AI...</span>
          </div>
        )}

        {debugPhase !== null && isPausedForTyping && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', color: 'var(--color-claude)', fontWeight: 'bold' }}>
            <span className="spinner" style={{ marginRight: '8px', borderLeftColor: 'var(--color-claude)' }} />
            <span>[Editor Typing... - Terminal Paused]</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        {getPrompt()}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={(isProcessing && claudeStep !== 'confirming' && debugPhase === null && antigravityPhase === null)}
          placeholder={
            claudeStep === 'confirming' 
              ? 'y/n...' 
              : debugPhase !== null || antigravityPhase !== null
                ? 'Autopilot running (Press Ctrl+C to abort)...'
                : mode === 'claude'
                  ? 'Enter command or ask something (/debug to camouflage)...'
                  : 'Enter command or /run to launch TUI monitor...'
          }
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--txt-light)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px'
          }}
        />
        <span className="cursor" style={{ opacity: isProcessing && claudeStep !== 'confirming' && debugPhase === null && antigravityPhase === null ? 0.3 : 1 }} />
      </form>
    </div>
  );
}
export default Terminal;

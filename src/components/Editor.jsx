import React, { useState, useEffect, useRef } from 'react';

// 간단한 구문 강조(Syntax Highlighting) 렌더러 함수
const highlightCode = (code, filename) => {
  if (!code) return '';

  // 안전하게 HTML 이스케이프
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. 주석 처리 (//... 및 /*...*/)
  html = html.replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>');

  // 2. 문자열 처리 ('...' 및 "..." 및 `...`)
  html = html.replace(/(['"`])(.*?)\1/g, '<span style="color: #ce9178;">$1$2$1</span>');

  // 3. 키워드 처리 (JS/JSX/CSS 키워드)
  const keywords = [
    'import', 'from', 'export', 'default', 'const', 'let', 'var', 
    'function', 'return', 'if', 'else', 'for', 'while', 'switch', 
    'case', 'break', 'new', 'class', 'extends', 'try', 'catch',
    'true', 'false', 'null', 'undefined', 'async', 'await'
  ];
  
  keywords.forEach(kw => {
    const reg = new RegExp(`\\b(${kw})\\b`, 'g');
    html = html.replace(reg, '<span style="color: #c586c0;">$1</span>');
  });

  // 4. 리액트 컴포넌트/함수명 강조 (대문자로 시작하는 단어 및 함수 호출)
  html = html.replace(/\b([A-Z][a-zA-Z0-9_]+)\b/g, '<span style="color: #4ec9b0;">$1</span>');
  
  // 5. CSS 속성/값 구문 강조 (css 파일인 경우)
  if (filename && filename.endsWith('.css')) {
    html = html.replace(/([a-zA-Z-]+)\s*:/g, '<span style="color: #9cdcfe;">$1</span>:');
    html = html.replace(/:\s*([^;]+);/g, ': <span style="color: #ce9178;">$1</span>;');
  }

  return html;
};

export function Editor({ 
  activeFile, 
  files, 
  onFileUpdate, 
  typingTarget, 
  onTypingComplete,
  isVibeMode,
  onToggleVibeMode,
  vibeTargetCode,
  vibeProgress,
  onVibeProgress,
  lang
}) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [openTabs, setOpenTabs] = useState(['src/App.jsx', 'src/index.css', 'package.json']);
  const [showVibeOverlay, setShowVibeOverlay] = useState(false);
  const [vibeOverlayOpacity, setVibeOverlayOpacity] = useState(0);
  const codeEndRef = useRef(null);
  const containerRef = useRef(null);

  // Vibe 모드 작동 안내 오버레이 노출 2초 제한 및 페이드 아웃 타이머
  useEffect(() => {
    if (isVibeMode) {
      setShowVibeOverlay(true);
      setVibeOverlayOpacity(1);
      
      const timer = setTimeout(() => {
        setVibeOverlayOpacity(0);
        // 페이드아웃 효과(0.5초)가 끝난 후 컴포넌트 언마운트 처리
        const removeTimer = setTimeout(() => {
          setShowVibeOverlay(false);
        }, 500);
        return () => clearTimeout(removeTimer);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowVibeOverlay(false);
      setVibeOverlayOpacity(0);
    }
  }, [isVibeMode]);

  // 활성화된 파일이 탭 목록에 없을 시 동적으로 추가
  useEffect(() => {
    if (activeFile && !openTabs.includes(activeFile)) {
      setOpenTabs(prev => [...prev, activeFile]);
    }
  }, [activeFile, openTabs]);

  // 현재 활성화된 파일의 실제 target 코드를 가져옴
  const currentTargetContent = files[activeFile] || '';

  // 일반 탭 클릭이나 파일 전환 시 표시 내용 업데이트
  useEffect(() => {
    // 만약 현재 파일이 타이핑 타겟이 아니라면 그대로 노출
    if (!typingTarget || typingTarget.filename !== activeFile) {
      setDisplayedContent(currentTargetContent);
    }
  }, [activeFile, files, typingTarget]);

  // 타이핑 시뮬레이션 동작
  useEffect(() => {
    if (!typingTarget || typingTarget.filename !== activeFile) return;

    let index = 0;
    const targetText = typingTarget.code;
    setDisplayedContent('');

    // 타이핑 타이머 생성
    const interval = setInterval(() => {
      if (index < targetText.length) {
        setDisplayedContent(targetText.slice(0, index + 1));
        index += 2; // 조금 더 빠른 코딩을 위해 한 번에 2글자씩 출력
        
        // 스크롤 아래로 내리기
        if (codeEndRef.current) {
          codeEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
      } else {
        clearInterval(interval);
        // 부모 컴포넌트에 파일 업데이트 알림
        onFileUpdate(typingTarget.filename, targetText);
        if (onTypingComplete) {
          onTypingComplete();
        }
      }
    }, 15); // 매우 스피디하고 그럴듯한 타이핑 속도

    return () => clearInterval(interval);
  }, [typingTarget, activeFile]);

  // vibe 폭풍 코딩 모드일 때 키보드 이벤트 리스너 등록
  useEffect(() => {
    if (!isVibeMode) return;

    // 포커스를 에디터 컨테이너로 유도하기 위해 설정
    if (containerRef.current) {
      containerRef.current.focus();
    }

    const handleKeyDown = (e) => {
      // Escape 키 또는 Ctrl+C 입력 시 vibe 모드 즉시 탈출
      if (e.key === 'Escape' || (e.ctrlKey && (e.key === 'c' || e.key === 'C'))) {
        e.preventDefault();
        onToggleVibeMode(false);
        return;
      }

      // 단축키 오작동 방지
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      e.preventDefault();

      // 키를 입력할 때마다 4글자씩 가짜 코드를 누적해 타이핑함
      const charsPerKey = 4;
      const nextProgress = Math.min(vibeProgress + charsPerKey, vibeTargetCode.length);
      
      if (nextProgress <= vibeTargetCode.length) {
        const nextContent = vibeTargetCode.slice(0, nextProgress);
        setDisplayedContent(nextContent);
        onVibeProgress(nextProgress);
        
        // 에디터 파일 콘텐츠 업데이트
        onFileUpdate(activeFile, nextContent);

        if (codeEndRef.current) {
          codeEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVibeMode, vibeTargetCode, vibeProgress, activeFile]);

  // 파일 확장자 명 표시 및 스타일 탭
  const getTabStyle = (tabName) => {
    const isActive = tabName === activeFile;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      cursor: 'pointer',
      backgroundColor: isActive ? 'var(--bg-editor)' : 'rgba(0, 0, 0, 0.2)',
      borderRight: '1px solid var(--border-color)',
      borderTop: isActive ? '2px solid var(--border-active)' : '2px solid transparent',
      color: isActive ? 'var(--txt-light)' : 'var(--txt-muted)',
      fontSize: '13px',
      fontWeight: isActive ? '500' : 'normal',
    };
  };

  // 라인 넘버 생성
  const lines = displayedContent.split('\n');

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className="vscode-editor-area glass-panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        outline: 'none',
        position: 'relative'
      }}
    >
      {/* 가짜 파일 탭 바 */}
      <div className="editor-tabs" style={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        userSelect: 'none'
      }}>
        {openTabs.map(tab => (
          <div 
            key={tab} 
            style={getTabStyle(tab)}
            onClick={() => {
              if (!isVibeMode && (!typingTarget || typingTarget.filename !== activeFile)) {
                // 타이핑 또는 Vibe 모드 작동 중에는 탭 이동을 잠시 제약하거나 안전하게 작동시킴
                onFileUpdate(activeFile, displayedContent);
              }
            }}
          >
            <span style={{ fontSize: '11px', marginRight: '6px', color: '#519aba' }}>JSX</span>
            <span>{tab.split('/').pop()}</span>
          </div>
        ))}
      </div>

      {/* 코드 본문 영역 */}
      <div 
        className="editor-body" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          fontSize: '14px', 
          fontFamily: 'var(--font-mono)', 
          overflowY: 'auto', 
          lineHeight: '1.5',
          padding: '12px 0',
          backgroundColor: 'var(--bg-editor)'
        }}
      >
        {/* 라인 넘버 열 */}
        <div className="line-numbers" style={{
          width: '45px',
          textAlign: 'right',
          paddingRight: '12px',
          color: '#858585',
          userSelect: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          marginRight: '12px'
        }}>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* 실제 코드 표시 영역 */}
        <div className="code-content" style={{ flex: 1, overflowX: 'auto', whiteSpace: 'pre', color: 'var(--txt-main)' }}>
          <code 
            dangerouslySetInnerHTML={{ __html: highlightCode(displayedContent, activeFile) }} 
          />
          {/* 타이핑 효과 중에 깜빡이는 가상 커서 */}
          {(typingTarget && typingTarget.filename === activeFile) || isVibeMode ? (
            <span className="cursor" />
          ) : null}
          <div ref={codeEndRef} />
        </div>
      </div>

      {/* Vibe 코딩 모드 알림 오버레이 (HMR 핫 모듈 빌드로 위장하여 2초만 서서히 보인 후 페이드 아웃) */}
      {showVibeOverlay && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(62, 207, 142, 0.1)',
          border: '1px solid var(--color-antigravity)',
          padding: '8px 16px',
          borderRadius: '4px',
          backdropFilter: 'blur(8px)',
          color: 'var(--color-antigravity)',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10,
          opacity: vibeOverlayOpacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: vibeOverlayOpacity === 0 ? 'none' : 'auto'
        }}>
          {lang === 'ko' 
            ? `⚡ [HMR] 클라이언트 소스 핫 컴파일 동기화 중... (${Math.floor((vibeProgress / vibeTargetCode.length) * 100)}%)`
            : `⚡ [HMR] Hot-reloading client module packages... (${Math.floor((vibeProgress / vibeTargetCode.length) * 100)}%)`}
        </div>
      )}
    </div>
  );
}

export default Editor;

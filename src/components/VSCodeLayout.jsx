import React, { useState } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Blocks, 
  Settings, 
  User,
  Terminal as TerminalIcon,
  X,
  Plus,
  Trash2,
  ChevronDown,
  Minimize2,
  Square,
  Minus
} from 'lucide-react';

export function VSCodeLayout({ 
  children, 
  activeMode, 
  activeFile,
  workspaceName,
  osType, // 'mac' 또는 'windows'
  onExit,
  lang // 'ko' 또는 'en'
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState('TERMINAL');

  const [SidebarComp, EditorComp, TerminalComp] = React.Children.toArray(children);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const getThemeColor = () => {
    return activeMode === 'claude' ? 'var(--color-claude)' : 'var(--color-antigravity)';
  };

  // 1. 맥용 신호등 버튼 렌더링 (macOS 일 때 타이틀바 왼쪽에 위치)
  const renderMacControls = () => (
    <div style={{ display: 'flex', gap: '8px', paddingLeft: '4px' }}>
      <div className="win-btn" style={{ ...macBtnStyle, backgroundColor: '#ff5f56' }} onClick={onExit} title={lang === 'ko' ? '닫기' : 'Close'} />
      <div className="win-btn" style={{ ...macBtnStyle, backgroundColor: '#ffbd2e' }} title={lang === 'ko' ? '최소화' : 'Minimize'} />
      <div className="win-btn" style={{ ...macBtnStyle, backgroundColor: '#27c93f' }} title={lang === 'ko' ? '최대화' : 'Maximize'} />
    </div>
  );

  // 2. 윈도우용 창 제어 버튼 렌더링 (Windows 일 때 타이틀바 오른쪽에 위치)
  const renderWindowsControls = () => (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="win-control-btn" style={winControlBtnStyle} title={lang === 'ko' ? '최소화' : 'Minimize'}>
        <Minus size={14} style={{ color: 'var(--txt-main)' }} />
      </div>
      <div className="win-control-btn" style={winControlBtnStyle} title={lang === 'ko' ? '최대화' : 'Maximize'}>
        <Square size={10} style={{ color: 'var(--txt-main)' }} />
      </div>
      <div className="win-control-btn-close" style={winCloseBtnStyle} onClick={onExit} title={lang === 'ko' ? '닫기' : 'Close'}>
        <X size={14} />
      </div>
    </div>
  );

  return (
    <div className="vscode-window fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--txt-main)',
      fontSize: '13px',
      overflow: 'hidden'
    }}>
      {/* 상단 제목 표시줄 */}
      <div className="vscode-titlebar" style={{
        height: '35px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: osType === 'mac' ? '0 12px' : '0 0 0 12px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid var(--border-color)',
        userSelect: 'none'
      }}>
        {/* 왼쪽 영역: 맥OS라면 신호등 버튼을 배치, 윈도우라면 빈 공간 */}
        {osType === 'mac' ? renderMacControls() : <div style={{ width: '40px' }} />}

        {/* 중앙 제목: 현재 작업 파일 + 프로젝트 명 + VS Code 조합 */}
        <div style={{ fontSize: '12px', color: 'var(--txt-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {activeFile ? `${activeFile.split('/').pop()} - ${workspaceName} - ` : ''}Visual Studio Code
        </div>

        {/* 오른쪽 영역: 윈도우라면 윈도우 창 단추를 배치, 맥OS라면 여백 */}
        {osType === 'mac' ? <div style={{ width: '50px' }} /> : renderWindowsControls()}
      </div>

      {/* 메인 본체 격자 */}
      <div className="vscode-main-body" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* 2-1. Activity Bar (좌측 슬림) */}
        <div className="vscode-activitybar" style={{
          width: '50px',
          backgroundColor: 'var(--bg-activitybar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          userSelect: 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
            <div 
              style={activityIconStyle(isSidebarOpen)} 
              onClick={toggleSidebar}
              title={lang === 'ko' ? '탐색기 (Ctrl+Shift+E)' : 'Explorer (Ctrl+Shift+E)'}
            >
              <Files size={24} style={{ color: isSidebarOpen ? 'var(--txt-light)' : 'var(--txt-muted)' }} />
            </div>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '검색 (Ctrl+Shift+F)' : 'Search (Ctrl+Shift+F)'}>
              <Search size={24} />
            </div>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '소스 제어 (Ctrl+Shift+G)' : 'Source Control (Ctrl+Shift+G)'}>
              <GitBranch size={24} />
            </div>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '실행 및 디버그 (Ctrl+Shift+D)' : 'Run and Debug (Ctrl+Shift+D)'}>
              <Play size={24} />
            </div>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '확장 (Ctrl+Shift+X)' : 'Extensions (Ctrl+Shift+X)'}>
              <Blocks size={24} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '프로필 계정' : 'Accounts'}>
              <User size={20} />
            </div>
            <div style={activityIconStyle(false)} title={lang === 'ko' ? '설정' : 'Settings'}>
              <Settings size={20} />
            </div>
          </div>
        </div>

        {/* 2-2. Explorer Sidebar */}
        {isSidebarOpen && (
          <div className="vscode-sidebar-container" style={{
            width: '240px',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {SidebarComp}
          </div>
        )}

        {/* 2-3. 에디터 및 터미널 영역 */}
        <div className="vscode-editor-stack" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-editor)'
        }}>
          {/* 상단 에디터 (60%) */}
          <div className="vscode-editor-wrapper" style={{ flex: 6, overflow: 'hidden' }}>
            {EditorComp}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* 하단 패널/터미널 (40%) */}
          <div className="vscode-panel-area" style={{
            flex: 4,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-panel)',
            overflow: 'hidden'
          }}>
            {/* 패널 헤더 */}
            <div className="vscode-panel-header" style={{
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              borderBottom: '1px solid var(--border-color)',
              userSelect: 'none',
              backgroundColor: 'rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'].map(tab => (
                  <div 
                    key={tab} 
                    onClick={() => setActivePanelTab(tab)}
                    style={{
                      padding: '8px 0',
                      cursor: 'pointer',
                      color: activePanelTab === tab ? 'var(--txt-light)' : 'var(--txt-muted)',
                      borderBottom: activePanelTab === tab ? `2px solid ${getThemeColor()}` : '2px solid transparent',
                      fontWeight: activePanelTab === tab ? 'bold' : 'normal'
                    }}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--txt-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>
                  <TerminalIcon size={12} />
                  <span>{activeMode === 'claude' ? 'claude-code' : 'antigravity'}</span>
                  <ChevronDown size={12} />
                </div>
                <Plus size={14} style={{ cursor: 'pointer' }} />
                <Trash2 size={14} style={{ cursor: 'pointer' }} />
                <X size={14} style={{ cursor: 'pointer' }} onClick={toggleSidebar} />
              </div>
            </div>

            {/* 패널 바디 */}
            <div className="vscode-panel-body" style={{ flex: 1, overflow: 'hidden' }}>
              {activePanelTab === 'TERMINAL' ? (
                TerminalComp
              ) : (
                <div style={{ padding: '20px', color: 'var(--txt-muted)', fontStyle: 'italic' }}>
                  {lang === 'ko' 
                    ? '현재 활성화된 탭은 모니터링 모드입니다. 가짜 터미널(TERMINAL) 탭을 선택해 작업을 이어가세요.' 
                    : 'The active tab is in monitoring mode. Please select the mock TERMINAL tab to resume your work.'}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 최하단 Status Bar */}
      <div className="vscode-statusbar" style={{
        height: '22px',
        backgroundColor: getThemeColor(),
        color: 'var(--txt-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        fontSize: '12px',
        fontWeight: '500',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <GitBranch size={12} />
            <span>main*</span>
          </div>
          <span>{lang === 'ko' ? '동기화 완료' : 'Sync Complete'}</span>
          <span>errors: 0, warnings: 0</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>JavaScript JSX</span>
        </div>
      </div>
    </div>
  );
}

// 맥용 신호등 스타일
const macBtnStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  cursor: 'pointer'
};

// 윈도우용 창 단추 스타일
const winControlBtnStyle = {
  width: '46px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  // 호버 효과는 css hover 클래스로 처리하거나 간단한 인라인 호버링이 필요
  // 여기서는 구조상 심플하게 인라인 제공 및 기호 렌더링에 만족
};

const winCloseBtnStyle = {
  ...winControlBtnStyle,
  color: 'var(--txt-main)',
  // 닫기 버튼은 호버 시 강렬한 빨간색
};

// Activity Bar 아이콘 스타일
const activityIconStyle = (isActive) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '6px 0',
  cursor: 'pointer',
  borderLeft: isActive ? '2px solid var(--border-active)' : '2px solid transparent',
  color: isActive ? 'var(--txt-light)' : 'var(--txt-muted)',
});

export default VSCodeLayout;

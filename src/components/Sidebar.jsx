import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FileJson, 
  FileCode, 
  FileText
} from 'lucide-react';

export function Sidebar({ files, activeFile, onFileSelect, newFilesTracker, workspaceName, lang }) {
  
  // 파일 확장자에 맞는 아이콘 반환 함수
  const getFileIcon = (filename) => {
    if (filename.endsWith('.json')) {
      return <FileJson size={16} style={{ color: '#cbcb41' }} />;
    }
    if (filename.endsWith('.css')) {
      return <FileCode size={16} style={{ color: '#519aba' }} />;
    }
    if (filename.endsWith('.md')) {
      return <FileText size={16} style={{ color: '#4e9a06' }} />;
    }
    if (filename.endsWith('.java')) {
      return <FileCode size={16} style={{ color: '#eb8a3e' }} />; // Java 아이콘 컬러 설정
    }
    return <FileCode size={16} style={{ color: '#519aba' }} />;
  };

  // 파일 경로를 디렉토리 트리 구조로 파싱
  const rootFiles = [];
  const folders = {
    'src': {
      files: [],
      subfolders: {
        'components': [],
        'hooks': [],
        'context': [],
        'services': []
      }
    }
  };

  Object.keys(files).forEach(path => {
    if (!path.includes('/')) {
      rootFiles.push(path);
    } else {
      const parts = path.split('/');
      if (parts[0] === 'src') {
        if (parts.length === 2) {
          folders.src.files.push(path);
        } else if (parts.length > 2) {
          // main/java/com/... 등 깊은 경로도 온전히 서브폴더 구조로 묶어서 표현되게 함
          const subfolderName = parts.slice(1, parts.length - 1).join('/');
          if (folders.src.subfolders[subfolderName]) {
            folders.src.subfolders[subfolderName].push(path);
          } else {
            folders.src.subfolders[subfolderName] = [path];
          }
        }
      }
    }
  });

  return (
    <div className="vscode-sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', userSelect: 'none' }}>
      {/* 탐색기 헤더 */}
      <div className="sidebar-header" style={{
        padding: '10px 16px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--txt-muted)'
      }}>
        <span>{lang === 'ko' ? '탐색기' : 'Explorer'}</span>
      </div>

      {/* 탐색기 아코디언 바디 */}
      <div className="explorer-section" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* 프로젝트 루트 폴더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontWeight: 'bold',
          fontSize: '11px',
          textTransform: 'uppercase',
          color: 'var(--txt-light)',
          cursor: 'pointer'
        }}>
          <ChevronDown size={14} style={{ marginRight: '4px' }} />
          <span>{workspaceName || 'WORKSPACE'}</span>
        </div>

        {/* 파일 트리 뷰 */}
        <div style={{ fontSize: '13px', paddingLeft: '8px' }}>
          
          {/* 1. src 폴더 렌더링 */}
          <div>
            <div style={folderHeaderStyle}>
              <ChevronDown size={14} style={{ marginRight: '2px' }} />
              <Folder size={16} style={{ color: '#dcb85c', marginRight: '6px' }} />
              <span style={{ fontWeight: '500' }}>src</span>
            </div>

            {/* src 폴더 내부 */}
            <div style={{ paddingLeft: '14px' }}>
              {/* 1-1. src 직속 파일들 (App.jsx, index.css) */}
              {folders.src.files.map(path => (
                <div 
                  key={path} 
                  onClick={() => onFileSelect(path)}
                  style={fileItemStyle(activeFile === path)}
                >
                  {getFileIcon(path)}
                  <span style={{ marginLeft: '6px', flex: 1 }}>{path.split('/').pop()}</span>
                  {newFilesTracker[path] && <span style={gitBadgeStyle}>U</span>}
                </div>
              ))}

              {/* 1-2. src 서브폴더들 */}
              {Object.keys(folders.src.subfolders).map(subfolderName => {
                const subFiles = folders.src.subfolders[subfolderName];
                if (subFiles.length === 0) return null; // 빈 폴더는 렌더링 안 함 (예: components 생성 전)

                return (
                  <div key={subfolderName}>
                    <div style={folderHeaderStyle}>
                      <ChevronDown size={12} style={{ marginRight: '2px' }} />
                      <Folder size={15} style={{ color: '#dcb85c', marginRight: '6px' }} />
                      <span>{subfolderName}</span>
                    </div>
                    {/* 서브폴더 내부 파일들 */}
                    <div style={{ paddingLeft: '14px' }}>
                      {subFiles.map(path => (
                        <div 
                          key={path} 
                          onClick={() => onFileSelect(path)}
                          style={fileItemStyle(activeFile === path)}
                        >
                          {getFileIcon(path)}
                          <span style={{ marginLeft: '6px', flex: 1 }}>{path.split('/').pop()}</span>
                          {newFilesTracker[path] && <span style={gitBadgeStyle}>U</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. 루트 레벨 파일들 (package.json, vite.config.js 등) */}
          {rootFiles.map(path => (
            <div 
              key={path} 
              onClick={() => onFileSelect(path)}
              style={fileItemStyle(activeFile === path)}
            >
              {getFileIcon(path)}
              <span style={{ marginLeft: '6px', flex: 1 }}>{path}</span>
              {newFilesTracker[path] && <span style={gitBadgeStyle}>U</span>}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

// 스타일 헬퍼 정의
const folderHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '5px 8px 5px 2px',
  color: 'var(--txt-light)',
  cursor: 'pointer',
  fontSize: '13px'
};

const fileItemStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '5px 12px 5px 8px',
  cursor: 'pointer',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
  borderLeft: isActive ? '2px solid var(--border-active)' : '2px solid transparent',
  color: isActive ? 'var(--txt-light)' : 'var(--txt-main)',
  borderRadius: '2px',
  transition: 'background-color 0.15s',
  fontSize: '13px'
});

const gitBadgeStyle = {
  fontSize: '10px',
  fontWeight: 'bold',
  color: '#73c991',
  backgroundColor: 'rgba(115, 201, 145, 0.1)',
  padding: '1px 5px',
  borderRadius: '50%',
};

export default Sidebar;

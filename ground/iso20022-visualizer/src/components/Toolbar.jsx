import React from 'react';
import { toPng } from 'html-to-image';

/**
 * 상단 툴바 컴포넌트
 */
const Toolbar = ({ 
  onReset, 
  flowRef, 
  hasData,
  darkMode,
  onToggleDarkMode,
}) => {
  const [exporting, setExporting] = React.useState(false);

  // PNG 내보내기
  const handleExport = async () => {
    if (!flowRef?.current) {
      alert('내보낼 다이어그램이 없습니다.');
      return;
    }
    
    setExporting(true);
    
    try {
      const dataUrl = await toPng(flowRef.current, {
        backgroundColor: '#0f172a',
        quality: 1,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `iso20022-flow-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('이미지 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      {/* 로고 & 타이틀 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* 로고 */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">🔀</span>
          </div>
          
          {/* 타이틀 */}
          <div>
            <h1 className="text-lg font-bold text-white">
              ISO20022 Flow Visualizer
            </h1>
            <p className="text-xs text-slate-500">
              SWIFT Payment Message Visualization
            </p>
          </div>
        </div>
        
        {/* 상태 배지 */}
        {hasData && (
          <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">데이터 로드됨</span>
          </div>
        )}
      </div>
      
      {/* 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 다크모드 토글 */}
        <ToolbarButton
          icon={darkMode ? '☀️' : '🌙'}
          label={darkMode ? '라이트 모드' : '다크 모드'}
          onClick={onToggleDarkMode}
        />
        
        {/* 내보내기 버튼 */}
        <ToolbarButton
          icon="💾"
          label="PNG 저장"
          onClick={handleExport}
          disabled={!hasData || exporting}
          loading={exporting}
        />
        
        {/* 리셋 버튼 */}
        <ToolbarButton
          icon="🔄"
          label="초기화"
          onClick={onReset}
          disabled={!hasData}
          variant="danger"
        />
      </div>
    </header>
  );
};

// 툴바 버튼 컴포넌트
const ToolbarButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled, 
  loading,
  variant = 'default',
}) => {
  const baseClasses = `
    flex items-center gap-2 px-4 py-2 rounded-lg
    font-medium text-sm
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantClasses = {
    default: `
      bg-slate-800 hover:bg-slate-700 
      text-slate-300 hover:text-white
      border border-slate-700 hover:border-slate-600
    `,
    danger: `
      bg-red-500/10 hover:bg-red-500/20
      text-red-400 hover:text-red-300
      border border-red-500/30 hover:border-red-500/50
    `,
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={label}
    >
      <span className={loading ? 'animate-spin' : ''}>
        {loading ? '⏳' : icon}
      </span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

export default Toolbar;


import React, { useRef, useState } from 'react';

/**
 * XML 파일 업로드 컴포넌트
 */
const FileUploader = ({ onUpload, onLoadSample }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    if (!file.name.endsWith('.xml')) {
      alert('XML 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setFileName(file.name);
    const text = await file.text();
    onUpload(text);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-400 bg-blue-500/10 scale-[1.02]' 
            : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'
          }
        `}
      >
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        
        {/* 아이콘 */}
        <div className={`
          w-16 h-16 mb-4 rounded-2xl
          flex items-center justify-center text-3xl
          bg-gradient-to-br from-blue-500/20 to-blue-600/10
          border border-blue-500/30
          transition-transform duration-300
          ${isDragging ? 'scale-110 rotate-3' : ''}
        `}>
          📄
        </div>
        
        {/* 텍스트 */}
        <p className="text-slate-300 text-center mb-2">
          <span className="text-blue-400 font-semibold">클릭</span>하거나{' '}
          <span className="text-blue-400 font-semibold">드래그</span>하여 업로드
        </p>
        <p className="text-slate-500 text-sm">
          ISO20022 XML 파일 (pacs.008 등)
        </p>
        
        {/* 파일명 표시 */}
        {fileName && (
          <div className="mt-4 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
            <span className="text-green-400 text-sm">✓ {fileName}</span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      
      {/* 또는 구분선 */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="px-4 text-slate-500 text-sm">또는</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>
      
      {/* 샘플 로드 버튼 */}
      <button
        onClick={onLoadSample}
        className="
          w-full py-3 px-4 rounded-xl
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-500 hover:to-purple-500
          text-white font-medium
          transition-all duration-300
          flex items-center justify-center gap-2
          shadow-lg shadow-indigo-500/20
          hover:shadow-indigo-500/30
          hover:scale-[1.02]
        "
      >
        <span>🎯</span>
        <span>샘플 pacs.008 불러오기</span>
      </button>
      
      {/* 도움말 */}
      <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <h4 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
          <span>💡</span> 지원 메시지 유형
        </h4>
        <div className="flex flex-wrap gap-2">
          {['pacs.008', 'pacs.009', 'camt.056', 'camt.029'].map((type) => (
            <span 
              key={type}
              className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400 font-mono"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;


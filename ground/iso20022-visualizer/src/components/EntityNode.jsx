import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * 커스텀 엔티티 노드 컴포넌트
 * 각 결제 참여자 (Debtor, Agent, Creditor 등)를 표시
 */
const EntityNode = memo(({ data, selected }) => {
  const { label, name, bic, icon, colors, isFirst, isLast } = data;
  
  return (
    <div
      className={`
        relative min-w-[180px] max-w-[220px] rounded-xl
        transition-all duration-300 ease-out
        ${selected ? 'scale-105 ring-2 ring-white/50' : 'hover:scale-102'}
      `}
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}ee 100%)`,
        border: `2px solid ${colors.border}`,
        boxShadow: selected 
          ? `0 0 30px ${colors.border}60, 0 10px 40px rgba(0,0,0,0.4)` 
          : `0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      {/* 상단 라벨 */}
      <div 
        className="px-3 py-2 border-b text-center"
        style={{ borderColor: `${colors.border}50` }}
      >
        <span 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: colors.icon }}
        >
          {label}
        </span>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="p-4 text-center">
        {/* 아이콘 */}
        <div 
          className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${colors.border}30 0%, ${colors.border}10 100%)`,
            border: `1px solid ${colors.border}50`,
          }}
        >
          {icon}
        </div>
        
        {/* 이름 */}
        <div className="text-white font-medium text-sm mb-1 truncate" title={name}>
          {name}
        </div>
        
        {/* BIC 코드 */}
        {bic && (
          <div 
            className="text-xs font-mono px-2 py-1 rounded-md inline-block mt-1"
            style={{ 
              background: `${colors.border}20`,
              color: colors.icon,
            }}
          >
            {bic}
          </div>
        )}
      </div>
      
      {/* 입력 핸들 (첫 번째 노드 제외) */}
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !border-2"
          style={{ 
            background: colors.border,
            borderColor: colors.bg,
          }}
        />
      )}
      
      {/* 출력 핸들 (마지막 노드 제외) */}
      {!isLast && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2"
          style={{ 
            background: colors.border,
            borderColor: colors.bg,
          }}
        />
      )}
      
      {/* 장식 요소 */}
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
        style={{ background: colors.icon }}
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';

export default EntityNode;


import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

/**
 * 커스텀 메시지 엣지 컴포넌트
 * 결제 메시지 흐름을 화살표와 라벨로 표시
 */
const MessageEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const { messageType, messageDetail, isFirstEdge, isLastEdge, animated } = data || {};

  // 엣지 색상 결정
  const edgeColor = isLastEdge ? '#10b981' : '#60a5fa';
  const labelBg = isLastEdge 
    ? 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)' 
    : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)';

  return (
    <>
      {/* 글로우 효과 배경 */}
      <path
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeWidth={8}
        strokeOpacity={0.2}
        style={{
          filter: 'blur(4px)',
        }}
      />
      
      {/* 메인 엣지 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isLastEdge ? '8 4' : 'none',
          filter: selected ? `drop-shadow(0 0 6px ${edgeColor})` : 'none',
        }}
        markerEnd={markerEnd}
      />

      {/* 라벨 렌더링 */}
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <div
            className={`
              px-3 py-2 rounded-lg text-center
              transition-all duration-200
              ${selected ? 'scale-110' : 'hover:scale-105'}
            `}
            style={{
              background: labelBg,
              border: `1px solid ${edgeColor}60`,
              boxShadow: `0 4px 15px rgba(0,0,0,0.4), 0 0 10px ${edgeColor}30`,
            }}
          >
            {/* 메시지 타입 */}
            <div 
              className="text-xs font-bold tracking-wide"
              style={{ color: edgeColor }}
            >
              {messageType || 'pacs.008'}
            </div>
            
            {/* 금액 상세 (첫 번째 엣지에만) */}
            {messageDetail && (
              <div className="text-white text-xs mt-1 font-medium">
                {messageDetail}
              </div>
            )}
            
            {/* 애니메이션 화살표 */}
            {animated && (
              <div 
                className="text-xs mt-1 animate-pulse"
                style={{ color: edgeColor }}
              >
                →→→
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default MessageEdge;


import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import EntityNode from './EntityNode';
import MessageEdge from './MessageEdge';

// 커스텀 노드/엣지 타입 등록
const nodeTypes = {
  entityNode: EntityNode,
};

const edgeTypes = {
  messageEdge: MessageEdge,
};

// 기본 엣지 마커 설정
const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#60a5fa',
  },
  style: {
    strokeWidth: 2,
  },
};

/**
 * 다이어그램 캔버스 컴포넌트
 * React Flow 기반의 인터랙티브 시각화
 */
const DiagramCanvas = ({ 
  nodes: initialNodes, 
  edges: initialEdges, 
  onNodeClick,
  onEdgeClick,
  flowRef,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 노드/엣지 업데이트 시 동기화
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleEdgeClick = useCallback((event, edge) => {
    onEdgeClick?.(edge);
  }, [onEdgeClick]);

  // 노드가 없을 때 표시할 빈 상태
  if (!nodes || nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900">
        <div className="text-center p-8">
          {/* 애니메이션 아이콘 */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-4xl animate-pulse">🔄</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            다이어그램을 생성하려면
          </h3>
          <p className="text-slate-500 mb-6">
            왼쪽 패널에서 XML 파일을 업로드하거나<br />
            샘플 데이터를 불러오세요
          </p>
          
          {/* 흐름 예시 */}
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-2xl">👤</span>
            <span className="text-blue-500">→</span>
            <span className="text-2xl">🏦</span>
            <span className="text-blue-500">→</span>
            <span className="text-2xl">🏛️</span>
            <span className="text-blue-500">→</span>
            <span className="text-2xl">🏦</span>
            <span className="text-blue-500">→</span>
            <span className="text-2xl">👤</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={flowRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        {/* 배경 그리드 */}
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#334155"
        />
        
        {/* 컨트롤 패널 */}
        <Controls 
          className="!bg-slate-800 !border-slate-700 !rounded-xl !shadow-xl"
          showInteractive={false}
        />
        
        {/* 미니맵 */}
        <MiniMap
          nodeColor={(node) => {
            return node.data?.colors?.border || '#60a5fa';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          className="!bg-slate-800 !border-slate-700 !rounded-xl"
          pannable
          zoomable
        />
        
        {/* 범례 */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl">
          <div className="text-xs text-slate-400 mb-2 font-medium">범례</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-400" />
              <span className="text-xs text-slate-500">pacs.008 메시지</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-400 border-dashed border-t-2 border-green-400" style={{ background: 'transparent' }} />
              <span className="text-xs text-slate-500">Credit Received</span>
            </div>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;


import React, { useState, useRef, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import FileUploader from './components/FileUploader';
import DiagramCanvas from './components/DiagramCanvas';
import SidePanel from './components/SidePanel';
import { parsePacs008, getSampleXml } from './utils/xmlParser';
import { mapToFlowData } from './utils/flowMapper';

/**
 * ISO20022 Flow Visualizer 메인 앱
 */
function App() {
  // 상태 관리
  const [xmlContent, setXmlContent] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // Refs
  const flowRef = useRef(null);

  // XML 업로드 처리
  const handleUpload = useCallback((xml) => {
    setError(null);
    setXmlContent(xml);
    
    try {
      const parsed = parsePacs008(xml);
      setParsedData(parsed);
      
      const { nodes: flowNodes, edges: flowEdges } = mapToFlowData(parsed);
      setNodes(flowNodes);
      setEdges(flowEdges);
      
      // 선택 초기화
      setSelectedNode(null);
      setSelectedEdge(null);
    } catch (err) {
      console.error('XML 파싱 오류:', err);
      setError(err.message);
      setParsedData(null);
      setNodes([]);
      setEdges([]);
    }
  }, []);

  // 샘플 데이터 로드
  const handleLoadSample = useCallback(() => {
    const sampleXml = getSampleXml();
    handleUpload(sampleXml);
  }, [handleUpload]);

  // 초기화
  const handleReset = useCallback(() => {
    setXmlContent('');
    setParsedData(null);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setError(null);
  }, []);

  // 노드 클릭
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setRightPanelCollapsed(false);
  }, []);

  // 엣지 클릭
  const handleEdgeClick = useCallback((edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setRightPanelCollapsed(false);
  }, []);

  // 선택 해제
  const handleClearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // 다크모드 토글
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const hasData = nodes.length > 0;

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 bg-slate-950 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* 툴바 */}
      <Toolbar
        onReset={handleReset}
        flowRef={flowRef}
        hasData={hasData}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 좌측 패널 - 파일 업로더 */}
        <aside 
          className={`
            ${leftPanelCollapsed ? 'w-12' : 'w-80'} 
            bg-slate-900/95 backdrop-blur-sm border-r border-slate-700
            flex flex-col transition-all duration-300
          `}
        >
          {/* 패널 토글 */}
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="p-3 border-b border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {leftPanelCollapsed ? '→' : '←'}
          </button>
          
          {!leftPanelCollapsed && (
            <div className="flex-1 overflow-auto">
              <FileUploader 
                onUpload={handleUpload} 
                onLoadSample={handleLoadSample}
              />
              
              {/* 에러 메시지 */}
              {error && (
                <div className="mx-4 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 text-xl">⚠️</span>
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">파싱 오류</h4>
                      <p className="text-red-300/80 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* 중앙 - 다이어그램 캔버스 */}
        <section className="flex-1 bg-slate-900 relative">
          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            flowRef={flowRef}
          />
          
          {/* 플로팅 통계 (데이터가 있을 때만) */}
          {hasData && parsedData && (
            <div className="absolute top-4 right-4 p-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl">
              <div className="text-xs text-slate-500 mb-1">Message ID</div>
              <div className="text-sm text-white font-mono mb-3">{parsedData.messageId}</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💵</span>
                <span className="text-xl font-bold text-white">
                  {parsedData.currency} {formatAmount(parsedData.amount)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* 우측 패널 - 상세 정보 */}
        <aside 
          className={`
            ${rightPanelCollapsed ? 'w-12' : 'w-96'} 
            flex flex-col transition-all duration-300
          `}
        >
          {/* 패널 토글 */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="p-3 bg-slate-900 border-b border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-700"
          >
            {rightPanelCollapsed ? '←' : '→'}
          </button>
          
          {!rightPanelCollapsed && (
            <div className="flex-1">
              <SidePanel
                xmlContent={xmlContent}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                parsedData={parsedData}
                onClearSelection={handleClearSelection}
              />
            </div>
          )}
        </aside>
      </main>

      {/* 푸터 */}
      <footer className="h-10 bg-slate-900 border-t border-slate-700 flex items-center justify-center px-4">
        <p className="text-slate-600 text-xs">
          ISO20022 Flow Visualizer • Built with React Flow • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

// 금액 포맷팅
function formatAmount(amount) {
  if (!amount) return '0';
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default App;


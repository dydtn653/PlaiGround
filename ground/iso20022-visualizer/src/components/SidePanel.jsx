import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * 사이드 패널 컴포넌트
 * XML 미리보기, 선택한 노드/엣지 상세 정보 표시
 */
const SidePanel = ({ 
  xmlContent, 
  selectedNode, 
  selectedEdge, 
  parsedData,
  onClearSelection,
}) => {
  // 탭 상태
  const [activeTab, setActiveTab] = React.useState('info');

  // 선택된 항목이 있으면 상세 탭 표시
  React.useEffect(() => {
    if (selectedNode || selectedEdge) {
      setActiveTab('details');
    }
  }, [selectedNode, selectedEdge]);

  const tabs = [
    { id: 'info', label: '정보', icon: '📊' },
    { id: 'xml', label: 'XML', icon: '📝' },
    { id: 'details', label: '상세', icon: '🔍' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700">
      {/* 탭 헤더 */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 px-4 text-sm font-medium
              transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }
            `}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-auto">
        {/* 정보 탭 */}
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            {parsedData ? (
              <>
                {/* 거래 요약 */}
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <span>💰</span> 거래 요약
                  </h3>
                  <div className="text-2xl font-bold text-white mb-1">
                    {parsedData.currency} {formatAmount(parsedData.amount)}
                  </div>
                  <div className="text-sm text-slate-400">
                    {parsedData.debtor?.name} → {parsedData.creditor?.name}
                  </div>
                </div>
                
                {/* 메시지 정보 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <span>📋</span> 메시지 정보
                  </h3>
                  <InfoRow label="Message ID" value={parsedData.messageId} />
                  <InfoRow label="생성 시간" value={parsedData.creationDateTime} />
                  <InfoRow label="거래 수" value={parsedData.numberOfTransactions} />
                </div>
                
                {/* 참여자 목록 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <span>👥</span> 참여자
                  </h3>
                  <ParticipantCard 
                    icon="👤" 
                    role="송금인" 
                    name={parsedData.debtor?.name} 
                    color="sky"
                  />
                  <ParticipantCard 
                    icon="🏦" 
                    role="송금 은행" 
                    name={parsedData.debtorAgent?.name}
                    bic={parsedData.debtorAgent?.bic}
                    color="blue"
                  />
                  {parsedData.intermediaryAgent1 && (
                    <ParticipantCard 
                      icon="🏛️" 
                      role="중개 은행" 
                      name={parsedData.intermediaryAgent1?.name}
                      bic={parsedData.intermediaryAgent1?.bic}
                      color="indigo"
                    />
                  )}
                  <ParticipantCard 
                    icon="🏦" 
                    role="수취 은행" 
                    name={parsedData.creditorAgent?.name}
                    bic={parsedData.creditorAgent?.bic}
                    color="emerald"
                  />
                  <ParticipantCard 
                    icon="👤" 
                    role="수취인" 
                    name={parsedData.creditor?.name}
                    color="teal"
                  />
                </div>
              </>
            ) : (
              <EmptyState 
                icon="📊" 
                title="데이터 없음"
                description="XML을 업로드하면 여기에 정보가 표시됩니다."
              />
            )}
          </div>
        )}
        
        {/* XML 탭 */}
        {activeTab === 'xml' && (
          <div className="p-4 xml-viewer">
            {xmlContent ? (
              <SyntaxHighlighter
                language="xml"
                style={vscDarkPlus}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  borderRadius: '12px',
                  fontSize: '12px',
                  background: '#1e293b',
                }}
              >
                {xmlContent}
              </SyntaxHighlighter>
            ) : (
              <EmptyState 
                icon="📝" 
                title="XML 없음"
                description="파일을 업로드하면 여기에 XML이 표시됩니다."
              />
            )}
          </div>
        )}
        
        {/* 상세 탭 */}
        {activeTab === 'details' && (
          <div className="p-4">
            {selectedNode ? (
              <NodeDetails node={selectedNode} onClose={onClearSelection} />
            ) : selectedEdge ? (
              <EdgeDetails edge={selectedEdge} onClose={onClearSelection} />
            ) : (
              <EmptyState 
                icon="🔍" 
                title="선택 없음"
                description="다이어그램에서 노드나 엣지를 클릭하면 상세 정보가 표시됩니다."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 정보 행 컴포넌트
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
    <span className="text-slate-500 text-sm">{label}</span>
    <span className="text-slate-200 text-sm font-mono truncate ml-2 max-w-[150px]" title={value}>
      {value || '-'}
    </span>
  </div>
);

// 참여자 카드 컴포넌트
const ParticipantCard = ({ icon, role, name, bic, color }) => {
  const colorClasses = {
    sky: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
  };
  
  return (
    <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} border rounded-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5">{role}</div>
          <div className="text-sm text-white font-medium truncate">{name || '-'}</div>
          {bic && (
            <div className="text-xs text-slate-400 font-mono mt-1">{bic}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 노드 상세 정보
const NodeDetails = ({ node, onClose }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span>{node.data?.icon}</span>
        {node.data?.label}
      </h3>
      <button 
        onClick={onClose}
        className="text-slate-500 hover:text-slate-300 p-1"
      >
        ✕
      </button>
    </div>
    
    <div className="space-y-3">
      <InfoRow label="이름" value={node.data?.name} />
      {node.data?.bic && <InfoRow label="BIC" value={node.data?.bic} />}
      {node.data?.address && <InfoRow label="주소" value={node.data?.address} />}
      <InfoRow label="노드 유형" value={node.data?.nodeType} />
    </div>
  </div>
);

// 엣지 상세 정보
const EdgeDetails = ({ edge, onClose }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span>📨</span>
        메시지 정보
      </h3>
      <button 
        onClick={onClose}
        className="text-slate-500 hover:text-slate-300 p-1"
      >
        ✕
      </button>
    </div>
    
    <div className="space-y-3">
      <InfoRow label="메시지 유형" value={edge.data?.messageType} />
      {edge.data?.messageDetail && (
        <InfoRow label="금액" value={edge.data?.messageDetail} />
      )}
      <InfoRow label="출발" value={edge.source} />
      <InfoRow label="도착" value={edge.target} />
    </div>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState = ({ icon, title, description }) => (
  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
    <div className="text-4xl mb-4 opacity-50">{icon}</div>
    <h4 className="text-slate-400 font-medium mb-2">{title}</h4>
    <p className="text-slate-600 text-sm max-w-[200px]">{description}</p>
  </div>
);

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

export default SidePanel;


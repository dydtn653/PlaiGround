/**
 * XML 파싱 결과를 React Flow 노드/엣지로 변환
 */

const NODE_TYPES = {
  DEBTOR: 'debtor',
  DEBTOR_AGENT: 'debtorAgent',
  INTERMEDIARY_1: 'intermediary1',
  INTERMEDIARY_2: 'intermediary2',
  INTERMEDIARY_3: 'intermediary3',
  CREDITOR_AGENT: 'creditorAgent',
  CREDITOR: 'creditor',
};

const NODE_COLORS = {
  [NODE_TYPES.DEBTOR]: { bg: '#0c4a6e', border: '#0ea5e9', icon: '#38bdf8' },
  [NODE_TYPES.DEBTOR_AGENT]: { bg: '#1e3a5f', border: '#3b82f6', icon: '#60a5fa' },
  [NODE_TYPES.INTERMEDIARY_1]: { bg: '#312e81', border: '#6366f1', icon: '#818cf8' },
  [NODE_TYPES.INTERMEDIARY_2]: { bg: '#4c1d95', border: '#8b5cf6', icon: '#a78bfa' },
  [NODE_TYPES.INTERMEDIARY_3]: { bg: '#581c87', border: '#a855f7', icon: '#c084fc' },
  [NODE_TYPES.CREDITOR_AGENT]: { bg: '#065f46', border: '#10b981', icon: '#34d399' },
  [NODE_TYPES.CREDITOR]: { bg: '#064e3b', border: '#14b8a6', icon: '#2dd4bf' },
};

const NODE_ICONS = {
  [NODE_TYPES.DEBTOR]: '👤',
  [NODE_TYPES.DEBTOR_AGENT]: '🏦',
  [NODE_TYPES.INTERMEDIARY_1]: '🏛️',
  [NODE_TYPES.INTERMEDIARY_2]: '🏛️',
  [NODE_TYPES.INTERMEDIARY_3]: '🏛️',
  [NODE_TYPES.CREDITOR_AGENT]: '🏦',
  [NODE_TYPES.CREDITOR]: '👤',
};

/**
 * 파싱된 데이터를 React Flow 노드/엣지로 변환
 */
export function mapToFlowData(parsedData) {
  const nodes = [];
  const edges = [];
  
  const baseY = 100;
  const nodeSpacing = 220;
  let currentX = 100;
  let nodeIndex = 0;
  
  // 활성화된 참여자들만 수집
  const participants = [];
  
  // 1. Debtor
  if (parsedData.debtor) {
    participants.push({
      type: NODE_TYPES.DEBTOR,
      data: parsedData.debtor,
      label: 'Debtor',
    });
  }
  
  // 2. Debtor Agent
  if (parsedData.debtorAgent) {
    participants.push({
      type: NODE_TYPES.DEBTOR_AGENT,
      data: parsedData.debtorAgent,
      label: 'Debtor Agent',
    });
  }
  
  // 3. Intermediary Agents
  if (parsedData.intermediaryAgent1) {
    participants.push({
      type: NODE_TYPES.INTERMEDIARY_1,
      data: parsedData.intermediaryAgent1,
      label: 'Intermediary 1',
    });
  }
  
  if (parsedData.intermediaryAgent2) {
    participants.push({
      type: NODE_TYPES.INTERMEDIARY_2,
      data: parsedData.intermediaryAgent2,
      label: 'Intermediary 2',
    });
  }
  
  if (parsedData.intermediaryAgent3) {
    participants.push({
      type: NODE_TYPES.INTERMEDIARY_3,
      data: parsedData.intermediaryAgent3,
      label: 'Intermediary 3',
    });
  }
  
  // 4. Creditor Agent
  if (parsedData.creditorAgent) {
    participants.push({
      type: NODE_TYPES.CREDITOR_AGENT,
      data: parsedData.creditorAgent,
      label: 'Creditor Agent',
    });
  }
  
  // 5. Creditor
  if (parsedData.creditor) {
    participants.push({
      type: NODE_TYPES.CREDITOR,
      data: parsedData.creditor,
      label: 'Creditor',
    });
  }
  
  // 노드 생성
  participants.forEach((participant, index) => {
    const colors = NODE_COLORS[participant.type];
    const icon = NODE_ICONS[participant.type];
    
    nodes.push({
      id: participant.type,
      type: 'entityNode',
      position: { x: currentX, y: baseY },
      data: {
        label: participant.label,
        name: participant.data.name || participant.label,
        bic: participant.data.bic || '',
        address: participant.data.address || '',
        icon,
        colors,
        nodeType: participant.type,
        isFirst: index === 0,
        isLast: index === participants.length - 1,
      },
    });
    
    currentX += nodeSpacing;
    nodeIndex++;
  });
  
  // 엣지 생성
  for (let i = 0; i < participants.length - 1; i++) {
    const sourceType = participants[i].type;
    const targetType = participants[i + 1].type;
    const isFirstEdge = i === 0;
    const isLastEdge = i === participants.length - 2;
    
    // 메시지 유형 결정
    let messageType = 'pacs.008';
    let messageDetail = '';
    
    if (isFirstEdge) {
      messageDetail = `${parsedData.currency} ${formatAmount(parsedData.amount)}`;
    }
    
    if (isLastEdge) {
      messageType = 'Credit Received';
    }
    
    edges.push({
      id: `edge-${sourceType}-${targetType}`,
      source: sourceType,
      target: targetType,
      type: 'messageEdge',
      data: {
        messageType,
        messageDetail,
        isFirstEdge,
        isLastEdge,
        animated: !isLastEdge,
      },
      animated: !isLastEdge,
    });
  }
  
  return { nodes, edges };
}

/**
 * 금액 포맷팅
 */
function formatAmount(amount) {
  if (!amount) return '0';
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 참여자 통계 정보 생성
 */
export function getFlowStats(parsedData) {
  let participantCount = 0;
  
  if (parsedData.debtor) participantCount++;
  if (parsedData.debtorAgent) participantCount++;
  if (parsedData.intermediaryAgent1) participantCount++;
  if (parsedData.intermediaryAgent2) participantCount++;
  if (parsedData.intermediaryAgent3) participantCount++;
  if (parsedData.creditorAgent) participantCount++;
  if (parsedData.creditor) participantCount++;
  
  return {
    participantCount,
    messageId: parsedData.messageId,
    amount: `${parsedData.currency} ${formatAmount(parsedData.amount)}`,
    creationDateTime: parsedData.creationDateTime,
  };
}


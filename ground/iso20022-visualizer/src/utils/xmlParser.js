import { XMLParser } from 'fast-xml-parser';

/**
 * ISO20022 XML (pacs.008) 파서
 * XML 전문을 분석하여 결제 참여자 정보를 추출합니다.
 */

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
};

/**
 * pacs.008 XML에서 결제 참여자 정보 추출
 */
export function parsePacs008(xmlString) {
  const parser = new XMLParser(parserOptions);
  
  try {
    const parsed = parser.parse(xmlString);
    
    // pacs.008 구조 탐색
    const document = parsed.Document || parsed;
    const fiToFiCstmrCdtTrf = document.FIToFICstmrCdtTrf || document['FIToFICstmrCdtTrf'];
    
    if (!fiToFiCstmrCdtTrf) {
      // 대체 경로 시도
      return parseGenericXml(parsed);
    }
    
    const grpHdr = fiToFiCstmrCdtTrf.GrpHdr;
    const cdtTrfTxInf = fiToFiCstmrCdtTrf.CdtTrfTxInf;
    
    // 배열이 아닌 경우 배열로 변환
    const transactions = Array.isArray(cdtTrfTxInf) ? cdtTrfTxInf : [cdtTrfTxInf];
    const txInfo = transactions[0];
    
    // 금액 정보 추출
    const amount = extractAmount(txInfo);
    
    // 참여자 정보 추출
    const result = {
      messageId: grpHdr?.MsgId || 'Unknown',
      creationDateTime: grpHdr?.CreDtTm || '',
      numberOfTransactions: grpHdr?.NbOfTxs || 1,
      
      // Debtor (채무자/송금인)
      debtor: extractParty(txInfo?.Dbtr, 'Debtor'),
      
      // Debtor Agent (송금 은행)
      debtorAgent: extractAgent(txInfo?.DbtrAgt, 'Debtor Agent'),
      
      // Intermediary Agents (중개 은행들)
      intermediaryAgent1: extractAgent(txInfo?.IntrmyAgt1, 'Intermediary Agent 1'),
      intermediaryAgent2: extractAgent(txInfo?.IntrmyAgt2, 'Intermediary Agent 2'),
      intermediaryAgent3: extractAgent(txInfo?.IntrmyAgt3, 'Intermediary Agent 3'),
      
      // Creditor Agent (수취 은행)
      creditorAgent: extractAgent(txInfo?.CdtrAgt, 'Creditor Agent'),
      
      // Creditor (수취인)
      creditor: extractParty(txInfo?.Cdtr, 'Creditor'),
      
      // 금액 정보
      amount: amount.value,
      currency: amount.currency,
      
      // 원본 데이터
      raw: txInfo,
    };
    
    return result;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    throw new Error('XML 파싱에 실패했습니다: ' + error.message);
  }
}

/**
 * 일반 XML 파싱 (pacs.008 이외의 경우)
 */
function parseGenericXml(parsed) {
  // 재귀적으로 데이터 탐색
  const result = {
    messageId: findValue(parsed, ['MsgId', 'Id']) || 'Unknown',
    creationDateTime: findValue(parsed, ['CreDtTm', 'CreationDateTime']) || '',
    numberOfTransactions: 1,
    debtor: { name: findValue(parsed, ['Dbtr', 'Debtor', 'Nm']) || 'Debtor', bic: '' },
    debtorAgent: { name: 'Debtor Agent', bic: findValue(parsed, ['DbtrAgt', 'BIC', 'BICFI']) || '' },
    intermediaryAgent1: null,
    intermediaryAgent2: null,
    intermediaryAgent3: null,
    creditorAgent: { name: 'Creditor Agent', bic: findValue(parsed, ['CdtrAgt', 'BIC', 'BICFI']) || '' },
    creditor: { name: findValue(parsed, ['Cdtr', 'Creditor', 'Nm']) || 'Creditor', bic: '' },
    amount: findValue(parsed, ['Amt', 'InstdAmt', 'IntrBkSttlmAmt']) || '0',
    currency: 'USD',
    raw: parsed,
  };
  
  return result;
}

/**
 * 중첩 객체에서 값 찾기
 */
function findValue(obj, keys, depth = 0) {
  if (depth > 10 || !obj || typeof obj !== 'object') return null;
  
  for (const key of keys) {
    if (obj[key]) {
      if (typeof obj[key] === 'string' || typeof obj[key] === 'number') {
        return obj[key];
      }
      if (obj[key]['#text']) {
        return obj[key]['#text'];
      }
    }
  }
  
  for (const prop in obj) {
    const result = findValue(obj[prop], keys, depth + 1);
    if (result) return result;
  }
  
  return null;
}

/**
 * Party 정보 추출 (Debtor/Creditor)
 */
function extractParty(party, defaultName) {
  if (!party) {
    return { name: defaultName, bic: '' };
  }
  
  return {
    name: party.Nm || party.Name || defaultName,
    address: extractAddress(party.PstlAdr),
    id: party.Id?.OrgId?.Othr?.Id || party.Id?.PrvtId?.Othr?.Id || '',
  };
}

/**
 * Agent 정보 추출 (은행 정보)
 */
function extractAgent(agent, defaultName) {
  if (!agent) {
    return null;
  }
  
  const finInstnId = agent.FinInstnId;
  if (!finInstnId) {
    return { name: defaultName, bic: '' };
  }
  
  return {
    name: finInstnId.Nm || defaultName,
    bic: finInstnId.BICFI || finInstnId.BIC || '',
    clearingSystemId: finInstnId.ClrSysMmbId?.MmbId || '',
    address: extractAddress(finInstnId.PstlAdr),
  };
}

/**
 * 주소 정보 추출
 */
function extractAddress(addr) {
  if (!addr) return '';
  
  const parts = [];
  if (addr.StrtNm) parts.push(addr.StrtNm);
  if (addr.TwnNm) parts.push(addr.TwnNm);
  if (addr.Ctry) parts.push(addr.Ctry);
  
  return parts.join(', ');
}

/**
 * 금액 정보 추출
 */
function extractAmount(txInfo) {
  if (!txInfo) return { value: '0', currency: 'USD' };
  
  // IntrBkSttlmAmt (Interbank Settlement Amount) 확인
  const intrBkAmt = txInfo.IntrBkSttlmAmt;
  if (intrBkAmt) {
    return {
      value: intrBkAmt['#text'] || intrBkAmt || '0',
      currency: intrBkAmt['@_Ccy'] || 'USD',
    };
  }
  
  // InstdAmt (Instructed Amount) 확인
  const instdAmt = txInfo.InstdAmt;
  if (instdAmt) {
    return {
      value: instdAmt['#text'] || instdAmt || '0',
      currency: instdAmt['@_Ccy'] || 'USD',
    };
  }
  
  return { value: '0', currency: 'USD' };
}

/**
 * 샘플 pacs.008 XML 생성
 */
export function getSampleXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSGID-20231205-001</MsgId>
      <CreDtTm>2023-12-05T10:30:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>INDA</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR-001</InstrId>
        <EndToEndId>E2E-REF-001</EndToEndId>
        <TxId>TXN-20231205-001</TxId>
        <UETR>eb6305c9-1f7f-49de-aed0-16487c27b42d</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">150000.00</IntrBkSttlmAmt>
      <IntrBkSttlmDt>2023-12-05</IntrBkSttlmDt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr>
        <Nm>Samsung Electronics Co., Ltd.</Nm>
        <PstlAdr>
          <StrtNm>129 Samsung-ro</StrtNm>
          <TwnNm>Suwon</TwnNm>
          <Ctry>KR</Ctry>
        </PstlAdr>
      </Dbtr>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>KOABORKKXXX</BICFI>
          <Nm>Korea Exchange Bank</Nm>
        </FinInstnId>
      </DbtrAgt>
      <IntrmyAgt1>
        <FinInstnId>
          <BICFI>CITIUS33XXX</BICFI>
          <Nm>Citibank N.A.</Nm>
        </FinInstnId>
      </IntrmyAgt1>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>BABOROBU</BICFI>
          <Nm>Banca Transilvania</Nm>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>Tech Solutions SRL</Nm>
        <PstlAdr>
          <StrtNm>Strada Victoriei 25</StrtNm>
          <TwnNm>Bucharest</TwnNm>
          <Ctry>RO</Ctry>
        </PstlAdr>
      </Cdtr>
      <RmtInf>
        <Ustrd>Payment for Invoice INV-2023-1205</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}


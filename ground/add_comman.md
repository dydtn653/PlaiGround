바로 기획서 느낌으로 정리해줄게.
(React ISO20022 Flow Visualizer에 **고위험국가 표시 + MT 매핑 뷰** 추가하는 요구사항)

---

## 1. 개요

### 1.1 목적

* pacs.008 XML 기반 플로우 시각화 화면에

  1. **국가 조합 및 고위험국가 여부를 직관적으로 표시**하고
  2. 각 노드(송금인/은행/수취인)가 **MT103 어떤 태그와 매핑되는지** 함께 보여줌으로써
* 실제 업무(UAT/교육/설명)에서 CBPR+·MX 전환 구조를 쉽게 이해하도록 지원.

### 1.2 적용 범위

* 대상 메시지: `pacs.008.001.08`
* 화면: ISO20022 Flow Visualizer (standalone React 웹페이지)
* 샘플 XML: 사용자가 제공한 **신한유럽 → 고위험국(이란) 수취인** 케이스

---

## 2. 샘플 데이터 정의

### 2.1 고위험국 샘플 pacs.008 (화면 “샘플 로드” 시 기본 사용)

* 주요 구조

  * 송금인(Dbtr): `KIM YONGSU`, `Frankfurt`, `DE`
  * 송신은행(DbtrAgt): `Shinhan Bank Europe`, `BIC: SHBKDEFFXX`
  * 중계은행(IntrmyAgt1): `Citibank N.A.`, `BIC: CITIUS33XXX`
  * 수취은행(CdtrAgt): `Bank Melli Iran`, `BIC: IRBANKTEXXX`
  * 수취인(Cdtr): `ALIREZA TRADING CO.`, `Tehran`, `IR`
* 이 케이스는 국가 플로우가
  **DE → US → IR**로 이어지며,
  **IR(이란)**이 고위험국으로 플래그되는 샘플.

---

## 3. 화면 구조 변경

### 3.1 상단 플로우 영역

* 기존: Debtor / Debtor Agent / Intermediary 1 / Creditor Agent / Creditor 노드.
* 추가 요소:

  1. **국가 조합 배지**

     * 다이어그램 상단 우측(또는 Message ID 카드 하단)에 표시:

       * 예: `DE → US → IR`
       * 색상 규칙:

         * 기본: 파랑/회색
         * 고위험국 포함 시: 배지 배경 빨강, 국기 아이콘 옆에 “⚠ High-Risk Country Detected”
  2. **노드별 국가 표시**

     * 각 카드 하단에 국가코드/국기 표시:

       * Debtor: `DE`
       * Debtor Agent: `DE`
       * Intermediary 1: `US`
       * Creditor Agent: `IR`
       * Creditor: `IR`
     * 고위험국에 해당하는 노드는 테두리나 아이콘 색상을 경고색으로 변경.

### 3.2 우측 패널 탭 확장

현재: `정보 | XML | 상세` 정도 구조라고 보면,

새 탭/섹션을 추가:

1. **[리스크] 탭**

   * 항목 예시

     * 국가 조합: `DE → US → IR`
     * Cross-border 여부: `Yes`
     * 고위험국 포함 여부: `Yes (IR)`
     * 설명:

       * “플로우 내에 고위험국가(IR)가 포함되어 있습니다. 수취은행 및 수취인 주소를 확인하세요.”
   * 각 항목 옆 툴팁:

     * 고위험국 정의, 기준(예: 내부 리스트) 간단 설명.

2. **[MT 매핑] 탭**

   * 선택된 노드에 따라 MT103 매핑 정보 다르게 표시.
   * 구성:

     * 상단: “현재 선택 노드: Debtor / Debtor Agent / Creditor …”
     * 하단: **매핑 테이블**

---

## 4. 고위험국가 판별 로직

### 4.1 데이터 추출

* pacs.008에서 다음 경로들의 국가코드 추출:

| 역할    | 경로/규칙                                                 |
| ----- | ----------------------------------------------------- |
| 송금인국  | `/CdtTrfTxInf/Dbtr/PstlAdr/Ctry`                      |
| 송신은행국 | `DbtrAgt/FinInstnId/BICFI` 의 5~6번째 문자 (BIC country코드) |
| 중계1국  | `IntrmyAgt1/FinInstnId/BICFI` 의 국가코드                  |
| 수취은행국 | `CdtrAgt/FinInstnId/BICFI` 의 국가코드                     |
| 수취인국  | `Cdtr/PstlAdr/Ctry`                                   |

* 국가 조합(flow) =
  `[송금인국 or 송신은행국] → 중계국 → [수취은행국 or 수취인국]`
  (존재하는 값만 사용)

### 4.2 고위험국 리스트 (예시)

* Front-end 상수로 정의 (추후 백엔드 연계 가능):

  * `["IR", "KP", "SY", "SD", "CU", ...]`
* 플로우 내에 위 리스트에 포함된 국가코드가 하나라도 있으면:

  * `hasHighRiskCountry = true`
  * `highRiskCountriesInFlow = ["IR"]` 등으로 계산.

### 4.3 화면 반영 규칙

1. `hasHighRiskCountry = true` 인 경우

   * 상단 국가 조합 배지: 빨간 배경 + 경고 아이콘.
   * 우측 [리스크] 탭에서 고위험국 리스트를 붉은 텍스트로 표시.
   * 고위험국에 해당하는 노드 카드 테두리/아이콘 색상 변경.

2. `hasHighRiskCountry = false` 인 경우

   * 국가 조합 배지: 기본 색상.
   * [리스크] 탭에 “고위험국 없음” 초록 체크 아이콘.

---

## 5. MT103 매핑 정보 표시

### 5.1 매핑 컨셉

* 사용자가 다이어그램에서 특정 노드를 클릭하면:

  * 우측 패널에 해당 노드의 **ISO20022 XPath**와
  * 대응하는 **SWIFT MT103 태그**를 표로 보여줌.

### 5.2 기본 매핑 예시 (교육용 기준)

| 역할         | pacs.008 요소 (예시 XPath)                     | MT103 Tag 예시                                                        |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Message ID | `/GrpHdr/MsgId`                            | :20 (Transaction Reference Number)                                  |
| 금액         | `/CdtTrfTxInf/IntrBkSttlmAmt`              | :32A (Value Date/Currency/Interbank Settled Amount)                 |
| 송금인 이름     | `/CdtTrfTxInf/Dbtr/Nm`                     | :50K (Ordering Customer)                                            |
| 송금인 주소     | `/CdtTrfTxInf/Dbtr/PstlAdr/...`            | :50K (라인 분할)                                                        |
| 송신은행 BIC   | `/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI`    | :52A (Ordering Institution) 또는 :53A (Sender’s Correspondent) 등 케이스별 |
| 중계1 BIC    | `/CdtTrfTxInf/IntrmyAgt1/FinInstnId/BICFI` | :56A (Intermediary)                                                 |
| 수취은행 BIC   | `/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI`    | :57A (Account With Institution)                                     |
| 수취인 이름     | `/CdtTrfTxInf/Cdtr/Nm`                     | :59 (Beneficiary Customer)                                          |
| 수취인 주소     | `/CdtTrfTxInf/Cdtr/PstlAdr/...`            | :59 (라인 분할)                                                         |

※ 실제 MT 매핑 룰은 은행별로 달라질 수 있으므로, 화면 상단에
“*예시 매핑이며, 실제 운영 매핑은 은행별로 상이할 수 있습니다*” 안내 문구 추가.

### 5.3 UI 구성 예시

* 우측 패널 > **MT 매핑 탭** 내부:

```text
[현재 선택 노드] Creditor (수취인)

ISO 20022 ↔ MT103 매핑

| 역할       | ISO20022 요소                          | MT103 Tag | 비고        |
|------------|----------------------------------------|----------|-------------|
| 수취인 이름| /CdtTrfTxInf/Cdtr/Nm                  | :59      | Line 1      |
| 수취인 도시| /CdtTrfTxInf/Cdtr/PstlAdr/TwnNm       | :59      | Line 2      |
| 수취인 국가| /CdtTrfTxInf/Cdtr/PstlAdr/Ctry        | :59      | Line 3 (CC) |
```

* 노드 클릭 시 테이블 내용이 노드별로 교체.

---

## 6. 인터랙션 시나리오

1. 사용자가 “샘플 로드” 버튼 클릭
   → 고위험국 샘플 pacs.008 로딩
   → 다이어그램 렌더 + 국가 조합 `DE → US → IR` 표시.

2. 사용자가 다이어그램 상의 **Creditor Agent(수취은행)** 노드 클릭

   * 오른쪽 [리스크] 탭:

     * 고위험국: `IR`
     * 설명 문구 표시.
   * [MT 매핑] 탭:

     * `CdtrAgt/FinInstnId/BICFI` → `:57A` 등 매핑 테이블 노출.

3. 사용자가 다른 XML을 붙여넣고 “다이어그램 생성” 클릭

   * 파서가 국가 정보 재계산 → 고위험 여부 판정.
   * 결과에 따라 상단 배지/노드 색/리스크 탭 내용 갱신.

---

## 7. 향후 확장 포인트 (옵션)

* 고위험국 리스트를 Front-end 상수에서 **백엔드 API 또는 JSON 설정 파일**로 분리.
* MT103 뿐 아니라

  * `MT202COV`, `MT202`, `camt.056`, `camt.029` 등 다른 메시지 매핑 탭 추가.
* “자연어 요약” 섹션:

  * “Shinhan Bank Europe(DE)에서 Citibank N.A.(US)를 거쳐 이란(IR) 소재 Bank Melli Iran으로 USD 150,000을 송금하는 거래입니다. 이란은 고위험국가로 분류됩니다.”
  * 이런 설명을 LLM으로 자동 생성.

---

이 기획서 그대로 노션/문서에 붙여서

* 위에 “화면 캡처 + 고위험국 배지/MT 매핑 탭 와이어프레임”만 추가하면
  상사/팀원 설명용 문서로 바로 쓸 수 있을 거야.

원하면 **MT 매핑 탭용 JSON 정의** (role, xpath, mtTag를 설정 파일로 만들기)도 이어서 만들어줄게.

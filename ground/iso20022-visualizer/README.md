# 🔀 ISO20022 Flow Visualizer

ISO20022 XML (pacs.008 등) 결제 메시지를 시각화하는 React 기반 웹 애플리케이션입니다.

![ISO20022 Flow Visualizer](https://via.placeholder.com/800x400?text=ISO20022+Flow+Visualizer)

## ✨ 주요 기능

- **📁 XML 업로드**: pacs.008 등 ISO20022 XML 파일 드래그 앤 드롭 업로드
- **🔄 실시간 시각화**: React Flow 기반의 인터랙티브 다이어그램
- **👥 참여자 표시**: Debtor, Agent, Creditor 등 결제 참여자 노드 시각화
- **📨 메시지 흐름**: 각 참여자 간 메시지 타입과 금액 표시
- **🔍 상세 정보**: 노드/엣지 클릭 시 상세 정보 표시
- **💾 PNG 내보내기**: 다이어그램을 이미지로 저장
- **🌙 다크 모드**: 모던한 다크 테마 UI

## 🚀 시작하기

### 요구 사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치

```bash
# 프로젝트 디렉토리로 이동
cd iso20022-visualizer

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
iso20022-visualizer/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── DiagramCanvas.jsx   # React Flow 다이어그램
│   │   ├── EntityNode.jsx      # 커스텀 노드 컴포넌트
│   │   ├── MessageEdge.jsx     # 커스텀 엣지 컴포넌트
│   │   ├── FileUploader.jsx    # XML 업로드 컴포넌트
│   │   ├── SidePanel.jsx       # 상세 정보 패널
│   │   └── Toolbar.jsx         # 상단 툴바
│   ├── utils/
│   │   ├── xmlParser.js        # ISO20022 XML 파서
│   │   └── flowMapper.js       # XML → React Flow 변환
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   ├── main.jsx                # 엔트리 포인트
│   └── index.css               # 전역 스타일
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ 기술 스택

| 기술 | 용도 |
|------|------|
| **React** | UI 프레임워크 |
| **Vite** | 빌드 도구 |
| **React Flow** | 노드/엣지 시각화 |
| **fast-xml-parser** | ISO20022 XML 파싱 |
| **Tailwind CSS** | 스타일링 |
| **html-to-image** | PNG 내보내기 |
| **react-syntax-highlighter** | XML 코드 뷰어 |

## 📝 지원 메시지 유형

- **pacs.008** - FIToFICustomerCreditTransfer (고객 송금)
- pacs.009 - FinancialInstitutionCreditTransfer
- camt.056 - FIToFIPaymentCancellationRequest
- camt.029 - ResolutionOfInvestigation

## 🎨 스크린샷

### 메인 화면
- 좌측: XML 업로드 패널
- 중앙: 인터랙티브 다이어그램
- 우측: 상세 정보 패널

### 다이어그램 요소
- **노드**: 결제 참여자 (Debtor, Agent, Creditor)
- **엣지**: 메시지 흐름 (pacs.008, Credit Received 등)
- **라벨**: 메시지 타입 및 금액 표시

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR을 환영합니다!


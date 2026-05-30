# 📌 fakeCLI 프로젝트 인계 및 요약 가이드 (Handover & Summary)

> **다음 세션의 AI 에이전트 필독**: 이 문서는 프로젝트의 전체 아키텍처와 히스토리를 요약하여 최소한의 토큰으로 맥락을 파악하기 위해 작성되었습니다. 추가 개발 진행 시 이 문서와 `task.md`를 먼저 읽고 시작하세요.

---

## 🚀 프로젝트 개요 & 배포 정보
* **정체성**: 회사/공공장소용 업무 보안 위장용 가짜 코딩 시뮬레이터 (유머 목적)
* **배포 URL**: [https://jjajjara.github.io/fakeCLI/](https://jjajjara.github.io/fakeCLI/)
* **원격 저장소**: [jjajjara/fakeCLI](https://github.com/jjajjara/fakeCLI.git)
* **기술 스택**: React v19, Vite v8, Vanilla CSS, `gh-pages` (배포 도구)
* **Git 로컬 설정 (인증)**:
  - `user.name`: "jjajjara"
  - `user.email`: "62320913+jjajjara@users.noreply.github.com" (GitHub No-Reply 이메일 적용됨)

---

## 🛠️ 핵심 파일 구조 & 역할

* **`index.html`**: 브라우저 기본 타이틀을 `fakeCLI`로 설정.
* **`src/App.jsx`**:
  - 인트로 화면 렌더링 및 다국어 스위칭 제어.
  - 기본 활성 언어: 영어(`en`)
  - 가상 파일 시스템(`files`) 상태 및 가짜 리팩토링/에러 버전 코드 스위칭 관리.
* **`src/components/Terminal.jsx`**:
  - **Claude Code**와 **Antigravity CLI** 모드의 가짜 명령어 라우팅 통합 처리.
  - 디버그(`debug`), AI 분석(`ai [task]`), 쉘 프롬프트, 7단계 장기 디버깅 스케줄러 구현.
  - TUI 맞춤형 테두리 분기 렌더링 (Claude: `╔══` 굵은선 / Antigravity: `┌──` 얇은선).
  - 스피너 타이머 해제 레퍼런스(`claudeAiIntervalRef`)를 통한 ESC 중단 제어.
* **`src/components/Editor.jsx`**:
  - 에디터 내 소스 코드 자동 타이핑 효과 렌더러.
  - Vibe(폭풍 코딩) 모드 시 `[HMR]` 문구 위장 안내창(2초 노출 후 페이드아웃) 및 배경 코드 스트리밍.
  - ESC 및 Ctrl+C 포커스 감지를 통한 Vibe 긴급 중단(Abort) 제어.
* **`src/fakeCodeTemplates.js`**:
  - 다국어(영/한) 가상 소스코드 리소스 데이터베이스.
  - 100줄 이상의 가짜 Java Spring Boot 실무 코드 3종 포함 (`PortalApplication.java` 등).
* **`src/index.css`**:
  - 글래스모피즘(반투명 아크릴 블러) 디자인 시스템.
  - 인트로 카드가 영문 텍스트 길이에 맞춰 유연하게 높이를 갖도록 `min-height: 250px` 기반 CSS Grid 구축.

---

## ⌨️ 주요 시뮬레이션 명령어 및 동작
1. **`help` / `/help`**: CLI 명령어 일람 표 출력.
2. **`debug`**: 7단계 기업용 장기 디버깅 시나리오 구동 (약 10분 진행).
3. **`ai [task]`**: AI 분석 분석(`Thinking...`) 및 승인 단계 유도 후 에디터 자동 타이핑 개시.
4. **`vibe`**: 에디터 내 실시간 가짜 코드 폭풍 렌더링 (HMR 위장 팝업).
5. **긴급 중단 (ESC 또는 Ctrl + C)**: AI 분석 중 혹은 Vibe 모드 도중 ESC/Ctrl+C 입력 시, 즉각 프롬프트 대기 쉘로 즉시 탈출.

---

## 🔄 유지보수 & 배포 명령어 (CLI)
```bash
# 1. 의존성 설치 및 로컬 구동
npm install
npm run dev

# 2. 로컬 코드 커밋 및 깃허브 푸시
git add .
git commit -m "feat: 업데이트 내용"
git push origin main

# 3. 정적 빌드 및 GitHub Pages 배포 자동화
npm run deploy
```

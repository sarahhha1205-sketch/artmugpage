# ARTPORT — Art Portfolio

원화, 일러스트, 디자인, 서브컬처 아트를 위한 정적 포트폴리오 웹사이트입니다.

## 특징

- **갤러리형 레이아웃** — 비대칭 그리드로 작품을 돋보이게 표시
- **카테고리 필터** — 원화 / 일러스트 / 디자인 / 서브컬처 분류
- **라이트박스** — 클릭 시 작품 상세 정보 확인
- **반응형** — 모바일·태블릿·데스크톱 대응
- **Netlify Forms** — 문의 폼 내장 (배포 시 자동 작동)
- **빌드 불필요** — 순수 HTML/CSS/JS, 바로 배포 가능

## 로컬 미리보기

```bash
# Python이 설치되어 있다면
cd ARTPORT
python -m http.server 8080
# http://localhost:8080 접속

# 또는 VS Code Live Server 확장 사용
```

## 작품 추가 방법

1. `assets/images/` 폴더에 이미지 파일을 넣습니다.
2. `js/artworks.js` 파일을 열어 작품 정보를 수정합니다.

```javascript
{
  id: 13,
  title: "작품 제목",
  category: "illustration",        // original | illustration | design | subculture
  categoryLabel: "2D 원화",
  description: "작품 설명",
  year: "2025",
  medium: "Digital",
  image: "assets/images/my-art.jpg", // null이면 플레이스홀더 표시
  hue: 200,                          // 플레이스홀더 색상 (0-360)
  layout: "normal"                   // normal | wide | tall | large
}
```

## 커스터마이징

| 파일 | 수정 내용 |
|------|-----------|
| `index.html` | 이름, 소개글, 이메일, SNS 링크 |
| `js/artworks.js` | 작품 목록 |
| `css/style.css` | `:root` 변수로 색상·폰트 변경 |
| `assets/images/` | 작품 이미지 |

### 색상 변경 (`css/style.css`)

```css
:root {
  --accent: #c4a574;   /* 골드 액센트 */
  --bg: #0c0b0a;       /* 배경 */
  --text: #f0ebe3;     /* 본문 */
}
```

## Git & Netlify 배포

### 1. GitHub에 올리기

```bash
cd C:\Users\CHOI-KYUYEON\Desktop\AI\ARTPORT
git init
git add .
git commit -m "Initial commit: art portfolio site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/artport.git
git push -u origin main
```

### 2. Netlify 배포

1. [Netlify](https://app.netlify.com) 로그인
2. **Add new site** → **Import an existing project**
3. GitHub 저장소 연결
4. 빌드 설정 (자동 감지됨):
   - **Build command**: (비워둠)
   - **Publish directory**: `.`
5. **Deploy site** 클릭

### 3. Netlify Forms 설정

배포 후 Netlify 대시보드 → **Forms** 탭에서 문의 폼 제출 내역을 확인할 수 있습니다.
이메일 알림을 받으려면 **Site settings → Forms → Form notifications**에서 설정하세요.

## 프로젝트 구조

```
ARTPORT/
├── index.html          # 메인 페이지
├── success.html        # 폼 제출 완료 페이지
├── netlify.toml        # Netlify 설정
├── css/
│   └── style.css       # 스타일
├── js/
│   ├── artworks.js     # 작품 데이터
│   └── main.js         # 인터랙션
└── assets/
    └── images/         # 작품·프로필 이미지
```

## 라이선스

개인 포트폴리오 용도로 자유롭게 사용하세요.

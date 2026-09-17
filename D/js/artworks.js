/**
 * ARTPORT — Artwork Data
 * 
 * 이미지를 추가하려면:
 * 1. assets/images/ 폴더에 이미지 파일을 넣으세요
 * 2. 아래 image 필드에 경로를 입력하세요 (예: "assets/images/picture-1.jpg")
 * 3. image가 null이면 카테고리별 플레이스홀더가 표시됩니다
 */

const ARTWORKS = [
  {
    id: 1,
    title: "Picture 1",
    category: "original",
    categoryLabel: "2D 원화",
    description: "수채와 아크릴을 혼합한 야경 정원 시리즈. 달빛 아래 피어나는 꽃들의 고요한 순간을 담았습니다.",
    year: "2025",
    medium: "Mixed Media",
    image: null,
    hue: 280,
    layout: "wide"
  },
  {
    id: 2,
    title: "Picture 2",
    category: "illustration",
    categoryLabel: "2D 원화",
    description: "사이버펑크 감성의 캐릭터 일러스트. 네온 조명과 대비되는 어두운 배경으로 분위기를 연출했습니다.",
    year: "2025",
    medium: "Digital",
    image: null,
    hue: 200,
    layout: "normal"
  },
  {
    id: 3,
    title: "Picture 3",
    category: "subculture",
    categoryLabel: "2D 원화",
    description: "봄 벚꽃과 함께하는 캐릭터 아트. 일본풍 판타지 세계관을 바탕으로 한 오리지널 캐릭터입니다.",
    year: "2024",
    medium: "Digital",
    image: null,
    hue: 340,
    layout: "tall"
  },
  {
    id: 4,
    title: "Picture 4",
    category: "design",
    categoryLabel: "2D 원화",
    description: "독립 브랜드 LUNA의 비주얼 아이덴티티 디자인. 로고, 컬러 팔레트, 굿즈 아트를 포함합니다.",
    year: "2025",
    medium: "Design",
    image: null,
    hue: 45,
    layout: "normal"
  },
  {
    id: 5,
    title: "Picture 5",
    category: "original",
    categoryLabel: "2D 원화",
    description: "숲 속을 거니는 여행자. 자연광과 그림자의 대비를 살린 풍경 원화 작업입니다.",
    year: "2024",
    medium: "Oil on Canvas",
    image: null,
    hue: 140,
    layout: "normal"
  },
  {
    id: 6,
    title: "Picture 6",
    category: "subculture",
    categoryLabel: "2D 원화",
    description: "메카닉과 파일럿 캐릭터 디자인. SF 액션 장르에 맞는 역동적인 포즈와 기계 디테일.",
    year: "2025",
    medium: "Digital",
    image: null,
    hue: 220,
    layout: "large"
  },
  {
    id: 7,
    title: "Picture 7",
    category: "illustration",
    categoryLabel: "2D 원화",
    description: "따뜻한 카페 분위기의 일상 일러스트. 소품과 인물의 자연스러운 상호작용에 초점을 맞췄습니다.",
    year: "2024",
    medium: "Digital",
    image: null,
    hue: 30,
    layout: "normal"
  },
  {
    id: 8,
    title: "Picture 8",
    category: "design",
    categoryLabel: "2D 원화",
    description: "인디 뮤지션을 위한 앨범 커버 아트. 음악의 분위기를 시각적으로 번역한 작업입니다.",
    year: "2025",
    medium: "Digital Design",
    image: null,
    hue: 260,
    layout: "wide"
  },
  {
    id: 9,
    title: "Picture 9",
    category: "subculture",
    categoryLabel: "2D 원화",
    description: "판타지 세계의 용과 기사. 에픽한 스케일감과 디테일한 배경 연출.",
    year: "2024",
    medium: "Digital",
    image: null,
    hue: 15,
    layout: "normal"
  },
  {
    id: 10,
    title: "Picture 10",
    category: "original",
    categoryLabel: "2D 원화",
    description: "인물 드로잉 스터디 시리즈. 빛과 그림자, 피부 톤 표현에 집중한 작업입니다.",
    year: "2025",
    medium: "Charcoal & Pastel",
    image: null,
    hue: 25,
    layout: "normal"
  },
  {
    id: 11,
    title: "Picture 11",
    category: "design",
    categoryLabel: "2D 원화",
    description: "치비 캐릭터 스티커 팩 디자인. 12종의 표정과 포즈로 구성된 굿즈 아트.",
    year: "2025",
    medium: "Digital Design",
    image: null,
    hue: 320,
    layout: "normal"
  },
  {
    id: 12,
    title: "Picture 12",
    category: "illustration",
    categoryLabel: "2D 원화",
    description: "심해를 탐험하는 다이버와 바다 생물들. 푸른 그라데이션과 빛의 굴절 표현.",
    year: "2024",
    medium: "Digital",
    image: null,
    hue: 190,
    layout: "large"
  }
];

const CATEGORY_LABEL = "2D 원화";

# node-labeling-mgmt

k8s node managent web application

## 🚀 빠른 시작

### 개발 환경 실행
```bash
# 개발 서버 시작
./scripts/dev.sh

# 또는 수동으로
cd frontend
npm install
npm run dev
```

### Docker 빌드 및 실행
```bash
cd frontend
docker build -f Dockerfile.frontend -t node-labeling-mgmt-frontend .
docker run -p 8080:80 node-labeling-mgmt-frontend
```

### Kubernetes 배포
```bash
# 자동 배포 스크립트 사용
./scripts/deploy.sh

# 또는 수동 Helm 배포
helm install node-labeling-app helm/node-labeling-app \
  --namespace node-labeling \
  --create-namespace
```

## 📁 프로젝트 구조

```
node-labeling-mgmt/
├── frontend/              # React 애플리케이션
│   ├── src/              # 소스 코드
│   ├── public/           # 정적 파일
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── helm/                 # Helm 차트
│   └── node-labeling-app/
└── scripts/              # 배포 스크립트
    ├── deploy.sh
    └── dev.sh
```

## 🛠️ 개발 가이드

### 사용 기술
- **Frontend**: React 18, Tailwind CSS, Vite
- **Build**: Docker, Nginx
- **Deploy**: Kubernetes, Helm

### 주요 명령어
```bash
# 개발
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # 코드 검사

# Docker
npm run docker:build # 이미지 빌드
npm run docker:run   # 컨테이너 실행

# 배포
./scripts/deploy.sh  # K8s 배포
```

## 📝 설정

### 환경 변수
- `REGISTRY_URL`: riverjin839/node-labeling-mgmt
- `PROJECT_NAME`: node-labeling-mgmt

### 접속 정보
- **개발**: http://localhost:3000
- **프로덕션**: http://node-labeling.local

## 👥 기여

1. Fork 프로젝트
2. Feature 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

## 📄 라이선스

MIT License

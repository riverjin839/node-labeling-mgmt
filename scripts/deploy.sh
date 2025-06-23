#!/bin/bash
set -e

# 환경 변수 설정
IMAGE_NAME="riverjin839/node-labeling-mgmt/node-labeling-mgmt-frontend"
VERSION=${1:-"1.0.0"}
NAMESPACE="node-labeling"

echo "🚀 node-labeling-mgmt Frontend 배포 시작..."

# 1. Frontend 빌드
echo "📦 Frontend 빌드 중..."
cd frontend
npm run build

# 2. Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."
docker build -f Dockerfile.frontend -t $IMAGE_NAME:$VERSION .

# 3. 네임스페이스 생성 (존재하지 않는 경우)
echo "🔧 네임스페이스 확인 중..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 4. Helm 배포
echo "⚓ Helm으로 배포 중..."
cd ..
helm upgrade --install node-labeling-app helm/node-labeling-app \
    --namespace $NAMESPACE \
    --set frontend.image.repository=$IMAGE_NAME \
    --set frontend.image.tag=$VERSION \
    --wait --timeout=300s

# 5. 배포 상태 확인
echo "✅ 배포 상태 확인 중..."
kubectl get pods -n $NAMESPACE
kubectl get svc -n $NAMESPACE

echo "🎉 배포 완료!"
echo "애플리케이션 URL: http://node-labeling.local (Ingress 설정 시)"

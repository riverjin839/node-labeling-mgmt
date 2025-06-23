#!/bin/bash

echo "🚀 개발 환경 시작..."

# Frontend 의존성 설치 (한 번만)
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 의존성 설치 중..."
    cd frontend
    npm install
    cd ..
fi

# 개발 서버 시작
echo "🖥️ 개발 서버 시작 중..."
cd frontend
npm run dev

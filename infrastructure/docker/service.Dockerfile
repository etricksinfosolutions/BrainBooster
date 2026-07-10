# Reusable image for any BrainBooster Node service/agent.
# Build with:  docker build -f infrastructure/docker/service.Dockerfile --build-arg SERVICE_DIR=services/leaderboard-service -t bb-leaderboard .
FROM node:20-alpine
ARG SERVICE_DIR
WORKDIR /app
# Copy the whole repo (services import ../../agents and ../../packages/shared).
COPY packages ./packages
COPY agents ./agents
COPY ${SERVICE_DIR} ./service
WORKDIR /app/service
RUN npm install --omit=dev --no-audit --no-fund
ENV NODE_ENV=production
CMD ["npm", "start"]

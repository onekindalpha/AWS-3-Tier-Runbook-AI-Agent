FROM node:20-slim AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public

ENV VITE_BASE_PATH=/
ENV VITE_RAG_API_BASE=
RUN npm run build


FROM python:3.11-slim

RUN useradd -m -u 1000 user

WORKDIR /home/user/app

COPY --chown=user backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

COPY --chown=user backend ./backend
COPY --chown=user docs ./docs
COPY --chown=user --from=frontend /app/dist ./dist

RUN mkdir -p ./backend/logs ./backend/data && chown -R user:user ./backend ./docs ./dist

USER user

ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH

EXPOSE 7860

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "7860"]

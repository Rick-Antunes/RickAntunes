# Portfolio — Guia de uso

## Estrutura
```
portfolio/
├── index.html       ← frontend principal
├── style.css        ← estilos (violeta ↔ branco)
├── main.js          ← lógica: tema, clima, contador, carrosseis
├── app.py           ← backend Flask + SQLite (contador de visitas)
├── requirements.txt ← dependências Python
└── visitors.db      ← banco gerado automaticamente ao rodar o backend
```

---

## Rodar o backend

```bash
# 1 — instalar dependências
pip install -r requirements.txt

# 2 — iniciar o servidor
uvicorn app:app --reload --port 8000
# Rodando em http://localhost:8000
```

Documentação automática disponível em:
- Swagger UI → http://localhost:8000/docs
- ReDoc      → http://localhost:8000/redoc

O arquivo `visitors.db` é criado automaticamente na primeira execução.

---

## Clima
Usa a API **Open-Meteo** (gratuita, sem chave).  

# wormpack

1. Create folder structure - wormpack -> backend and frontend

2. To setup backend
cd backend
* python3 -m venv wp-env
* source wp-env/bin/activate
* pip install fastapi uvicorn anthropic python-dotenv

4. Created .env file to add API key
touch .env
<ADD API keys>
* echo ".env" >> .gitignore
* echo "wp-env/" >> .gitignore

5. Create main file
mkfile main.py

6. To run backend app
* uvicorn main:app --reload --port 8000

7. Test from without UI
http://localhost:8000/docs#/default/chat_api_chat_post

8. To set frontend
* npm create vite@latest frontend -- --template react
* npm install
* npm fund

9. Update frontend jsx file
* Run - cd frontend
* npm run dev

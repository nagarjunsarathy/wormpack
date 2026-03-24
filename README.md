# wormpack

1. Create folder structure - wormpack -> backend and frontend
2. cd backend
  python3 -m venv wp-env
  source wp-env/bin/activate
  pip install fastapi uvicorn anthropic python-dotenv

3. Created .env file to add API key
touch .env
<ADD API keys>
echo ".env" >> .gitignore
echo "wp-env/" >> .gitignore

4. Create main file
mkfile main.py

5. To run app
uvicorn main:app --reload --port 8000

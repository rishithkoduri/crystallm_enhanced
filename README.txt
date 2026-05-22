===========================================================================================================

Step 1: Open a NEW terminal in crystallm_training_autoregressive\src:

Install:
pip install -r requirements.txt

Run:
uvicorn api:app --host 127.0.0.1 --port 8000

(Keep this terminal open)

===========================================================================================================

Step 2: Open a NEW terminal in crystallm-backend:

Install:
npm install
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon

Run:
npx nodemon server.js

(Keep this terminal open)

===========================================================================================================

Step 3: Open a NEW terminal in crystallm-frontend:

Install:
npm install
npm install react-router-dom lucide-react gsap @gsap/react react-avatar-editor

Run:
npm run dev

(Keep this terminal open)

(Ctrl+C) + (Click the link it gives you (usually http://localhost:5173) to open CrystaLLM in your browser!)

===========================================================================================================
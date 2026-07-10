# CrystaLLM Enhanced: AI-Powered Crystal Structure Generation 🚀

![GitHub Stars](https://img.shields.io/github/stars/rishithkoduri/crystallm_enhanced?style=social) ![GitHub Forks](https://img.shields.io/github/forks/rishithkoduri/crystallm_enhanced?style=social)

CrystaLLM Enhanced is a sophisticated application that leverages the power of Large Language Models (LLMs) and advanced computational methods to predict and generate stable crystal structures. It aims to accelerate materials discovery by bypassing traditional, computationally intensive physics-based simulations.

## ✨ Key Features

*   **AI-Powered Generation:** Utilizes autoregressive LLMs trained on vast material databases to predict crystal structures.
*   **Fast Structure Prediction:** Generates stable crystal structures in milliseconds, significantly faster than traditional methods.
*   **Physics-Informed MCTS:** Employs Monte Carlo Tree Search (MCTS) integrated with ALIGNN (a physics-based energy predictor) for robust structure validation.
*   **Interactive 3D Visualization:** Allows users to explore generated crystal structures in an interactive 3D viewer.
*   **Dynamic Prompting:** Adapts generation based on user-provided chemical formulas, target energies, space groups, and formula units (Z).
*   **User Authentication:** Secure user registration and login system with profile management.
*   **Generation History:** Stores and displays a history of all generated crystal structures.
*   **Local CIF Import:** Enables users to upload and visualize their own CIF files.
*   **Modern Frontend:** Built with React and Vite, featuring a responsive and dynamic user interface with Tailwind CSS.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, JavaScript, CSS, HTML, Tailwind CSS, GSAP, Framer Motion, Lucide React
*   **Backend:** Node.js, Express, Mongoose, Bcrypt.js, JSON Web Token (JWT)
*   **AI/ML Backend:** Python, FastAPI, PyTorch, Transformers, Hugging Face, Gradio, Py3Dmol, pymatgen, ALIGNN, SciPy, NumPy
*   **Database:** MongoDB Atlas
*   **Development Tools:** ESLint, Prettier, Nodemon

## 🚀 Installation & Setup

To run CrystaLLM Enhanced locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rishithkoduri/crystallm_enhanced.git
    cd crystallm_enhanced
    ```

2.  **Set up the Backend (Node.js/Express):**
    *   Navigate to the backend directory:
        ```bash
        cd crystallm-backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `crystallm-backend` directory with your MongoDB connection string and JWT secret:
        ```dotenv
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        PORT=5000
        ```
    *   Start the backend server in development mode:
        ```bash
        npx nodemon server.js
        ```

3.  **Set up the AI Backend (Python/FastAPI):**
    *   Navigate to the AI backend directory:
        ```bash
        cd ../crystallm_training_autoregressive/src
        ```
    *   Create a virtual environment (recommended):
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows use `venv\Scripts\activate`
        ```
    *   Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Ensure the model and tokenizer paths in `crystallm_training_autoregressive/src/api.py` and `crystallm_training_autoregressive/src/mcts_decoder.py` are correctly set to your local model paths (e.g., `D:\CrystaLLM\...`).
    *   Start the AI backend server:
        ```bash
        uvicorn api:app --host 127.0.0.1 --port 8000
        ```

4.  **Set up the Frontend (React/Vite):**
    *   Navigate to the frontend directory:
        ```bash
        cd ../../crystallm-frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```

5.  **Access the Application:**
    Open your browser and navigate to the address provided by the frontend server (usually `http://localhost:5173`).

## 💡 Usage

CrystaLLM Enhanced provides a user-friendly interface for generating and exploring crystal structures:

1.  **Authentication:**
    *   On the landing page, click "Sign In" to access the login/registration portal.
    *   Register a new account or log in with existing credentials.

2.  **Crystal Generation:**
    *   Navigate to the "Generate" page.
    *   Input desired parameters:
        *   **Chemical Composition:** (e.g., `Au2O3`)
        *   **Target Formation Energy:** (e.g., `-2.0` eV/atom)
        *   **Space Group Symmetry:** (e.g., `Fm-3m`)
        *   **Formula Units (Z):** (e.g., `4`)
    *   Leave fields blank to let the AI explore and optimize parameters.
    *   Click "Initialize Sequence" to start the generation process.

3.  **View Results:**
    *   The "Result" page will display the generated crystal structure:
        *   An interactive 3D viewer to explore the atomic arrangement.
        *   The exact prompt sent to the LLM.
        *   Extracted CIF analytics (lattice parameters, space group, etc.).
        *   The raw CIF output, with options to copy or download.
    *   You can also upload local `.cif` files for visualization.

4.  **History & Settings:**
    *   Access your "History" to view, reload, or delete past generations.
    *   Visit "Settings" to manage your profile, change your avatar, or delete your account.

## 📚 Project Structure

```
. 
├── crystallm-backend/             # Node.js backend for user authentication and history management
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── crystallm-frontend/          # React frontend for user interaction and visualization
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   └── tailwind.config.js
└── crystallm_training_autoregressive/ # Python backend for AI model inference and training
    ├── data/
    │   ├── models/             # Trained LLM and ALIGNN models
    │   └── tokenizer/          # Custom tokenizer files
    ├── src/
    │   ├── api.py              # FastAPI application for inference
    │   ├── mcts_decoder.py     # Core MCTS logic with ALIGNN integration
    │   ├── ar_dataset.py       # Dataset loading for LLM training
    │   ├── train_autoregressive.py # Script for training the LLM
    │   ├── train_tokenizer.py  # Script for training the custom tokenizer
    │   ├── thesis_data_extractor.py # Script to fetch and preprocess training data
    │   ├── evaluate_metrics.py # Script for evaluating model performance
    │   └── app.py              # Gradio interface for the autoregressive model
    ├── requirements.txt
    └── README.txt               # Basic setup instructions
```

## 📚 API Reference (Python Backend)

This section outlines the primary API endpoints exposed by the FastAPI backend:

*   **`POST /predict`**
    *   **Description:** Generates a crystal structure using the LLM and MCTS-ALIGNN pipeline.
    *   **Request Body:**
        ```json
        {
          "formula": "string",          // Optional: Chemical formula (e.g., "Au2O3")
          "targetEnergy": "string",     // Optional: Target formation energy (e.g., "-2.0")
          "spaceGroup": "string",       // Optional: Target space group (e.g., "Fm-3m")
          "z": "string",                // Optional: Target formula units per cell (e.g., "4")
          "simulations": integer        // Optional: Number of simulations (default: 10)
        }
        ```
    *   **Response Body (Success):**
        ```json
        {
          "status": "success",
          "cifData": "string",          // The generated CIF data
          "energy": "string",           // Predicted formation energy per atom
          "prompt": "string"            // The prompt used for generation
        }
        ```
    *   **Response Body (Error):**
        ```json
        {
          "detail": "string"            // Error message describing the failure
        }
        ```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature (`git checkout -b feature/YourFeature`).
3.  Make your changes and commit them (`git commit -am 'Add YourFeature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes relevant tests.

## 📄 License

This project is not associated with a specific license.

## 🔗 Important Links

*   **Live Demo:** (Not available)
*   **Author Profile:** [rishithkoduri](https://github.com/rishithkoduri)

## :copyright: Footer

**CrystaLLM Enhanced** | Hosted on [GitHub](https://github.com/rishithkoduri/crystallm_enhanced)

Made with ❤️ by [rishithkoduri](https://github.com/rishithkoduri)

Feel free to **star ⭐**, **fork 🍴**, and **watch** this repository for updates! If you encounter any issues or have suggestions, please open an **issue**.


---

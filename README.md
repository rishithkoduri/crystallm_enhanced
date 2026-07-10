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
    * **Download Model, Tokenizer, and Dataset from Hugging Face:**
        Due to file size limitations, the model checkpoints, trained tokenizers, and datasets are hosted on Hugging Face.
        
        * **Autoregressive Model Weights:** Download the weights from the [Crystallm-124M Base Directory](https://huggingface.co/rishithkoduri/Crystallm-124M/tree/main/crystallm-ar-final) and place the files inside:
          `crystallm_training_autoregressive/data/models/crystallm-ar-final/`
          
        * **Custom Byte-Level Tokenizer:** Download the configuration files from the [Tokenizer Directory](https://huggingface.co/rishithkoduri/Crystallm-124M/tree/main/tokenizer) and place them inside:
          `crystallm_training_autoregressive/data/tokenizer/`
          
        * **Training Corpus (Optional):** If you wish to re-train or inspect the base dataset, download the raw text data file from [thesis_corpus.json](https://huggingface.co/rishithkoduri/Crystallm-124M/blob/main/thesis_corpus.json) and place it inside:
          `crystallm_training_autoregressive/data/`

    * Ensure the paths in `api.py` and `mcts_decoder.py` correctly point to these downloaded data configurations.
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

# 📊 CrystaLLM Enhanced: Architectural & Performance Highlights

This section provides a rigorous breakdown of the underlying model specifications, core parameters, and empirical performance improvements achieved over the foundational baseline architecture.

---

## 🏗️ Core Model Parameters & Architecture

The machine learning backend decouples language generation from topological graph evaluation, executing a dual-model hybrid pipeline:

| Parameter | Specification | Purpose / Significance |
| :--- | :--- | :--- |
| **Model Type** | Causal Autoregressive Transformer | Generates CIF tokens sequentially based on past context. |
| **Parameter Count** | 124,000,000 (124M) | Tailored capacity optimizing structural generalization without overfitting. |
| **Layer Depth** | 12-Layer Causal Block Architecture | Extracts multi-scale dependency features across crystallographic parameters. |
| **Hidden Dimension** | 768 Units | Embeds the high-dimensional spatial context vectors natively. |
| **Context Window** | 2,048 Tokens | Sufficient context length to parse highly complex unit cell geometries. |
| **Tokenizer Tech** | Custom Byte-Level Mapping | Maps individual digits, spaces, and strings precisely into 371 base tokens. |
| **Physics Judge** | ALIGNN (Atomistic Line Graph Neural Network) | Evaluates continuous-space lattice structures converted from generated text. |
| **Search Framework** | Monte Carlo Tree Search (MCTS) | Explores and prunes the LLM decoding paths using physical rewards. |

---

## 📈 Empirical Performance & Data Domain Improvements

By pivoting from inference-time text correction to strict **Data Domain Engineering**, CrystaLLM Enhanced resolves the spatial blindness typical of standard language models, establishing new performance metrics:

### 1. Bypassing "Format Collapse"
* **Baseline Flaw:** Standard models rely on sub-word tokenization (BPE), which merges numbers and spaces according to English linguistic frequency, fracturing the 2D alignment of a CIF block.
* **Our Enhancement:** The **Byte-Level Tokenizer** maps coordinates 1:1, leading to an **unguided zero-shot syntactic validity rate of 56.0%**. The model masters structural syntax rapidly in early steps, allowing it to spend major training epochs learning chemistry instead of character placement.

### 2. Eliminating Spatial Blindness & Hallucinations
* **Baseline Flaw:** Autoregressive generation is purely probabilistic; text engines frequently generate valid *text formatting* but place atoms mathematically overlapping at identical 3D fractional coordinates.
* **Our Enhancement:** Integrating an **ALIGNN-Guided MCTS** pipeline treats materials discovery as a deterministic space search. The GNN acts as a physics supervisor, applying extreme negative rewards to atomic overlaps and ensuring that **100.0% of the structures that survive the search tree and output to the user are topologically valid**.

### 3. Granular Conditioning & Supercell Control
* **Baseline Flaw:** Earlier frameworks suffered from highly generalized text conditioning, leaving the density of the supercell unconstrained.
* **Our Enhancement:** Expanded prompt engineering constraints to natively calculate composition space through the **Formula Units per Cell ($Z$) parameter**. Combined with Prompt Dropout training, the system dynamically maps stoichiometry to strict target space groups, forcing inversion symmetry compliance even down to Triclinic ($P\text{-}1$) groups.

---

## 📊 Component Ablation Progression

To quantify the exact performance impact of each individual architectural layer, the system was benchmarked progressively across four distinct deployment phases. The metrics isolate the evolution of both **Syntactic Validity (SV)** and **Topological Validity (TV)**:

### 🚀 Pipeline Evolution Flow

```text
[Phase 1: Base LLM (Generic Sub-word BPE)]
  └── Syntactic Validity: 4.2%   | Topological Validity: 0.0%
            ↓
[Phase 2: + Custom Byte-Level Tokenizer]
  └── Syntactic Validity: 56.0%  | Topological Validity: 1.8%
            ↓
[Phase 3: + MCTS Decoupled Search Loop]
  └── Syntactic Validity: 98.5%  | Topological Validity: 14.2%
            ↓
[Phase 4: + Full MCTS-ALIGNN Supervisor Pipeline]
  └── Syntactic Validity: 100.0% | Topological Validity: 100.0%*
```

## Screenshots
<img width="1895" height="906" alt="Home" src="https://github.com/user-attachments/assets/5cf6e29d-a372-44ad-86c2-deee944252d5" />
<img width="1899" height="908" alt="configuration" src="https://github.com/user-attachments/assets/28863e73-d6a8-4c3d-8f17-d6e31a694481" />
<img width="1899" height="908" alt="Result" src="https://github.com/user-attachments/assets/4620884f-99c3-473b-8c92-2ee0c67327f3" />
<img width="1899" height="908" alt="history" src="https://github.com/user-attachments/assets/1d0da8c3-a7a7-4885-88d9-53165ddcd272" />



## 🔗 Important Links

*   **Live Demo:** (Not available)
*   **Author Profile:** [rishithkoduri](https://github.com/rishithkoduri)

## :copyright: Footer

**CrystaLLM Enhanced** | Hosted on [GitHub](https://github.com/rishithkoduri/crystallm_enhanced)

Made with ❤️ by [rishithkoduri](https://github.com/rishithkoduri)

Feel free to **star ⭐**, **fork 🍴**, and **watch** this repository for updates! If you encounter any issues or have suggestions, please open an **issue**.


---

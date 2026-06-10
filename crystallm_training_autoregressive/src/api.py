import os
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- THE WINDOWS BYPASS HACK ---
original_remove = os.remove

def safe_remove(path, *args, **kwargs):
    try:
        original_remove(path, *args, **kwargs)
    except PermissionError:
        print(f"⚠️ Ignored Windows file-lock bug on: {path}")

os.remove = safe_remove
# -------------------------------

from mcts_decoder import CrystaLLMMCTS

app = FastAPI(title="CrystaLLM Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing Server: Loading LLM and ALIGNN into VRAM...")
engine = CrystaLLMMCTS(
    llm_path=r"D:\CrystaLLM\crystallm_training_autoregressive\data\models\crystallm-ar-final",
    tokenizer_path=r"D:\CrystaLLM\crystallm_training_autoregressive\data\tokenizer"
)

class GenerationRequest(BaseModel):
    formula: str
    targetEnergy: str = ""
    spaceGroup: str = ""
    z: str = "" # NEW Z PARAMETER
    simulations: int = 10

@app.post("/predict")
def generate_crystal(req: GenerationRequest):
    try:
        # Dynamic Prompt Construction
        context_lines = []
        
        if req.formula:
            context_lines.append(f"- The material {req.formula} is a stable crystal structure.")
        if req.targetEnergy:
            context_lines.append(f"- The formation energy is {float(req.targetEnergy):.4f} eV/atom.")
        if req.spaceGroup:
            context_lines.append(f"- The space group symmetry is {req.spaceGroup}.")
        if req.z:
            context_lines.append(f"- The number of formula units per cell (Z) is {req.z}.")

        # Assemble the final context and task based on provided variables
        if context_lines:
            context = "\n".join(context_lines)
            formula_text = f" for {req.formula}" if req.formula else ""
            task = f"Based on the context above, generate a valid CIF structure{formula_text}."
        else:
            context = "- No specific conditions provided."
            task = "Invent a completely novel, stable crystal structure."

        prompt = f"[CONTEXT]\n{context}\n\n[TASK]\n{task}\n\n[CIF START]\n"

        best_cif, best_energy_label = engine.generate_guided(prompt, num_simulations=req.simulations)

        if not best_cif:
            raise HTTPException(status_code=500, detail="MCTS failed to find a physically stable topology. Try increasing simulations.")

        return {
            "status": "success",
            "cifData": best_cif,
            "energy": best_energy_label,
            "prompt": prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
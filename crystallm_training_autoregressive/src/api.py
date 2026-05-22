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
    simulations: int = 10

@app.post("/predict")
def generate_crystal(req: GenerationRequest):
    try:
        # ✨ MASTER CONDITION: All three are provided
        if req.formula and req.targetEnergy and req.spaceGroup:
            context = f"- The material {req.formula} is a stable crystal structure.\n- The formation energy is {float(req.targetEnergy):.4f} eV/atom.\n- The space group symmetry is {req.spaceGroup}."
            task = f"Based on the context above, generate a valid CIF structure for {req.formula}."
            
        elif req.formula and req.targetEnergy:
            context = f"- The material {req.formula} is a stable crystal structure.\n- The formation energy is {float(req.targetEnergy):.4f} eV/atom."
            task = f"Based on the context above, generate a valid CIF structure for:\n{req.formula}"
            
        elif req.formula and req.spaceGroup:
            context = f"- The target space group symmetry is {req.spaceGroup}.\n- The material composition is {req.formula}."
            task = f"Generate a valid CIF structure for {req.formula} with {req.spaceGroup} symmetry."
            
        elif req.formula:
            context = f"- The material {req.formula} is a stable crystal structure."
            task = f"Based on the context above, generate a valid CIF structure for:\n{req.formula}"
            
        elif req.targetEnergy:
            context = f"- The target formation energy is {float(req.targetEnergy):.4f} eV/atom."
            task = "Generate a valid CIF structure that matches this target energy."
            
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
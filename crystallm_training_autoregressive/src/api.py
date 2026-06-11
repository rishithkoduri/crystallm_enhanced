import os
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  
import sys
import re
import gc       
import torch    
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
    z: str = "" 
    simulations: int = 10

@app.post("/predict")
def generate_crystal(req: GenerationRequest):
    try:
        context_lines = []
        if req.formula:
            context_lines.append(f"- The material {req.formula} is a stable crystal structure.")
        if req.targetEnergy:
            context_lines.append(f"- The formation energy is {float(req.targetEnergy):.4f} eV/atom.")
        if req.spaceGroup:
            context_lines.append(f"- The space group symmetry is {req.spaceGroup}.")
        if req.z:
            context_lines.append(f"- The number of formula units per cell (Z) is {req.z}.")

        if context_lines:
            context = "\n".join(context_lines)
            formula_text = f" for {req.formula}" if req.formula else ""
            task = f"Based on the context above, generate a valid CIF structure{formula_text}."
        else:
            context = "- No specific conditions provided."
            task = "Invent a completely novel, stable crystal structure."

        prompt = f"[CONTEXT]\n{context}\n\n[TASK]\n{task}\n\n[CIF START]\n"

        max_retries = 3
        final_cif = None
        final_energy = None
        last_generated_z = None
        
        # 🚨 ADDED: Pass the formula down for beautiful terminal printing!
        display_name = req.formula if req.formula else "Novel Material"
        
        for attempt in range(max_retries):
            print(f"\n🔄 Generation Attempt {attempt + 1}/{max_retries} for {display_name}...")
            cif, energy = engine.generate_guided(prompt, num_simulations=req.simulations, material_name=display_name)
            
            if not cif: continue
            
            if req.z:
                z_match = re.search(r'_cell_formula_units_Z\s+(\d+)', cif)
                if z_match:
                    generated_z = z_match.group(1)
                    last_generated_z = generated_z
                    if generated_z == str(req.z):
                        print(f"✅ Success! Physics stabilized at target Z={req.z}")
                        final_cif = cif
                        final_energy = energy
                        break
                    else:
                        print(f"⚠️ Failed constraint: Engine generated Z={generated_z}. Retrying...")
                        continue
            else:
                final_cif = cif
                final_energy = energy
                break
                
        if not final_cif:
            if req.z and last_generated_z:
                 raise HTTPException(status_code=400, detail=f"Target Z={req.z} failed. The physics engine repeatedly stabilized at Z={last_generated_z} instead. Try a different composition.")
            else:
                 raise HTTPException(status_code=500, detail="MCTS failed to find a physically stable topology. Try increasing simulations.")

        return {
            "status": "success",
            "cifData": final_cif,
            "energy": final_energy,
            "prompt": prompt
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            print("🧹 VRAM Cache Cleared.")
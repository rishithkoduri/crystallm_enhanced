import os
import json
import random
from mp_api.client import MPRester
import warnings

warnings.filterwarnings("ignore")

def fetch_ar_corpus(api_key, num_materials=40000, save_path="data/thesis_corpus.json"):
    print(f"--- INITIATING DYNAMIC AUTOREGRESSIVE DATA EXTRACTION ({num_materials} Max) ---")
    extracted_data = []

    try:
        with MPRester(api_key) as mpr:
            docs = mpr.materials.summary.search(
                is_stable=True,
                fields=["material_id", "structure", "formation_energy_per_atom", "formula_pretty", "symmetry"]
            )
            
            print(f"Found {len(docs)} stable materials. Extracting with Prompt Dropout...")

            for i, doc in enumerate(docs):
                if i >= num_materials: break

                try:
                    raw_cif = doc.structure.to(fmt="cif")
                    formula = doc.formula_pretty
                    energy = f"{doc.formation_energy_per_atom:.4f}"
                    space_group = doc.symmetry.symbol

                    # 🚨 THE FIX: Randomly select a prompt style so the AI learns to be dynamic
                    prompt_style = random.choice(["full", "formula_only", "energy_only", "unconditioned", "space_group"])

                    if prompt_style == "full":
                        context = f"- The material {formula} is a stable crystal structure.\n- The formation energy is {energy} eV/atom."
                        task = f"Based on the context above, generate a valid CIF structure for:\n{formula}"
                        
                    elif prompt_style == "formula_only":
                        context = f"- The material {formula} is a stable crystal structure."
                        task = f"Generate a valid CIF structure for:\n{formula}"
                        
                    elif prompt_style == "energy_only":
                        context = f"- The target formation energy is {energy} eV/atom."
                        task = "Generate a valid CIF structure that matches this target energy."
                        
                    elif prompt_style == "space_group":
                        context = f"- The target space group symmetry is {space_group}.\n- The material composition is {formula}."
                        task = f"Generate a valid CIF structure for {formula} with {space_group} symmetry."
                        
                    elif prompt_style == "unconditioned":
                        context = "- No specific conditions provided."
                        task = "Invent a completely novel, stable crystal structure."

                    # Build the final string
                    instruction_prompt = f"[CONTEXT]\n{context}\n\n[TASK]\n{task}\n\n[CIF START]\n{raw_cif}"

                    extracted_data.append({"cif_text": instruction_prompt})

                except Exception:
                    continue

        with open(save_path, 'w') as f:
            json.dump(extracted_data, f, indent=4)
        print(f"✅ SUCCESS! Dynamic Corpus saved to {save_path} with {len(extracted_data)} materials.")

    except Exception as e:
        print(f"❌ API ERROR: {e}")

if __name__ == "__main__":
    my_api_key = os.environ.get("MP_API_KEY")
    fetch_ar_corpus(my_api_key)

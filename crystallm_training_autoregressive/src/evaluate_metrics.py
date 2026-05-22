import os
import json
import torch
import warnings
import numpy as np
from tqdm import tqdm
from transformers import AutoModelForCausalLM, AutoTokenizer
from pymatgen.io.cif import CifParser
from pymatgen.analysis.structure_matcher import StructureMatcher
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
from pymatgen.analysis.local_env import VoronoiNN

warnings.filterwarnings("ignore")

# --- ADVANCED PHYSICS VALIDATION PIPELINE ---

def extract_declared_space_group(cif_string):
    """Extracts the space group the LLM claimed it was generating."""
    for line in cif_string.split('\n'):
        if '_symmetry_space_group_name_H-M' in line:
            return line.split("'")[1] if "'" in line else line.split()[1]
    return None

def check_space_group_consistency(structure, declared_sg):
    """Test 1: Does the physical 3D geometry match the LLM's declared space group?"""
    if not declared_sg: return False
    try:
        analyzer = SpacegroupAnalyzer(structure, symprec=0.1)
        actual_sg = analyzer.get_space_group_symbol()
        # Basic string matching (handling minor formatting differences)
        return actual_sg.replace(" ", "") == declared_sg.replace(" ", "")
    except Exception:
        return False

def check_bond_length_reasonableness(structure, tolerance=0.30):
    """Test 2 & 3: Voronoi Nearest-Neighbor Bond Check (30% Tolerance rule)"""
    try:
        vnn = VoronoiNN(tol=0.1)
        for i, site in enumerate(structure):
            neighbors = vnn.get_nn_info(structure, i)
            element_i = site.specie
            
            for neighbor in neighbors:
                site_j = neighbor['site']
                element_j = site_j.specie
                actual_distance = site.distance(site_j)
                
                # Calculate expected distance based on atomic radii
                rad_i = element_i.atomic_radius if element_i.atomic_radius else 1.0
                rad_j = element_j.atomic_radius if element_j.atomic_radius else 1.0
                expected_distance = rad_i + rad_j
                
                # If distance deviates by more than 30%, it violates physics
                if abs(actual_distance - expected_distance) / expected_distance > tolerance:
                    return False
        return True
    except Exception:
        return False

# --- MAIN EVALUATION LOOP ---

def evaluate_crystallm_advanced(num_samples=100):
    print(f"--- 🧪 INITIATING RIGOROUS PHYSICS EVALUATION ({num_samples} Samples) ---")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained("data/tokenizer")
    model = AutoModelForCausalLM.from_pretrained("data/models/crystallm-ar-final").to(device)
    model.eval()

    prompt = "[CONTEXT]\n- No specific conditions provided.\n\n[TASK]\nInvent a completely novel, stable crystal structure.\n\n[CIF START]\n"
    input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)

    generated_cifs = []
    print(f"1. Generating {num_samples} Unconditioned Structures...")
    with torch.no_grad():
        for _ in tqdm(range(num_samples)):
            output_ids = model.generate(
                input_ids, max_length=1024, temperature=0.8, do_sample=True,
                eos_token_id=tokenizer.eos_token_id, pad_token_id=tokenizer.eos_token_id,
            )
            text = tokenizer.decode(output_ids[0], skip_special_tokens=False)
            try:
                cif_str = text.split("[CIF START]")[1].split("[CIF END]")[0].strip()
                generated_cifs.append(cif_str)
            except IndexError:
                continue 

    print("\n2. Applying Multi-Tier Validation Pipeline...")
    valid_structures = []
    
    for cif in tqdm(generated_cifs, desc="Verifying Physics"):
        try:
            # Base Syntax Check
            parser = CifParser.from_string(cif)
            structure = parser.get_structures(primitive=True)[0]
            
            # Tier 1: Space Group Consistency
            declared_sg = extract_declared_space_group(cif)
            if not check_space_group_consistency(structure, declared_sg):
                continue
                
            # Tier 2: Voronoi Bond Length Check
            if not check_bond_length_reasonableness(structure):
                continue
                
            valid_structures.append(structure)
        except Exception:
            pass 

    validity_rate = (len(valid_structures) / num_samples) * 100
    print(f"   -> Strict Validity Rate: {validity_rate:.1f}% ({len(valid_structures)}/{num_samples})")

    if not valid_structures:
        print("No strictly valid structures generated. Consider tuning temperature.")
        return

    print("\n3. Calculating Uniqueness...")
    matcher = StructureMatcher()
    unique_clusters = matcher.group_structures(valid_structures)
    unique_structures = [cluster[0] for cluster in unique_clusters]
    
    uniqueness_rate = (len(unique_structures) / len(valid_structures)) * 100
    print(f"   -> Uniqueness Rate: {uniqueness_rate:.1f}%")

    print("\n4. Calculating Novelty (Cross-referencing training data)...")
    with open("data/thesis_corpus.json", "r") as f:
        training_data = json.load(f)
    
    training_formulas = {}
    for item in training_data:
        try:
            train_cif = item["cif_text"].split("[CIF START]\n")[1]
            train_struct = CifParser.from_string(train_cif).get_structures(primitive=True)[0]
            formula = train_struct.composition.reduced_formula
            if formula not in training_formulas:
                training_formulas[formula] = []
            training_formulas[formula].append(train_struct)
        except Exception:
            continue

    novel_structures = []
    for gen_struct in tqdm(unique_structures, desc="Checking Novelty"):
        formula = gen_struct.composition.reduced_formula
        is_novel = True
        if formula in training_formulas:
            for train_struct in training_formulas[formula]:
                if matcher.fit(gen_struct, train_struct):
                    is_novel = False 
                    break
        if is_novel:
            novel_structures.append(gen_struct)

    novelty_rate = (len(novel_structures) / len(unique_structures)) * 100
    print(f"   -> Novelty Rate: {novelty_rate:.1f}%")

    print("\n--- 📊 PUBLICATION-READY METRICS ---")
    print(f"Strict Validity: {validity_rate:.1f}%")
    print(f"Uniqueness:      {uniqueness_rate:.1f}%")
    print(f"Novelty:         {novelty_rate:.1f}%")
    print("------------------------------------")

if __name__ == "__main__":
    evaluate_crystallm_advanced(num_samples=100)

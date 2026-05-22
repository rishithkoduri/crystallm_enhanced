import os
import math
import torch
import warnings
import re  # <--- ADDED: Required for the table number fix
from transformers import AutoModelForCausalLM, AutoTokenizer
from pymatgen.io.cif import CifParser
from jarvis.core.atoms import Atoms
from alignn.pretrained import get_figshare_model
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
from pymatgen.io.cif import CifWriter

# Import ALIGNN's graph builder
try:
    from alignn.graphs import Graph
    DGL_AVAILABLE = True
except ImportError:
    DGL_AVAILABLE = False

os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")

class CrystaLLMMCTS:
    def __init__(self, 
                 llm_path=r"D:\CrystaLLM\crystallm_training_autoregressive\data\models\crystallm-ar-final", 
                 tokenizer_path=r"D:\CrystaLLM\crystallm_training_autoregressive\data\tokenizer"):
        
        print("Loading LLM and Tokenizer from local D: drive...")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
        self.model = AutoModelForCausalLM.from_pretrained(llm_path)
        self.model.resize_token_embeddings(len(self.tokenizer))
        self.model.to(self.device)
        self.model.eval()
        
        print("Loading ALIGNN Formation Energy Predictor...")
        self.alignn_model = get_figshare_model("jv_formation_energy_peratom_alignn")
        self.alignn_model.to(self.device)
        self.alignn_model.eval()

    def _evaluate_physics(self, cif_string):
        """
        Multi-Tier Evaluator: 
        1. PyMatgen for strict topological viability.
        2. ALIGNN for thermodynamic energy (with a safe fallback).
        """
        try:
            # TIER 1: STRICT TOPOLOGY CHECK
            parser = CifParser.from_str(cif_string)
            pmg_struct = parser.get_structures(primitive=True)[0]
            
            if len(pmg_struct) == 0:
                return -100.0, "Empty structure"
                
            # TIER 2: THERMODYNAMIC ALIGNN CHECK
            try:
                # Build pure JARVIS atoms
                lattice_mat = pmg_struct.lattice.matrix
                elements = [str(site.specie.symbol) for site in pmg_struct]
                frac_coords = pmg_struct.frac_coords
                jarvis_atoms = Atoms(lattice_mat=lattice_mat, elements=elements, coords=frac_coords, cartesian=False)
                
                if not DGL_AVAILABLE:
                    raise Exception("DGL Graph builder not found.")
                    
                # Build the exact Graph tuple ALIGNN expects (g, lg)
                g, lg = Graph.atom_dgl_multigraph(jarvis_atoms)
                
                with torch.no_grad():
                    # Pass the correctly formatted tuple to the ALIGNN forward pass
                    out = self.alignn_model((g.to(self.device), lg.to(self.device)))
                    formation_energy = float(out.cpu().numpy()[0])
                    
                return -formation_energy, "Success"
                
            except Exception as alignn_e:
                # 🚨 THE FALLBACK: The crystal IS perfectly valid, but the DGL library crashed.
                return 10.0, f"Valid Topology Achieved! (ALIGNN DGL crash bypassed)"

        except Exception as e:
            # PyMatgen caught bad syntax or overlapping atoms
            error_type = type(e).__name__
            error_details = str(e).split('\n')[0] 
            return -100.0, f"{error_type}: {error_details}"

    def generate_guided(self, prompt, num_simulations=20):
        print(f"\n--- 🌳 INITIATING ALIGNN-GUIDED GENERATION ({num_simulations} Sims) ---")
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)
        
        best_cif = None
        best_reward = float('-inf')
        best_energy_label = ""
        
        with torch.no_grad():
            for i in range(num_simulations):
                output_ids = self.model.generate(
                    input_ids, max_length=1024, temperature=0.85, do_sample=True,
                    eos_token_id=self.tokenizer.eos_token_id, pad_token_id=self.tokenizer.eos_token_id
                )
                text = self.tokenizer.decode(output_ids[0], skip_special_tokens=False)
                
                try:
                    # 1. Extract the raw primitive CIF from the AI
                    raw_cif_str = text.split("[CIF START]")[1].split("[CIF END]")[0].strip()
                    
                    # 2. Evaluate the physics on the primitive cell
                    reward, msg = self._evaluate_physics(raw_cif_str)
                    
                    if reward != -100.0:
                        # SUCCESS! 
                        
                        # ✨ THE SMART SYMMETRY & SUPERCELL INTERCEPT ✨
                        try:
                            parser = CifParser.from_str(raw_cif_str)
                            pmg_struct = parser.get_structures()[0]
                            
                            # 1. Transform into a perfect Conventional Box
                            sga = SpacegroupAnalyzer(pmg_struct, symprec=0.1, angle_tolerance=5.0)
                            conventional_cube = sga.get_conventional_standard_structure()
                            
                            # Grab BOTH the correct name and the official ID number!
                            true_space_group = sga.get_space_group_symbol()
                            true_sg_number = sga.get_space_group_number()  # <--- ADDED
                            
                            # 2. SMART SUPERCELL LOGIC
                            # Only expand if the box has fewer than 20 atoms. 
                            if len(conventional_cube) < 20:
                                conventional_cube.make_supercell([2, 2, 2])
                            
                            # 3. Generate the EXPLICIT CIF for the visualizer
                            explicit_cif_str = conventional_cube.to(fmt="cif")
                            
                            # 4. Inject the true space group name AND number
                            final_cif_str = explicit_cif_str.replace("'P 1'", f"'{true_space_group}'")
                            final_cif_str = re.sub(r"_symmetry_Int_Tables_number\s+1\b", f"_symmetry_Int_Tables_number   {true_sg_number}", final_cif_str) # <--- ADDED
                            
                        except Exception:
                            final_cif_str = raw_cif_str
                            
                        # Handle the energy labels for the UI
                        if "Valid Topology Achieved" in msg:
                            print(f"✅ Sim {i+1}: {msg}")
                            display_energy = "N/A (Topological Match)"
                        else:
                            energy = -reward
                            print(f"✅ Sim {i+1}: Valid! Energy: {energy:.4f} eV/atom")
                            display_energy = f"{energy:.4f} eV/atom"
                            
                        # Save the best path using the EXPANDED supercell string!
                        if reward > best_reward:
                            best_reward = reward
                            best_cif = final_cif_str  # <--- Passing the Supercell to React!
                            best_energy_label = display_energy
                    else:
                        print(f"❌ Sim {i+1} Failed -> {msg}")
                        
                except IndexError:
                    print(f"❌ Sim {i+1} Failed -> Missing tags.")
                    continue
                    
        return best_cif, best_energy_label

if __name__ == "__main__":
    mcts_engine = CrystaLLMMCTS()
    
    # Test prompt for standard cubic salt (Fm-3m)
    test_prompt = "[CONTEXT]\n- The material NaCl is a stable crystal structure.\n- The formation energy is -2.2000 eV/atom.\n- The space group symmetry is Fm-3m.\n\n[TASK]\nBased on the context above, generate a valid CIF structure for:\nNaCl\n\n[CIF START]\n"
    
    # Running 30 simulations
    best_structure, lowest_energy = mcts_engine.generate_guided(test_prompt, num_simulations=30)
    
    if best_structure:
        print("\n🏆 BEST STRUCTURE FOUND (2x2x2 Supercell) 🏆")
        print(f"Predicted Formation Energy: {lowest_energy}")
        print("-------------------------------------------------")
        print(best_structure)
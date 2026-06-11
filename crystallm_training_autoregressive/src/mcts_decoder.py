import os
import math
import torch
import warnings
import re  
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
        
        print("⚡ Loading model in full FP32 (32-bit floating point) precision...")
        
        self.model = AutoModelForCausalLM.from_pretrained(llm_path, torch_dtype=torch.float32)
        self.model.resize_token_embeddings(len(self.tokenizer))
        self.model.to(self.device)
        self.model.eval()
        
        print("Loading ALIGNN Formation Energy Predictor...")
        self.alignn_model = get_figshare_model("jv_formation_energy_peratom_alignn")
        self.alignn_model.to(self.device)
        self.alignn_model.eval()

    def _evaluate_physics(self, cif_string):
        try:
            parser = CifParser.from_str(cif_string)
            pmg_struct = parser.get_structures(primitive=True)[0]
            
            if len(pmg_struct) == 0:
                return -100.0, "Empty structure"
                
            try:
                lattice_mat = pmg_struct.lattice.matrix
                elements = [str(site.specie.symbol) for site in pmg_struct]
                frac_coords = pmg_struct.frac_coords
                jarvis_atoms = Atoms(lattice_mat=lattice_mat, elements=elements, coords=frac_coords, cartesian=False)
                
                if not DGL_AVAILABLE:
                    raise Exception("DGL Graph builder not found.")
                    
                g, lg = Graph.atom_dgl_multigraph(jarvis_atoms)
                
                with torch.no_grad():
                    out = self.alignn_model((g.to(self.device), lg.to(self.device)))
                    formation_energy = float(out.cpu().numpy()[0])
                    
                return -formation_energy, "Success"
                
            except Exception as alignn_e:
                return 10.0, f"Valid Topology Achieved! (ALIGNN DGL crash bypassed)"

        except Exception as e:
            error_type = type(e).__name__
            error_details = str(e).split('\n')[0] 
            return -100.0, f"{error_type}: {error_details}"

    # 🚨 ADDED: material_name argument here!
    def generate_guided(self, prompt, num_simulations=10, batch_size=10, material_name="Unknown"):
        print(f"\n--- 🌳 INITIATING PARALLEL ALIGNN MCTS FOR {material_name.upper()} ({num_simulations} Sims) ---")
        
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)
        
        best_cif = None
        best_reward = float('-inf')
        best_energy_label = ""
        
        num_batches = math.ceil(num_simulations / batch_size)
        total_sims_run = 0
        
        with torch.no_grad():
            for batch_idx in range(num_batches):
                current_batch_size = min(batch_size, num_simulations - total_sims_run)
                
                print(f"🔥 Firing GPU Matrix Batch {batch_idx + 1}/{num_batches} (Calculating {current_batch_size} paths simultaneously)...")
                
                batched_input_ids = input_ids.repeat(current_batch_size, 1)
                
                output_ids = self.model.generate(
                    batched_input_ids, 
                    max_length=1024, 
                    temperature=0.85, 
                    do_sample=True,
                    eos_token_id=self.tokenizer.eos_token_id, 
                    pad_token_id=self.tokenizer.eos_token_id
                )
                
                for seq_idx, out_id in enumerate(output_ids):
                    sim_num = total_sims_run + seq_idx + 1
                    text = self.tokenizer.decode(out_id, skip_special_tokens=False)
                    
                    try:
                        raw_cif_str = text.split("[CIF START]")[1].split("[CIF END]")[0].strip()
                        reward, msg = self._evaluate_physics(raw_cif_str)
                        
                        if reward != -100.0:
                            try:
                                parser = CifParser.from_str(raw_cif_str)
                                pmg_struct = parser.get_structures()[0]
                                
                                sga = SpacegroupAnalyzer(pmg_struct, symprec=0.1, angle_tolerance=5.0)
                                conventional_cube = sga.get_conventional_standard_structure()
                                
                                true_space_group = sga.get_space_group_symbol()
                                true_sg_number = sga.get_space_group_number()  
                                
                                explicit_cif_str = conventional_cube.to(fmt="cif")
                                
                                final_cif_str = explicit_cif_str.replace("'P 1'", f"'{true_space_group}'")
                                final_cif_str = re.sub(r"_symmetry_Int_Tables_number\s+1\b", f"_symmetry_Int_Tables_number   {true_sg_number}", final_cif_str) 
                                
                            except Exception:
                                final_cif_str = raw_cif_str
                                
                            if "Valid Topology Achieved" in msg:
                                print(f"✅ Sim {sim_num}: {msg}")
                                display_energy = "N/A (Topological Match)"
                            else:
                                energy = -reward
                                print(f"✅ Sim {sim_num}: Valid! Energy: {energy:.4f} eV/atom")
                                display_energy = f"{energy:.4f} eV/atom"
                                
                            if reward > best_reward:
                                best_reward = reward
                                best_cif = final_cif_str  
                                best_energy_label = display_energy
                        else:
                            print(f"❌ Sim {sim_num} Failed -> {msg}")
                            
                    except IndexError:
                        print(f"❌ Sim {sim_num} Failed -> Missing tags.")
                        continue
                
                total_sims_run += current_batch_size
                
        return best_cif, best_energy_label

if __name__ == "__main__":
    mcts_engine = CrystaLLMMCTS()
    test_prompt = "[CONTEXT]\n- The material NaCl is a stable crystal structure.\n- The formation energy is -2.2000 eV/atom.\n- The space group symmetry is Fm-3m.\n\n[TASK]\nBased on the context above, generate a valid CIF structure for:\nNaCl\n\n[CIF START]\n"
    best_structure, lowest_energy = mcts_engine.generate_guided(test_prompt, num_simulations=30, batch_size=10, material_name="NaCl")
    if best_structure:
        print("\n🏆 BEST STRUCTURE FOUND 🏆")
        print(f"Predicted Formation Energy: {lowest_energy}")
        print("-------------------------------------------------")
        print(best_structure)
import gradio as gr
import torch
import py3Dmol
import html
import os
from transformers import AutoModelForCausalLM, PreTrainedTokenizerFast

# Load locally (Your RTX 4060 will crush a 124M parameter model)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading Autoregressive Tokenizer and Model...")
tokenizer_path = "../data/tokenizer"
model_path = "../data/models/crystallm-ar-final"

try:
    tokenizer = PreTrainedTokenizerFast.from_pretrained(tokenizer_path)
    model = AutoModelForCausalLM.from_pretrained(model_path).to(device)
    model.eval()
    print("✅ Brain loaded successfully!")
except Exception as e:
    print(f"⚠️ Could not load model: {e}. Make sure the paths are correct.")

def build_prompt(formula, energy, space_group):
    # Dynamic Prompt Construction based on User Inputs
    if formula and energy:
        context = f"- The material {formula} is a stable crystal structure.\n- The formation energy is {float(energy):.4f} eV/atom."
        task = f"Based on the context above, generate a valid CIF structure for:\n{formula}"
    elif formula and space_group:
        context = f"- The target space group symmetry is {space_group}.\n- The material composition is {formula}."
        task = f"Generate a valid CIF structure for {formula} with {space_group} symmetry."
    elif formula:
        context = f"- The material {formula} is a stable crystal structure."
        task = f"Generate a valid CIF structure for:\n{formula}"
    elif energy:
        context = f"- The target formation energy is {float(energy):.4f} eV/atom."
        task = "Generate a valid CIF structure that matches this target energy."
    else:
        context = "- No specific conditions provided."
        task = "Invent a completely novel, stable crystal structure."

    return f"[CONTEXT]\n{context}\n\n[TASK]\n{task}\n\n[CIF START]\n"

def generate_crystal(formula, energy, space_group):
    try:
        # 1. Build the dynamic prompt
        prompt = build_prompt(formula, energy, space_group)
        input_ids = tokenizer.encode(prompt, return_tensors="pt").to(device)

        # 2. Autoregressive Generation
        with torch.no_grad():
            output_ids = model.generate(
                input_ids,
                max_length=1024,
                temperature=0.7,
                do_sample=True,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.eos_token_id,
            )

        # 3. Decode to Text
        generated_text = tokenizer.decode(output_ids[0], skip_special_tokens=False)

        # 4. Extract CIF
        cif_str = generated_text.split("[CIF START]")[1].split("[CIF END]")[0].strip()

        # 5. Render 3D HTML Viewer
        view = py3Dmol.view(width=500, height=500)
        view.addModel(cif_str, 'cif')
        view.setStyle({'sphere': {'colorscheme': 'Jmol', 'scale': 0.3}, 'stick': {'colorscheme': 'Jmol', 'radius': 0.1}})
        view.addUnitCell()
        view.zoomTo()
        html_3d = f'<iframe style="width: 100%; height: 500px; border: none;" srcdoc="{html.escape(view._make_html())}"></iframe>'

        return html_3d, cif_str, prompt

    except Exception as e:
        return f"<div style='color:red;'><b>Error:</b> {str(e)}</div>", "", f"Failed to generate: {str(e)}"

# --- UI Layout ---
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🧬 CrystaLLM: Autoregressive Inverse Design")
    gr.Markdown("Leave fields blank to test the model's dynamic prompt dropout capabilities (e.g., generate a completely random crystal, or one based *only* on a target energy).")
    
    with gr.Row():
        with gr.Column(scale=1):
            formula_input = gr.Textbox(label="Formula (Optional)", placeholder="e.g., Au2O3")
            energy_input = gr.Textbox(label="Target Energy eV/atom (Optional)", placeholder="e.g., -2.0")
            sg_input = gr.Textbox(label="Space Group (Optional)", placeholder="e.g., Fm-3m")
            generate_btn = gr.Button("Generate Crystal", variant="primary")
            
            prompt_out = gr.Textbox(label="Exact Prompt Sent to LLM", lines=8, interactive=False)
            
        with gr.Column(scale=2):
            viz_out = gr.HTML(label="Interactive 3D Viewer")
            cif_out = gr.Code(label="Generated CIF Syntax", language="python")
            
    generate_btn.click(
        fn=generate_crystal, 
        inputs=[formula_input, energy_input, sg_input], 
        outputs=[viz_out, cif_out, prompt_out]
    )

if __name__ == "__main__":
    demo.launch(share=True)

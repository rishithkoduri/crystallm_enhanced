import requests
import json
import time

# --- YOUR CONFIGURATION ---
formula = "Au2O3"
spaceGroup = "Fdd2"
simulations = 100
# --------------------------

data = {
    "formula": formula,
    "targetEnergy": "",
    "spaceGroup": spaceGroup,
    "simulations": simulations
}

print(f"🚀 Starting {simulations}-Sim Batch for {formula} directly to Python AI Engine...")
start_time = time.time()

try:
    # We set timeout=3600 (1 Hour) so the script NEVER gives up waiting!
    response = requests.post(
        "http://127.0.0.1:8000/predict", 
        json=data,
        timeout=3600 
    )
    
    result = response.json()
    
    # Handle both potential JSON structures depending on how your API formats the return
    cif_data = result.get('data', {}).get('cifData') or result.get('cifData')
    
    if cif_data:
        filename = f"GLOBAL_MINIMUM_{formula}_{simulations}sims.cif"
        with open(filename, "w") as f:
            f.write(cif_data)
            
        elapsed = round((time.time() - start_time) / 60, 2)
        print(f"\n✅ SUCCESS! Finished in {elapsed} minutes.")
        print(f"💾 Safely saved to your folder as: {filename}")
    else:
        print("⚠️ Engine finished, but couldn't find the CIF string in the response:", result)

except Exception as e:
    print(f"❌ Critical Error: {e}")
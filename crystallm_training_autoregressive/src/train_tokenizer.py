import json
import os
from transformers import AutoTokenizer

def train_cif_tokenizer(corpus_path="data/thesis_corpus.json", save_dir="data/tokenizer"):
    print("--- INITIATING BYTE-LEVEL CIF TOKENIZER TRAINING ---")
    
    # 1. Load the dataset
    with open(corpus_path, "r") as f:
        raw_data = json.load(f)
        
    texts = [item["cif_text"] for item in raw_data]
    print(f"Loaded {len(texts)} CIF documents.")

    # 2. Generator function for Hugging Face
    def get_training_corpus():
        for i in range(0, len(texts), 1000):
            yield texts[i : i + 1000]

    # 3. Load the base GPT-2 Byte-Level Tokenizer blueprint
    print("Training new Byte-Level BPE Tokenizer...")
    base_tokenizer = AutoTokenizer.from_pretrained("gpt2")
    
    # 4. Train the new vocabulary on your specific CIF data
    new_tokenizer = base_tokenizer.train_new_from_iterator(
        get_training_corpus(), 
        vocab_size=10000
    )

    # 5. Add our specific structural boundary tokens
    special_tokens_dict = {
        'additional_special_tokens': ["[CONTEXT]", "[TASK]", "[CIF START]", "[CIF END]"],
        'pad_token': '<|endoftext|>'
    }
    new_tokenizer.add_special_tokens(special_tokens_dict)
    
    # 6. Save for the training loop
    new_tokenizer.save_pretrained(save_dir)
    print(f"✅ Custom Byte-Level Tokenizer saved to {save_dir}/")

if __name__ == "__main__":
    train_cif_tokenizer()

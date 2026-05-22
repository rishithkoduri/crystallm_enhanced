import os
import torch
from transformers import (
    AutoConfig, AutoModelForCausalLM, Trainer, 
    TrainingArguments, AutoTokenizer
)
from ar_dataset import CrystaLLMDataset
import wandb

def train_crystallm():
    print("--- INITIATING AUTOREGRESSIVE LLM TRAINING (A100 OPTIMIZED) ---")
    
    # 1. Load the new Byte-Level Tokenizer
    tokenizer = AutoTokenizer.from_pretrained("data/tokenizer")
    dataset = CrystaLLMDataset()
    
    train_size = int(0.95 * len(dataset))
    eval_size = len(dataset) - train_size
    train_dataset, eval_dataset = torch.utils.data.random_split(dataset, [train_size, eval_size])
    
    print("Initializing blank 124M Parameter CausalLM Architecture...")
    config = AutoConfig.from_pretrained(
        "gpt2",
        vocab_size=len(tokenizer),
        n_positions=1024,
        n_embd=768,
        n_layer=12,
        n_head=12,
        bos_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )
    model = AutoModelForCausalLM.from_config(config)
    
    training_args = TrainingArguments(
        output_dir="data/models/crystallm-ar",
        overwrite_output_dir=True,
        
        # 🚨 THE GOLDEN ZONE TARGET 🚨
        max_steps=17000,                   # Stop right before overfitting starts!
        
        per_device_train_batch_size=8,     
        per_device_eval_batch_size=8,
        gradient_accumulation_steps=4,     # Effective Batch Size = 32
        learning_rate=3e-4,
        weight_decay=0.01,
        bf16=True,                         # A100 Tensor Core optimization
        logging_steps=50,
        evaluation_strategy="steps",
        eval_steps=500,
        save_strategy="steps",
        save_steps=1000,
        save_total_limit=2,                
        report_to="wandb",
        run_name="crystallm-byte-level-run"
    )

    wandb.init(project="crystallm-autoregressive")
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
    )

    print("🚀 Launching Autoregressive Training (From Scratch)...")
    trainer.train()
    
    trainer.save_model("data/models/crystallm-ar-final")
    print("✅ Training Complete. Final model saved.")

if __name__ == "__main__":
    train_crystallm()

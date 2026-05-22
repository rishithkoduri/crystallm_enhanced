import json
import torch
from torch.utils.data import Dataset
from transformers import PreTrainedTokenizerFast

class CrystaLLMDataset(Dataset):
    def __init__(self, corpus_path="data/thesis_corpus.json", tokenizer_path="data/tokenizer", max_length=1024):
        self.tokenizer = PreTrainedTokenizerFast.from_pretrained(tokenizer_path)
        self.max_length = max_length
        
        with open(corpus_path, "r") as f:
            self.raw_data = json.load(f)
            
        print(f"Tokenizing {len(self.raw_data)} structures into Tensors...")

    def __len__(self):
        return len(self.raw_data)

    def __getitem__(self, idx):
        raw_text = self.raw_data[idx]["cif_text"] + "\n[CIF END]<|endoftext|>"
        
        encodings = self.tokenizer(
            raw_text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        
        input_ids = encodings["input_ids"].squeeze()
        attention_mask = encodings["attention_mask"].squeeze()
        
        labels = input_ids.clone()
        labels[input_ids == self.tokenizer.pad_token_id] = -100

        return {"input_ids": input_ids, "attention_mask": attention_mask, "labels": labels}

import torch

def check_hardware():
    print(f"PyTorch Version: {torch.__version__}")
    
    if torch.cuda.is_available():
        print(f"Hardware: NVIDIA CUDA")
        print(f"Device: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        print("Hardware: Apple Silicon (MPS)")
    elif hasattr(torch, "xpu") and getattr(torch.xpu, "is_available", lambda: False)():
        print("Hardware: Intel XPU")
    else:
        print("Hardware: None (CPU bound)")

if __name__ == "__main__":
    check_hardware()
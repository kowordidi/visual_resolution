from resolution import full_resolution
import json

if __name__ == "__main__":
    initial = [
        ["A", "B"],
        ["¬A", "B"],
        ["¬B"]
    ]
    
    result = full_resolution(initial)
    
    print(json.dumps(result, indent=2, ensure_ascii=False))

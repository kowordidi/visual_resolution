from resolution import full_resolution

if __name__ == "__main__":
    initial = {
        frozenset({"A", "B"}),
        frozenset({"¬A", "B"}),
        frozenset({"¬B"})
    }
    result = full_resolution(initial)
    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))


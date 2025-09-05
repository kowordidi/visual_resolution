from itertools import combinations

def negate(literal):
    return literal[1:] if literal.startswith("¬") else "¬" + literal

def resolvent(c1, c2, lit):
    nlit = negate(lit)
    if lit in c1 and nlit in c2:
        return (c1 - {lit} | c2 - {nlit})
    elif nlit in c1 and lit in c2:
        return (c1 - {nlit} | c2 - {lit})
    raise ValueError(f"Literal '{lit}' kommt nicht komplementär in {c1} und {c2} vor")

def all_resolvents(c1, c2, known_clauses):
    steps = []
    new_resolvents = set()
    for lit in c1:
        nlit = negate(lit)
        if nlit in c2:
            res = frozenset(resolvent(c1, c2, lit))
            if res in known_clauses:
                steps.append({
                    "type": "cut_known",
                    "c1": list(c1), "c2": list(c2),
                    "literal": lit,
                    "resolvent": list(res)
                })
            else:
                steps.append({
                    "type": "cut_new",
                    "c1": list(c1), "c2": list(c2),
                    "literal": lit,
                    "resolvent": list(res)
                })
                new_resolvents.add(res)
        else:
            steps.append({
                "type": "no_cut",
                "c1": list(c1), "c2": list(c2),
                "literal": lit
            })
    return steps, new_resolvents

def resolution_level(clauses, known_clauses):
    level_steps = []
    new_resolvents = set()
    for c1, c2 in combinations(clauses, 2):
        steps, new_res = all_resolvents(c1, c2, known_clauses)
        level_steps.extend(steps)
        new_resolvents |= new_res
    return level_steps, new_resolvents

def full_resolution(initial_clauses):
    all_clauses = set(initial_clauses)
    levels = []
    level_num = 1
    
    while True:
        level_steps, new_resolvents = resolution_level(all_clauses, all_clauses)
        levels.append({
            "level": level_num,
            "clauses": [list(c) for c in all_clauses],
            "steps": level_steps,
            "new_resolvents": [list(r) for r in new_resolvents]
        })
        
        if not new_resolvents:
            break
        
        all_clauses |= new_resolvents
        level_num += 1
    
    return levels
from itertools import combinations

def negate(literal):
    return literal[1:] if literal.startswith("!") else "!" + literal

def resolvent(c1, c2, lit):
    nlit = negate(lit)
    if lit in c1 and nlit in c2:
        res = [x for x in c1 if x != lit] + [x for x in c2 if x != nlit]
        return list(sorted(set(res)))  # Duplikate entfernen, Reihenfolge optional
    elif nlit in c1 and lit in c2:
        res = [x for x in c1 if x != nlit] + [x for x in c2 if x != lit]
        return list(sorted(set(res)))
    raise ValueError(f"Literal '{lit}' kommt nicht komplementär in {c1} und {c2} vor")

def all_resolvents(c1, c2, known_clauses):
    steps = []
    new_resolvents = []
    for lit in c1:
        nlit = negate(lit)
        if nlit in c2:
            res = resolvent(c1, c2, lit)
            if res in known_clauses:
                steps.append({
                    "type": "cut_known",
                    "c1": c1, "c2": c2,
                    "literal": lit,
                    "resolvent": res
                })
            else:
                steps.append({
                    "type": "cut_new",
                    "c1": c1, "c2": c2,
                    "literal": lit,
                    "resolvent": res
                })
                new_resolvents.append(res)
        else:
            steps.append({
                "type": "no_cut",
                "c1": c1, "c2": c2,
                "literal": lit
            })
    return steps, new_resolvents

def resolution_level(clauses, known_clauses):
    level_steps = []
    new_resolvents = []
    for c1, c2 in combinations(clauses, 2):
        steps, new_res = all_resolvents(c1, c2, known_clauses)
        level_steps.extend(steps)
        for r in new_res:
            if r not in new_resolvents:
                new_resolvents.append(r)
    return level_steps, new_resolvents

def full_resolution(initial_clauses):
    all_clauses = list(initial_clauses)
    levels = []
    level_num = 1
    
    while True:
        level_steps, new_resolvents = resolution_level(all_clauses, all_clauses)
        levels.append({
            "level": level_num,
            "clauses": all_clauses.copy(),
            "steps": level_steps,
            "new_resolvents": new_resolvents.copy()
        })
        
        if not new_resolvents:
            break
        
        for r in new_resolvents:
            if r not in all_clauses:
                all_clauses.append(r)
        level_num += 1
    
    return levels

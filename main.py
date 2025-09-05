from itertools import combinations
from utils import print_clauses

# ANSI-Farbcodes
BOLD = "\033[1m"
RESET = "\033[0m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"

def negate(literal):
    return literal[1:] if literal.startswith("¬") else "¬" + literal

def resolvent(c1, c2, lit):
    nlit = negate(lit)
    if lit in c1 and nlit in c2:
        return (c1 - {lit} | c2 - {nlit})
    elif nlit in c1 and lit in c2:
        return (c1 - {nlit} | c2 - {lit})
    raise ValueError(f"Literal '{lit}' kommt nicht komplementär in {set(c1)} und {set(c2)} vor")


def all_resolvents(c1, c2, known_clauses):
    resolvents = set()
    for lit in c1:
        nlit = negate(lit)
        if nlit in c2:
            res = resolvent(c1, c2, lit)
            if res in known_clauses:
                print(f"{YELLOW}  • cut zwischen {set(c1)} und {set(c2)} über '{lit}' aber Resolvente {set(res)} schon bekannt {RESET}")
            else:
                print(f"{GREEN}  • cut zwischen {set(c1)} und {set(c2)} über '{lit}' → {set(res)}{RESET}")
                resolvents.add(frozenset(res))
        else:
            print(f"  • {RED}kein cut zwischen {set(c1)} und {set(c2)} über '{lit}' möglich{RESET}")
    return resolvents


def resolution_level(known_clauses):
    print(f"{BOLD}alle Klauseln auf diesem Level:{RESET}")
    print_clauses(known_clauses)
    
    print(f"\n{BOLD}Systematische Anwendung der Schnittregel:\n{RESET}")
    resolvents = set()
    for c1, c2 in combinations(known_clauses, 2):
        resolvents |= all_resolvents(c1, c2, known_clauses)

    print(f"\n{BOLD}Neue Resolventen auf diesem Level:{RESET}")
    print_clauses(resolvents)
    
    return resolvents

def full_resolution(clauses):
    level_num = 1
    all_clauses = clauses
    while True:
        print(f"\n{'='*80}")
        print(f"{BOLD}Level {level_num}{RESET}")
        print(f"{'='*80}\n")
        
        new_resolvents = resolution_level(all_clauses)
        if not new_resolvents:
            print(f"\n{BOLD}Keine neuen Resolventen mehr – Ende der Resolution.{RESET}")
            break
        
        all_clauses |= new_resolvents
        level_num += 1

    return all_clauses

if __name__ == "__main__":
    initial_clauses = {
        frozenset({"A", "B"}),
        frozenset({"¬A", "B"}),
        frozenset({"¬B"})
    }
    final_clauses = full_resolution(initial_clauses)
    print(final_clauses)

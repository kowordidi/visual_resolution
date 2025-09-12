function negate(literal) {
    return literal.startsWith('!') ? literal.slice(1) : '!' + literal;
}

function resolvent(c1, c2, lit) {
    const nlit = negate(lit);
    if (c1.includes(lit) && c2.includes(nlit)) {
        const res = [...c1.filter(x => x !== lit), ...c2.filter(x => x !== nlit)];
        return Array.from(new Set(res)).sort();
    } else if (c1.includes(nlit) && c2.includes(lit)) {
        const res = [...c1.filter(x => x !== nlit), ...c2.filter(x => x !== lit)];
        return Array.from(new Set(res)).sort();
    }
    throw new Error(`Literal '${lit}' kommt nicht komplementär in ${c1} und ${c2} vor`);
}

function allResolvents(c1, c2, knownClauses, foundInThisLevel) {
    const steps = [];
    const newResolvents = [];
    for (const lit of c1) {
        const nlit = negate(lit);
        if (c2.includes(nlit)) {
            const res = resolvent(c1, c2, lit);
            if (knownClauses.some(cl => arraysEqual(cl, res)) || foundInThisLevel.some(cl => arraysEqual(cl, res))) {
                steps.push({ type: 'cut_known', c1, c2, literal: lit, resolvent: res });
            } else {
                steps.push({ type: 'cut_new', c1, c2, literal: lit, resolvent: res });
                newResolvents.push(res);
            }
        } else {
            steps.push({ type: 'no_cut', c1, c2, literal: lit });
        }
    }
    return [steps, newResolvents];
}

function resolutionLevel(clauses, knownClauses) {
    const levelSteps = [];
    const newResolvents = [];
    const foundInThisLevel = [];

    for (let i = 0; i < clauses.length; i++) {
        for (let j = i + 1; j < clauses.length; j++) {
            const [steps, newRes] = allResolvents(clauses[i], clauses[j], knownClauses, foundInThisLevel);
            levelSteps.push(...steps);
            for (const r of newRes) {
                if (!newResolvents.some(cl => arraysEqual(cl, r))) {
                    newResolvents.push(r);
                    foundInThisLevel.push(r);
                }
            }
        }
    }
    return [levelSteps, newResolvents];
}

function fullResolution(initialClauses) {
    const allClauses = initialClauses.map(cl => [...cl]);
    const levels = [];
    let levelNum = 1;

    while (true) {
        const [levelSteps, newResolvents] = resolutionLevel(allClauses, allClauses);
        levels.push({ level: levelNum, clauses: allClauses.map(cl => [...cl]), steps: levelSteps, new_resolvents: newResolvents.map(cl => [...cl]) });

        if (newResolvents.length === 0) break;

        for (const r of newResolvents) {
            if (!allClauses.some(cl => arraysEqual(cl, r))) allClauses.push(r);
        }
        levelNum++;
    }
    return levels;
}

// Hilfsfunktion, um Array-Gleichheit zu prüfen
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

// resolution.js
export { fullResolution, negate, resolvent, allResolvents };

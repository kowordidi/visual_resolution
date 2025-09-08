let allLevels = [];
let currentLevel = 0;
let currentStep = 0;
let showingLevel = false;

const negateBtn = document.getElementById('negateBtn');
const sendBtn = document.getElementById('sendBtn');
const nextBtn = document.getElementById('nextBtn');
const showAllBtn = document.getElementById('showAllBtn');
const container = document.getElementById('resolution-container');

window.addEventListener('DOMContentLoaded', () => {
    nextBtn.disabled = true;
    showAllBtn.disabled = true;
});

negateBtn.addEventListener('click', () => {
    const start = userInput.selectionStart;
    const end = userInput.selectionEnd;

    // Text vor und nach dem Cursor zusammen mit ¬
    const text = userInput.value;
    userInput.value = text.slice(0, start) + '¬' + text.slice(end);

    // Cursor direkt hinter das eingefügte ¬ setzen
    userInput.selectionStart = userInput.selectionEnd = start + 1;
    
    // Fokus im Textfeld behalten
    userInput.focus();
});

sendBtn.addEventListener('click', () => {
    const rawInput = document.getElementById('userInput').value;
    const value = parseUserInput(rawInput);
    console.log('parsed input:' + value);
    let clauses;
    try {
        clauses = JSON.parse(value);
    } catch (err) {
        alert("Ungültiges JSON!");
        return;
    }

    fetch('http://127.0.0.1:5000/resolve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clauses })
    })
    .then(response => response.json())
    .then(data => {
            // Formatiere die Klauseln direkt für die Anzeige
        allLevels = data.map(level => {
            return {
                ...level,
                clauses: formatForDisplay(level.clauses),
                new_resolvents: formatForDisplay(level.new_resolvents),
                steps: level.steps.map(step => ({
                    ...step,
                    c1: formatForDisplay([step.c1])[0],
                    c2: formatForDisplay([step.c2])[0],
                    resolvent: formatForDisplay([step.resolvent])[0]
                }))
            };
        });
        console.log(allLevels);
        currentLevel = 0;
        currentStep = 0;
        showingLevel = false;
        container.innerHTML = '';

        // Buttons nach erfolgreichem Laden aktivieren
        nextBtn.disabled = false;
        showAllBtn.disabled = false;

        // einmal automatisch die erste Zeile aufdecken
        showNextStep();

    })
    .catch(error => {
        console.error('Fehler:', error);
    });
});

nextBtn.addEventListener('click', () => {
    showNextStep();
});

showAllBtn.addEventListener('click', () => {
    while (currentLevel < allLevels.length) {
        showNextStep(true);
    }
});

function parseUserInput(input) {
    input = input.replaceAll('¬', '!');
    // Füge Anführungszeichen um Symbole
    input = input.replaceAll(/([A-Za-z0-9!]+)/g, '"$1"');
    input = input.replaceAll('{', '[');
    input = input.replaceAll('}', ']');
    return input;
}

function formatForDisplay(clauses) {
    return clauses.map(clause => {
        if (!clause || clause.length === 0) return '∅';  // leere Klausel ersetzen
        // Jedes Literal in der Klausel umwandeln
        const formattedLiterals = clause.map(lit => {
            return lit.startsWith('!') ? '¬' + lit.substring(1) : lit;
        });
        return `{${formattedLiterals.join(', ')}}`;
    });
}

function highlightClauses(levelIndex, step) {
    // Erst alle vorherigen Highlights entfernen
    document.querySelectorAll(`#level-${levelIndex} .clause`).forEach(el => el.classList.remove('highlight'));

    const level = allLevels[levelIndex];

    // c1 und c2 in known clauses suchen
    [step.c1, step.c2].forEach(clauseText => {
        const span = Array.from(document.querySelectorAll(`#level-${levelIndex} .clause`))
                          .find(el => el.textContent === clauseText);
        if (span) span.classList.add('highlight');
    });
}



function showNextStep(showAll = false) {
    if (!showingLevel) {
        const level = allLevels[currentLevel];
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-box';
        levelDiv.id = `level-${currentLevel}`;

        const levelTitle = document.createElement('h3');
        levelTitle.textContent = `Level ${level.level}`;
        levelDiv.appendChild(levelTitle);

        // bekannte Klauseln
        const clauseList = document.createElement('div');
        clauseList.className = 'clauses';
        clauseList.innerHTML = '<strong>Bekannte Klauseln:</strong>' +
            level.clauses.map((c, i) => `<span class="clause" id="clause-${currentLevel}-${i}">${c}</span>`).join(', ');
        levelDiv.appendChild(clauseList);

        // Container für neue Resolventen erstellen
        const newResContainer = document.createElement('div');
        newResContainer.className = 'new-resolvents-container';
        newResContainer.innerHTML = '<strong>Neue Resolventen:</strong> ';
        levelDiv.appendChild(newResContainer);

        const stepsDiv = document.createElement('ul');
        stepsDiv.id = `steps-${currentLevel}`;
        levelDiv.appendChild(stepsDiv);

        container.appendChild(levelDiv);
        setTimeout(() => levelDiv.classList.add('visible'), 50);

        showingLevel = true;

        if (!showAll) return; // bei showAll gleich alle Schritte anzeigen
    }

    const level = allLevels[currentLevel];
    const stepsDiv = document.getElementById(`steps-${currentLevel}`);
    const newResContainer = document.querySelector(`#level-${currentLevel} .new-resolvents-container`);

    while (currentStep < level.steps.length) {
        // Alle alten Steps, die nicht cut_new sind, entfernen
        Array.from(stepsDiv.children).forEach(li => {
            if (!li.classList.contains('cut_new')) li.remove();
        });
        const step = level.steps[currentStep];
        highlightClauses(currentLevel, step);

        const li = document.createElement('li');
        const stepMessages = {
            cut_new: `${step.c1} und ${step.c2} über ${step.literal} ==> ${step.literal}`,
            cut_known: `Resolvente von ${step.c1} und ${step.c2} über ${step.literal} bereits bekannt:`,
            no_cut: `kein Cut zwischen ${step.c1} und ${step.c2} über ${step.literal} möglich`
        };
        li.className = `step ${step.type}`;
        li.innerHTML = stepMessages[step.type]
        stepsDiv.appendChild(li);
        setTimeout(() => li.classList.add('visible'), 50);

        // Wenn dieser Step eine neue Resolvente erzeugt, dynamisch hinzufügen
        if (step.type === 'cut_new') {
            const resolventSpan = document.createElement('span');
            resolventSpan.className = 'new-resolvent';
            resolventSpan.textContent = ` ${step.resolvent}, `;
            newResContainer.appendChild(resolventSpan);

            // Pfeile von c1 und c2 zu der neuen Resolvente
            const c1Span = Array.from(container.querySelectorAll('.clause')).find(el => el.textContent === step.c1);
            const c2Span = Array.from(container.querySelectorAll('.clause')).find(el => el.textContent === step.c2);
            drawArrow(c1Span, resolventSpan);
            drawArrow(c2Span, resolventSpan);
        }

        currentStep++;

        if (!showAll) return;
    }

    // Nächstes Level vorbereiten
    currentLevel++;
    currentStep = 0;
    showingLevel = false;

    if (currentLevel >= allLevels.length) {
        nextBtn.disabled = true;
        showAllBtn.disabled = true;
    }
}

function drawArrow(fromEl, toEl) {
    const container = fromEl.closest('.level-box');

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();

    const startX = fromRect.right - parentRect.left;
    const startY = fromRect.top + fromRect.height / 2 - parentRect.top;
    const endX = toRect.left - parentRect.left;
    const endY = toRect.top + toRect.height / 2 - parentRect.top;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "arrow-svg");
    svg.setAttribute("style", `position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;`);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke", "#555");      // etwas helleres Grau
    line.setAttribute("stroke-width", 1.5);   // dünner
    line.setAttribute("marker-end", "url(#arrowhead)");

    svg.appendChild(line);

    const defs = document.createElementNS(svgNS, "defs");
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "5");   // kleiner
    marker.setAttribute("markerHeight", "4");  // kleiner
    marker.setAttribute("refX", "5");
    marker.setAttribute("refY", "2");
    marker.setAttribute("orient", "auto");
    
    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "0 0, 5 2, 0 4"); // kleinere Spitze
    polygon.setAttribute("fill", "#555");             // dezentes Grau
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    container.appendChild(svg);
}


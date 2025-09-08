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
                    c2: formatForDisplay([step.c2])[0]
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
        // Jedes Literal in der Klausel umwandeln
        const formattedLiterals = clause.map(lit => {
            return lit.startsWith('!') ? '¬' + lit.substring(1) : lit;
        });
        return `{${formattedLiterals.join(', ')}}`;
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
        clauseList.innerHTML = '<strong>Bekannte Klauseln:</strong><br>' +
            level.clauses.map((c, i) => `<span class="clause" id="clause-${currentLevel}-${i}">${c}</span>`).join(', ');
        levelDiv.appendChild(clauseList);


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

    while (currentStep < level.steps.length) {
        const step = level.steps[currentStep];
        const li = document.createElement('li');
        li.className = `step ${step.type}`; // CSS-Klasse entspricht Backend-Typ

        li.innerHTML = `${step.c1} und ${step.c2} über ${step.literal}` +
            (step.type === 'cut_new' ? ` ===>  {${step.resolvent}}` : '');
        stepsDiv.appendChild(li);
        setTimeout(() => li.classList.add('visible'), 50);
        currentStep++;

        if (!showAll) return; // bei Einzel-Schritt sofort stoppen
    }

    // Alle Schritte eines Levels gezeigt → neue Resolventen oder Abschluss
    const levelDiv = document.getElementById(`level-${currentLevel}`);
    if (level.new_resolvents.length > 0) {
        const newRes = document.createElement('div');
        newRes.className = 'new-resolvent';
        newRes.textContent = 'Neue Resolventen: ' + level.new_resolvents.join(', ');
        levelDiv.appendChild(newRes);
    } else {
        const noNew = document.createElement('div');
        noNew.className = 'no-new';
        noNew.textContent = 'Keine neuen Klauseln mehr → Schnittregelabschluss vollständig';
        levelDiv.appendChild(noNew);
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

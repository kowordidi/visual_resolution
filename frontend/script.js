let allLevels = [];
let currentLevel = 0;
let currentStep = 0;
let showingLevel = false;

const sendBtn = document.getElementById('sendBtn');
const nextBtn = document.getElementById('nextBtn');
const showAllBtn = document.getElementById('showAllBtn');
const container = document.getElementById('resolution-container');

console.log('sendBtn.disabled', sendBtn.disabled);
console.log('nextBtn.disabled', nextBtn.disabled);
console.log('showAllBtn.disabled', showAllBtn.disabled);

window.addEventListener('DOMContentLoaded', () => {
    nextBtn.disabled = true;
    showAllBtn.disabled = true;
});


sendBtn.addEventListener('click', () => {
    const value = document.getElementById('userInput').value;
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
        allLevels = data;
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

function showNextStep(showAll = false) {
    if (!showingLevel) {
        const level = allLevels[currentLevel];
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-box';
        levelDiv.id = `level-${currentLevel}`;

        const levelTitle = document.createElement('h3');
        levelTitle.textContent = `Level ${level.level}`;
        levelDiv.appendChild(levelTitle);

        const clauseList = document.createElement('div');
        clauseList.className = 'clauses';
        clauseList.textContent = 'Klauseln: ' + level.clauses.map(c => `[${c.join(', ')}]`).join(', ');
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
        li.textContent = `[${step.c1.join(', ')}], [${step.c2.join(', ')}], literal: ${step.literal}, type: ${step.type}`;
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
        newRes.textContent = 'Neue Resolventen: ' + level.new_resolvents.map(c => `[${c.join(', ')}]`).join(', ');
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

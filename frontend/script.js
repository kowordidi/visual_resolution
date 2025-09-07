let allLevels = [];
let currentLevel = 0;
let currentStep = 0;
let showingLevel = false;

document.getElementById('sendBtn').addEventListener('click', () => {
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
        document.getElementById('resolution-container').innerHTML = '';
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('nextBtn').click(); // zeigt die erste Zeile schonmal
    })
    .catch(error => {
        console.error('Fehler:', error);
    });
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentLevel >= allLevels.length) {
        document.getElementById('nextBtn').disabled = true;
        alert("Alle Schritte abgeschlossen!");
        return;
    }

    const container = document.getElementById('resolution-container');

    if (!showingLevel) {
        // Neues Level starten
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
        return;
    }

    // Jetzt einen Schritt dieses Levels anzeigen
    const level = allLevels[currentLevel];
    const stepsDiv = document.getElementById(`steps-${currentLevel}`);

    if (currentStep < level.steps.length) {
        const step = level.steps[currentStep];
        const li = document.createElement('li');
        li.className = `step ${step.type}`;
        li.textContent = `[${step.c1.join(', ')}], [${step.c2.join(', ')}], literal: ${step.literal}, type: ${step.type}`;
        stepsDiv.appendChild(li);
        setTimeout(() => li.classList.add('visible'), 50);

        currentStep++;
        return;
    }

    // Alle Schritte sind angezeigt → neue Resolventen oder Abschluss
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
        document.getElementById('nextBtn').disabled = true;
    }
});
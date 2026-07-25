let turnIndex = 0,
    playerOrder = [],
    countdown;

// Add Player
function addPlayer() {
    let name = document.getElementById("newPlayer").value.trim();
    if (!name) return;
    let table = document.getElementById("scoreboard");
    let row = table.insertRow(-1);
    row.innerHTML = `
    <td>${name}</td>
    <td id="${name}-hearts">❤️❤️❤️</td>
    <td id="${name}-shield"></td>
    <td id="${name}-vp">⭐0</td>
    <td>
      <button onclick="addHeart('${name}-hearts')">+❤️</button>
      <button onclick="removeHeart('${name}-hearts')">-❤️</button>
      <button onclick="toggleShield('${name}-shield')">🛡️</button>
      <button onclick="addVP('${name}-vp')">+⭐</button>
      <button onclick="removeVP('${name}-vp')">-⭐</button>
    </td>`;
    document.getElementById("newPlayer").value = "";
    updateDropdowns();
    updateTurnOrder();
}

// Dropdowns
function updateDropdowns() {
    let s1 = document.getElementById("targetPlayer"),
        s2 = document.getElementById("targetPlayer2");
    s1.innerHTML = "";
    s2.innerHTML = "";
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        let name = rows[i].cells[0].textContent;
        let o1 = document.createElement("option");
        o1.value = name;
        o1.textContent = name;
        s1.appendChild(o1);
        let o2 = o1.cloneNode(true);
        s2.appendChild(o2);
    }
}

// Hearts, Shield, VP
function addHeart(id) { let c = document.getElementById(id); let h = (c.textContent.match(/❤️/g) || []).length; if (h < 5) c.textContent += "❤️"; }

function removeHeart(id) {
    let player = id.replace("-hearts", "");
    let shieldCell = document.getElementById(player + "-shield");
    let heartCell = document.getElementById(id);

    // If shield is active, consume it instead of losing a heart
    if (shieldCell.textContent === "🛡️") {
        shieldCell.textContent = "";
        alert(player + " blocked the attack with a shield!");
        return;
    }

    // Otherwise remove a heart
    let hearts = (heartCell.textContent.match(/❤️/g) || []).length;
    if (hearts > 0) heartCell.textContent = heartCell.textContent.slice(0, -2);
    if (hearts - 1 <= 0) markEliminated(player);
}


function toggleShield(id) {
    let c = document.getElementById(id);
    c.textContent = c.textContent ? "" : "🛡️";
}

function addVP(id) {
    let c = document.getElementById(id);
    let vp = parseInt(c.textContent.replace("⭐", ""));
    c.textContent = "⭐" + (vp + 1);
}

function removeVP(id) { let c = document.getElementById(id); let vp = parseInt(c.textContent.replace("⭐", "")); if (vp > 0) c.textContent = "⭐" + (vp - 1); }

// Elimination
function markEliminated(name) {
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].cells[0].textContent === name) { rows[i].classList.add("eliminated"); }
    }
    updateTurnOrder();
}

// Dice Effects
function cannonFire() { removeHeart(document.getElementById("targetPlayer").value + "-hearts"); }

function drinkRum() { addHeart(document.getElementById("targetPlayer").value + "-hearts"); }

function mutiny() {
    let p1 = document.getElementById("targetPlayer").value,
        p2 = document.getElementById("targetPlayer2").value;
    if (p1 === p2) return alert("Choose two different players!");
    let roll1 = Math.floor(Math.random() * 6) + 1,
        roll2 = Math.floor(Math.random() * 6) + 1;
    while (roll1 === roll2) {
        roll1 = Math.floor(Math.random() * 6) + 1;
        roll2 = Math.floor(Math.random() * 6) + 1;
    }
    if (roll1 < roll2) removeHeart(p1 + "-hearts");
    else removeHeart(p2 + "-hearts");
    alert(`${p1} rolled ${roll1}, ${p2} rolled ${roll2}`);
}

function shield() {
    toggleShield(document.getElementById("targetPlayer").value + "-shield");
}

function swapHearts() {
    let p1 = document.getElementById("targetPlayer").value,
        p2 = document.getElementById("targetPlayer2").value;
    if (p1 === p2) return alert("Choose two different players!");
    let h1 = document.getElementById(p1 + "-hearts").textContent,
        h2 = document.getElementById(p2 + "-hearts").textContent;
    document.getElementById(p1 + "-hearts").textContent = h2;
    document.getElementById(p2 + "-hearts").textContent = h1;
}

// Captain's Chaos
function chaosHealAll() {
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        addHeart(rows[i].cells[0].textContent + "-hearts");
    }
}

function chaosDamageAll() {
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        removeHeart(rows[i].cells[0].textContent + "-hearts");
    }
}

function chaosReverseOrder() {
    playerOrder.reverse();
    turnIndex = 0;
    showCurrentTurn();
}

function chaosLowestRoll() {
    let rows = document.querySelectorAll("#scoreboard tr");
    let lowest = 7,
        loser = null;
    for (let i = 1; i < rows.length; i++) {
        let name = rows[i].cells[0].textContent;
        let roll = Math.floor(Math.random() * 6) + 1;
        if (roll < lowest) {
            lowest = roll;
            loser = name;
        }
        alert(name + " rolled " + roll);
    }
    if (loser) removeHeart(loser + "-hearts");
}

function chaosSwapTwo() { swapHearts(); }

function chaosImmunity() { alert("All players immune until next turn!"); }

// Turn Order
function updateTurnOrder() {
    playerOrder = [];
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        let name = rows[i].cells[0].textContent;
        if (!rows[i].classList.contains("eliminated")) playerOrder.push(name);
    }
    turnIndex = 0;
    showCurrentTurn();
}

function showCurrentTurn() {
    let display = document.getElementById("turnOrder");
    if (playerOrder.length === 0) { display.textContent = "No players yet."; return; }
    let current = playerOrder[turnIndex];
    display.textContent = "Current Turn: " + current;
    highlightRow(current);
}

function highlightRow(name) {
    let rows = document.querySelectorAll("#scoreboard tr");
    for (let i = 1; i < rows.length; i++) {
        rows[i].classList.remove("activeTurn");
        if (rows[i].cells[0].textContent === name) rows[i].classList.add("activeTurn");
    }
}

function nextTurn() {
    if (playerOrder.length === 0) return;
    turnIndex++;
    if (turnIndex >= playerOrder.length) turnIndex = 0;
    showCurrentTurn();
}

function logEvent(message) {
    let log = document.getElementById("gameLog");
    let entry = document.createElement("div");
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight; // auto-scroll to latest
}

function cannonFire() {
    let target = document.getElementById("targetPlayer").value;
    removeHeart(target + "-hearts");
    logEvent("💥 Cannon Fire hit " + target);
}

function drinkRum() {
    let target = document.getElementById("targetPlayer").value;
    addHeart(target + "-hearts");
    logEvent("🍺 " + target + " drank rum and gained +❤️");
}

function mutiny() {
    let p1 = document.getElementById("targetPlayer").value,
        p2 = document.getElementById("targetPlayer2").value;
    if (p1 === p2) return logEvent("⚠️ Mutiny failed: same player chosen");

    let roll1 = Math.floor(Math.random() * 6) + 1,
        roll2 = Math.floor(Math.random() * 6) + 1;
    while (roll1 === roll2) {
        roll1 = Math.floor(Math.random() * 6) + 1;
        roll2 = Math.floor(Math.random() * 6) + 1;
    }

    logEvent(`⚔️ Mutiny! ${p1} rolled ${roll1}, ${p2} rolled ${roll2}`);
    if (roll1 < roll2) { removeHeart(p1 + "-hearts");
        logEvent(`${p1} lost a ❤️`); } else { removeHeart(p2 + "-hearts");
        logEvent(`${p2} lost a ❤️`); }
}


// Timer
function startTimer() {
    clearInterval(countdown);
    if (playerOrder.length === 0) return;
    let time = parseInt(document.getElementById("timerLength").value);
    let current = playerOrder[turnIndex];
    document.getElementById("timer").textContent = current + "'s Turn: " + time + "s";
    countdown = setInterval(() => {
        time--;
        document.getElementById("timer").textContent = current + "'s Turn: " + time + "s";
        if (time <= 0) {
            clearInterval(countdown);
            document.getElementById("timer").textContent = "⏰ " + current + " ran out of time!";
            nextTurn();
        }
    }, 1000);
}

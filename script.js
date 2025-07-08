const searchInput = document.getElementById("search");
const suggestionsEl = document.getElementById("suggestions");
const viewer = document.getElementById("monster-viewer");

searchInput.addEventListener("input", () => {
  const input = searchInput.value.trim().toLowerCase();
  suggestionsEl.innerHTML = "";

  if (!input) return;

  const matches = monsterNames.filter(name => name.startsWith(input));
  matches.slice(0, 10).forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => {
      searchInput.value = name;
      suggestionsEl.innerHTML = "";
      loadMonster(name);
    });
    suggestionsEl.appendChild(li);
  });
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const name = searchInput.value.trim().toLowerCase();
    suggestionsEl.innerHTML = "";
    loadMonster(name);
  }
});

async function loadMonster(name) {
  if (!name) return;
  try {
    const res = await fetch(`monster-data/${name}.json`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    renderMonster(data);
  } catch (err) {
    viewer.innerHTML = `<p>Monster not found.</p>`;
  }
}
async function loadSpell(name) {
  const filename = name.toLowerCase().replace(/ /g, "_");
  try {
    const res = await fetch(`spells/${filename}.json`);
    if (!res.ok) throw new Error("Spell not found");
    const spell = await res.json();
    renderSpell(spell);
  } catch (err) {
    document.getElementById("spell-viewer").innerHTML = `<p>Spell not found.</p>`;
  }
}

function renderSpell(spell) {
  const spellViewer = document.getElementById("spell-viewer");
  const viewer = document.getElementById("monster-viewer");

  spellViewer.innerHTML = `
    <div class="spell-content">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>${spell.name}</h2>
        <button id="close-spell" style="background: none; border: none; color: #aaa; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      <p><strong>ID:</strong> ${spell.id}</p>
      <p><strong>Skill Type:</strong> ${spell.skillType}</p>
      <p><strong>Target Type:</strong> ${spell.targetType}</p>
      <p><strong>Action Type:</strong> ${spell.actionType}</p>
      <p><strong>Animation Type:</strong> ${spell.animationType}</p>
      <p><strong>Cost:</strong></p>
      <ul>
        ${Object.entries(spell.cost || {}).map(([k, v]) => `<li>${k}: ${v}</li>`).join("")}
      </ul>
    </div>
  `;

  // Animate in
  viewer.classList.add("spell-open");

  // Close handler
  document.getElementById("close-spell").addEventListener("click", () => {
    viewer.classList.remove("spell-open");
    spellViewer.innerHTML = "";
  });
}


function closeSpell() {
  const viewer = document.getElementById("spell-viewer");
  viewer.style.display = "none";
  viewer.innerHTML = ""; // optional: clear content too
}


function renderMonster(monster) {
  const { name, id, description, stats = {}, linked = {} } = monster;

  const viewer = document.getElementById("monster-viewer");
  const monsterEl = viewer.querySelector(".monster-entry");
  const spellViewer = viewer.querySelector("#spell-viewer");

  viewer.classList.remove("spell-open"); // Hide spell view if showing

  monsterEl.innerHTML = `
    <h2>${name}</h2>
    <p class="id">ID: ${id}</p>
    <p class="desc">${description}</p>

    <div class="stat-block">
      <h3>Stats</h3>
      <ul>
        ${Object.entries(stats).map(([key, val]) => `<li><strong>${formatStat(key)}:</strong> ${val}</li>`).join("")}
      </ul>
    </div>

    ${Object.entries(linked).map(([category, entries]) => {
      if (!entries.length) return "";
      return `
        <div class="linked-group">
          <h3>${capitalize(category)}</h3>
          <ul>
            ${entries.map(entry => {
              const displayName = entry.name;
              const description = entry.description || "";
              const isSpell = category.toLowerCase() === "spells";
              const linkedName = isSpell
                ? `<a href="#" class="spell-link" data-spell="${displayName}">${displayName}</a>`
                : displayName;

              return `<li><strong>${linkedName}</strong>: ${description}</li>`;
            }).join("")}
          </ul>
        </div>
      `;
    }).join("")}
  `;

  document.querySelectorAll(".spell-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loadSpell(link.dataset.spell);
    });
  });
}


function formatStat(stat) {
  return stat
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, str => str.toUpperCase());
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderLinked(linked = {}) {
  return Object.entries(linked)
    .filter(([_, list]) => list.length)
    .map(([type, entries]) => `
      <div class="linked-group">
        <h3>${type}</h3>
        ${entries.map(e => `
          <div class="linked-item">
            <strong>${e.name}</strong>: ${e.description}
          </div>
        `).join("")}
      </div>
    `).join("");
}

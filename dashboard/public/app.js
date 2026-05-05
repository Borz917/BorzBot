let dashboardData = null;
let currentPage = 'overview';

const content = document.getElementById('content');
const pageTitle = document.getElementById('page-title');
const refreshBtn = document.getElementById('refreshBtn');
const navButtons = document.querySelectorAll('.nav-btn');

// =========================
// UTILS
// =========================
function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatLogDescription(text) {
  return escapeHtml(text)
    .replaceAll('**', '')
    .replaceAll('\n', '<br>');
}

function countObjectItems(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.keys(obj).length;
}

function countNestedUsers(obj) {
  if (!obj || typeof obj !== 'object') return 0;

  let total = 0;

  for (const guildId of Object.keys(obj)) {
    const guildData = obj[guildId];

    if (guildData && typeof guildData === 'object') {
      total += Object.keys(guildData).length;
    }
  }

  return total;
}

function setTitle(title) {
  pageTitle.textContent = title;
}

function showMessage(type, message) {
  const className = type === 'success' ? 'success-message' : 'error-message';

  content.insertAdjacentHTML(
    'afterbegin',
    `<div class="${className}">${escapeHtml(message)}</div>`
  );

  setTimeout(() => {
    const msg = document.querySelector(`.${className}`);
    if (msg) msg.remove();
  }, 3500);
}

async function apiPost(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {})
  });

  return response.json();
}

// =========================
// FETCH
// =========================
async function fetchMe() {
  try {
    const response = await fetch('/api/me');

    if (!response.ok) {
      throw new Error('Impossible de récupérer l’utilisateur connecté.');
    }

    const me = await response.json();

    const badge = document.getElementById('userBadge');
    if (badge) {
      badge.textContent = `Connecté : ${me.username}`;
    }
  } catch (error) {
    console.error('Erreur /api/me :', error);

    const badge = document.getElementById('userBadge');
    if (badge) {
      badge.textContent = 'Connecté';
    }
  }
}

async function fetchData(options = {}) {
  const silent = options.silent === true;

  try {
    if (!silent) {
      content.innerHTML = `<div class="empty">Chargement...</div>`;
    }

    const response = await fetch('/api/all');

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erreur API /api/all : ${response.status} ${text}`);
    }

    dashboardData = await response.json();

    renderPage(currentPage);
  } catch (error) {
    console.error(error);

    if (!silent) {
      content.innerHTML = `
        <div class="error-message">
          ❌ Impossible de charger les données du dashboard.<br>
          Vérifie la console VS Code et l’URL <strong>/api/all</strong>.
        </div>
      `;
    }
  }
}

// =========================
// ROUTER
// =========================
function renderPage(page) {
  currentPage = page;

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  if (!dashboardData) {
    content.innerHTML = `<div class="empty">Chargement...</div>`;
    return;
  }

  if (page === 'overview') return renderOverview();
  if (page === 'staff') return renderStaff();
  if (page === 'warns') return renderWarns();
  if (page === 'invites') return renderInvites();
  if (page === 'giveaways') return renderGiveaways();
  if (page === 'config') return renderConfig();
  if (page === 'security') return renderSecurity();
  if (page === 'logs') return renderLogs();

  content.innerHTML = `<div class="empty">Page introuvable.</div>`;
}

// =========================
// OVERVIEW
// =========================
function renderOverview() {
  setTitle('Vue générale');

  const warnsUsers = countObjectItems(dashboardData.warns);
  const staffUsers = countNestedUsers(dashboardData.staffStats);
  const inviteUsers = countNestedUsers(dashboardData.invites);
  const guildConfigs = countObjectItems(dashboardData.serverConfigs);
  const logsCount = getAllLogs().length;

  content.innerHTML = `
    <div class="grid">
      <div class="card">
        <h3>Utilisateurs warn</h3>
        <div class="number">${warnsUsers}</div>
      </div>

      <div class="card">
        <h3>Staffs avec stats</h3>
        <div class="number">${staffUsers}</div>
      </div>

      <div class="card">
        <h3>Inviteurs suivis</h3>
        <div class="number">${inviteUsers}</div>
      </div>

      <div class="card">
        <h3>Serveurs configurés</h3>
        <div class="number">${guildConfigs}</div>
      </div>

      <div class="card">
        <h3>Logs enregistrés</h3>
        <div class="number">${logsCount}</div>
      </div>
    </div>
  `;
}

// =========================
// STAFF
// =========================
function renderStaff() {
  setTitle('Staff stats');

  const data = dashboardData.staffStats || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    for (const userId of Object.keys(data[guildId] || {})) {
      const stats = data[guildId][userId] || {};

      rows.push(`
        <tr>
          <td>${escapeHtml(guildId)}</td>
          <td>${escapeHtml(userId)}</td>
          <td>${stats.warns || 0}</td>
          <td>${stats.mutes || 0}</td>
          <td>${stats.bans || 0}</td>
          <td>${stats.kicks || 0}</td>
          <td>${stats.ticketClaims || 0}</td>
          <td>${stats.ticketCloses || 0}</td>
          <td><strong>${stats.total || 0}</strong></td>
          <td>
            <button class="action-btn danger-btn" onclick="resetStaffUser('${escapeHtml(guildId)}', '${escapeHtml(userId)}')">
              Reset
            </button>
          </td>
        </tr>
      `);
    }
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucune stat staff enregistrée.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Serveur ID</th>
            <th>Staff ID</th>
            <th>Warns</th>
            <th>Mutes</th>
            <th>Bans</th>
            <th>Kicks</th>
            <th>Claims</th>
            <th>Closes</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

async function resetStaffUser(guildId, userId) {
  const confirmReset = confirm(`Reset les stats de ${userId} ?`);
  if (!confirmReset) return;

  const result = await apiPost('/api/staffstats/reset', {
    guildId,
    userId
  });

  if (result.success) {
    await fetchData({ silent: true });
    showMessage('success', result.message);
  } else {
    showMessage('error', result.message || 'Erreur reset staff.');
  }
}

// =========================
// WARNS
// =========================
function renderWarns() {
  setTitle('Warns');

  const data = dashboardData.warns || {};
  const rows = [];

  for (const userId of Object.keys(data)) {
    const warns = Array.isArray(data[userId]) ? data[userId] : [];

    rows.push(`
      <tr>
        <td>${escapeHtml(userId)}</td>
        <td>${warns.length}</td>
        <td>
          ${warns.map(w => `
            <div class="badge">${escapeHtml(w.reason || 'Sans raison')}</div>
          `).join('')}
        </td>
      </tr>
    `);
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucun warn enregistré.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Utilisateur ID</th>
            <th>Total</th>
            <th>Raisons</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

// =========================
// INVITES
// =========================
function renderInvites() {
  setTitle('Invitations');

  const data = dashboardData.invites || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    for (const inviterId of Object.keys(data[guildId] || {})) {
      const inviteData = data[guildId][inviterId] || {};

      rows.push(`
        <tr>
          <td>${escapeHtml(guildId)}</td>
          <td>${escapeHtml(inviterId)}</td>
          <td>${inviteData.total || 0}</td>
          <td>${(inviteData.users || []).map(id => `<span class="badge">${escapeHtml(id)}</span>`).join('')}</td>
        </tr>
      `);
    }
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucune invitation enregistrée.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Serveur ID</th>
            <th>Inviteur ID</th>
            <th>Total</th>
            <th>Invités</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

// =========================
// GIVEAWAYS
// =========================
function renderGiveaways() {
  setTitle('Giveaways');

  const data = dashboardData.giveaways || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    const giveaways = Array.isArray(data[guildId]) ? data[guildId] : [];

    for (const giveaway of giveaways) {
      rows.push(`
        <tr>
          <td>${escapeHtml(guildId)}</td>
          <td>${escapeHtml(giveaway.id)}</td>
          <td>${escapeHtml(giveaway.name)}</td>
          <td>${escapeHtml(giveaway.reward)}</td>
          <td>${giveaway.invitesRequired || 0}</td>
          <td>${escapeHtml(giveaway.createdBy)}</td>
          <td>
            <button class="action-btn danger-btn" onclick="deleteGiveaway('${escapeHtml(guildId)}', '${escapeHtml(giveaway.id)}')">
              Supprimer
            </button>
          </td>
        </tr>
      `);
    }
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucun giveaway actif.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Serveur ID</th>
            <th>ID</th>
            <th>Nom</th>
            <th>Récompense</th>
            <th>Invites requises</th>
            <th>Créé par</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

async function deleteGiveaway(guildId, giveawayId) {
  const confirmDelete = confirm(`Supprimer le giveaway ${giveawayId} ?`);
  if (!confirmDelete) return;

  const result = await apiPost('/api/giveaways/delete', {
    guildId,
    giveawayId
  });

  if (result.success) {
    await fetchData({ silent: true });
    showMessage('success', result.message);
  } else {
    showMessage('error', result.message || 'Erreur suppression giveaway.');
  }
}

// =========================
// CONFIG
// =========================
function renderConfig() {
  setTitle('Configuration');

  const data = dashboardData.serverConfigs || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    rows.push(`
      <div class="card">
        <h3>Serveur : ${escapeHtml(guildId)}</h3>
        <pre>${escapeHtml(JSON.stringify(data[guildId], null, 2))}</pre>
      </div>
    `);
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucune configuration serveur.</div>`;
    return;
  }

  content.innerHTML = `<div class="grid">${rows.join('')}</div>`;
}

// =========================
// SECURITY
// =========================
function renderSecurity() {
  setTitle('Sécurité');

  const configs = dashboardData.serverConfigs || {};
  const rows = [];

  for (const guildId of Object.keys(configs)) {
    const config = configs[guildId] || {};
    const security = config.security || {};
    const antiSpam = security.antiSpam || {};
    const antiLink = security.antiLink || {};
    const raid = config.raid || {};

    rows.push(`
      <div class="card">
        <h3>Serveur : ${escapeHtml(guildId)}</h3>

        <p><strong>Anti-spam :</strong> ${antiSpam.enabled ? '✅ Activé' : '❌ Désactivé'}</p>
        <p>Max messages : ${antiSpam.maxMessages || 'N/A'}</p>
        <p>Intervalle : ${antiSpam.intervalMs ? antiSpam.intervalMs / 1000 + 's' : 'N/A'}</p>
        <p>Timeout : ${antiSpam.timeoutMs ? antiSpam.timeoutMs / 60000 + ' min' : 'N/A'}</p>

        <hr>

        <p><strong>Anti-link :</strong> ${antiLink.enabled ? '✅ Activé' : '❌ Désactivé'}</p>
        <p>Timeout : ${antiLink.timeoutMs ? antiLink.timeoutMs / 60000 + ' min' : 'N/A'}</p>
        <p>Domaines autorisés :</p>
        <pre>${escapeHtml(JSON.stringify(antiLink.allowedDomains || [], null, 2))}</pre>

        <hr>

        <p><strong>Anti-raid :</strong> ${raid.enabled ? '✅ Activé' : '❌ Désactivé'}</p>
        <p>Joins limite : ${raid.joinsLimit || 'N/A'}</p>
        <p>Intervalle : ${raid.intervalMs ? raid.intervalMs / 1000 + 's' : 'N/A'}</p>
        <p>Action : ${escapeHtml(raid.action || 'N/A')}</p>
      </div>
    `);
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucune configuration sécurité.</div>`;
    return;
  }

  content.innerHTML = `<div class="grid">${rows.join('')}</div>`;
}

// =========================
// LOGS V4
// =========================
function getAllLogs() {
  const data = dashboardData.dashboardLogs || {};
  const logs = [];

  for (const guildId of Object.keys(data)) {
    const guildLogs = Array.isArray(data[guildId]) ? data[guildId] : [];

    for (const log of guildLogs) {
      logs.push({
        guildId,
        id: log.id || 'unknown',
        type: log.type || 'other',
        title: log.title || 'Log',
        description: log.description || 'Aucune description.',
        createdAt: log.createdAt || new Date().toISOString()
      });
    }
  }

  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderLogs() {
  setTitle('Logs');

  const logs = getAllLogs();

  if (!logs.length) {
    content.innerHTML = `
      <div class="empty">
        Aucun log enregistré pour le moment.
      </div>
    `;
    return;
  }

  const types = [...new Set(logs.map(log => log.type || 'other'))];
  const guilds = [...new Set(logs.map(log => log.guildId))];

  content.innerHTML = `
    <div class="log-filters">
      <input id="logSearch" type="text" placeholder="Rechercher un utilisateur, salon, action..." />

      <select id="logGuild">
        <option value="all">Tous les serveurs</option>
        ${guilds.map(guildId => `<option value="${escapeHtml(guildId)}">${escapeHtml(guildId)}</option>`).join('')}
      </select>

      <select id="logType">
        <option value="all">Tous les types</option>
        ${types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('')}
      </select>

      <button class="action-btn" onclick="applyLogFilters()">Filtrer</button>
      <button class="action-btn" onclick="resetLogFilters()">Reset</button>

      <a class="action-btn export-btn" href="/api/logs/export/json" target="_blank">Export JSON</a>
      <a class="action-btn export-btn" href="/api/logs/export/txt" target="_blank">Export TXT</a>

      <button class="action-btn danger-btn" onclick="clearAllLogs()">Vider tout</button>
    </div>

    <div class="log-stats">
      <div class="log-stat-card">
        <span>Total logs</span>
        <strong>${logs.length}</strong>
      </div>

      <div class="log-stat-card">
        <span>Serveurs</span>
        <strong>${guilds.length}</strong>
      </div>

      <div class="log-stat-card">
        <span>Types</span>
        <strong>${types.length}</strong>
      </div>
    </div>

    <div id="logsList" class="logs-list"></div>
  `;

  renderLogsList(logs);
}

function renderLogsList(logs) {
  const logsList = document.getElementById('logsList');

  if (!logsList) return;

  logsList.className = 'logs-list';

  if (!logs.length) {
    logsList.innerHTML = `<div class="empty">Aucun log ne correspond aux filtres.</div>`;
    return;
  }

  logsList.innerHTML = logs.slice(0, 150).map(log => {
    const date = log.createdAt
      ? new Date(log.createdAt).toLocaleString('fr-FR')
      : 'Date inconnue';

    return `
      <article class="log-card">
        <div class="log-head">
          <div>
            <h3>${escapeHtml(log.title)}</h3>
            <div class="log-meta">
              <span>Serveur : <strong>${escapeHtml(log.guildId)}</strong></span>
              <span>Date : <strong>${escapeHtml(date)}</strong></span>
            </div>
          </div>

          <div class="log-actions">
            <span class="log-type">${escapeHtml(log.type)}</span>
            <button class="small-danger-btn" onclick="deleteOneLog('${escapeHtml(log.guildId)}', '${escapeHtml(log.id)}')">
              Supprimer
            </button>
          </div>
        </div>

        <div class="log-description">
          ${formatLogDescription(log.description)}
        </div>
      </article>
    `;
  }).join('');
}

function getFilteredLogs() {
  const search = document.getElementById('logSearch')?.value.toLowerCase().trim() || '';
  const type = document.getElementById('logType')?.value || 'all';
  const guild = document.getElementById('logGuild')?.value || 'all';

  let logs = getAllLogs();

  if (guild !== 'all') {
    logs = logs.filter(log => log.guildId === guild);
  }

  if (type !== 'all') {
    logs = logs.filter(log => log.type === type);
  }

  if (search) {
    logs = logs.filter(log => {
      const fullText = `${log.title} ${log.description} ${log.guildId} ${log.type}`.toLowerCase();
      return fullText.includes(search);
    });
  }

  return logs;
}

function applyLogFilters() {
  const logs = getFilteredLogs();
  renderLogsList(logs);
}

function resetLogFilters() {
  const search = document.getElementById('logSearch');
  const type = document.getElementById('logType');
  const guild = document.getElementById('logGuild');

  if (search) search.value = '';
  if (type) type.value = 'all';
  if (guild) guild.value = 'all';

  renderLogsList(getAllLogs());
}

async function deleteOneLog(guildId, logId) {
  const confirmDelete = confirm('Supprimer ce log ?');
  if (!confirmDelete) return;

  const result = await apiPost('/api/logs/delete', {
    guildId,
    logId
  });

  if (result.success) {
    await fetchData({ silent: true });
    showMessage('success', result.message);
  } else {
    showMessage('error', result.message || 'Erreur suppression log.');
  }
}

async function clearAllLogs() {
  const confirmClear = confirm('Supprimer tous les logs du dashboard ?');
  if (!confirmClear) return;

  const result = await apiPost('/api/logs/clear', {});

  if (result.success) {
    await fetchData({ silent: true });
    showMessage('success', result.message);
  } else {
    showMessage('error', result.message || 'Erreur suppression logs.');
  }
}
// =========================
// EVENTS
// =========================
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    renderPage(btn.dataset.page);
  });
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => fetchData());
}

fetchMe();
fetchData();

setInterval(() => {
  fetchData({ silent: true });
}, 15000);
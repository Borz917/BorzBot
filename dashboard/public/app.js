let dashboardData = null;
let currentPage = 'overview';

const content = document.getElementById('content');
const pageTitle = document.getElementById('page-title');
const refreshBtn = document.getElementById('refreshBtn');
const navButtons = document.querySelectorAll('.nav-btn');

async function fetchData() {
  const response = await fetch('/api/all');
  dashboardData = await response.json();
  renderPage(currentPage);
}

async function fetchMe() {
  try {
    const response = await fetch('/api/me');
    const me = await response.json();

    const badge = document.getElementById('userBadge');
    if (badge) {
      badge.textContent = `Connecté : ${me.username}`;
    }
  } catch {
    const badge = document.getElementById('userBadge');
    if (badge) {
      badge.textContent = 'Connecté';
    }
  }
}

function countObjectItems(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.keys(obj).length;
}

function countNestedUsers(obj) {
  if (!obj || typeof obj !== 'object') return 0;

  let total = 0;

  for (const guildId of Object.keys(obj)) {
    total += Object.keys(obj[guildId] || {}).length;
  }

  return total;
}

function setTitle(title) {
  pageTitle.textContent = title;
}

function renderPage(page) {
  currentPage = page;

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  if (!dashboardData) {
    content.innerHTML = `<div class="empty">Chargement...</div>`;
    return;
  }

  if (page === 'overview') renderOverview();
  if (page === 'staff') renderStaff();
  if (page === 'warns') renderWarns();
  if (page === 'invites') renderInvites();
  if (page === 'giveaways') renderGiveaways();
  if (page === 'config') renderConfig();
}

function renderOverview() {
  setTitle('Vue générale');

  const warnsUsers = countNestedUsers(dashboardData.warns);
  const staffUsers = countNestedUsers(dashboardData.staffStats);
  const inviteUsers = countNestedUsers(dashboardData.invites);
  const guildConfigs = countObjectItems(dashboardData.serverConfigs);

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
    </div>
  `;
}

function renderStaff() {
  setTitle('Staff stats');

  const data = dashboardData.staffStats || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    for (const userId of Object.keys(data[guildId])) {
      const stats = data[guildId][userId];

      rows.push(`
        <tr>
          <td>${guildId}</td>
          <td>${userId}</td>
          <td>${stats.warns || 0}</td>
          <td>${stats.mutes || 0}</td>
          <td>${stats.bans || 0}</td>
          <td>${stats.kicks || 0}</td>
          <td>${stats.ticketClaims || 0}</td>
          <td>${stats.ticketCloses || 0}</td>
          <td><strong>${stats.total || 0}</strong></td>
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
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function renderWarns() {
  setTitle('Warns');

  const data = dashboardData.warns || {};
  const rows = [];

  for (const userId of Object.keys(data)) {
    const warns = Array.isArray(data[userId]) ? data[userId] : [];

    rows.push(`
      <tr>
        <td>${userId}</td>
        <td>${warns.length}</td>
        <td>
          ${warns.map(w => `
            <div class="badge">${w.reason || 'Sans raison'}</div>
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

function renderInvites() {
  setTitle('Invitations');

  const data = dashboardData.invites || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    for (const inviterId of Object.keys(data[guildId])) {
      const inviteData = data[guildId][inviterId];

      rows.push(`
        <tr>
          <td>${guildId}</td>
          <td>${inviterId}</td>
          <td>${inviteData.total || 0}</td>
          <td>${(inviteData.users || []).map(id => `<span class="badge">${id}</span>`).join('')}</td>
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

function renderGiveaways() {
  setTitle('Giveaways');

  const data = dashboardData.giveaways || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    const giveaways = Array.isArray(data[guildId]) ? data[guildId] : [];

    for (const giveaway of giveaways) {
      rows.push(`
        <tr>
          <td>${guildId}</td>
          <td>${giveaway.id}</td>
          <td>${giveaway.name}</td>
          <td>${giveaway.reward}</td>
          <td>${giveaway.invitesRequired}</td>
          <td>${giveaway.createdBy}</td>
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
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function renderConfig() {
  setTitle('Configuration');

  const data = dashboardData.serverConfigs || {};
  const rows = [];

  for (const guildId of Object.keys(data)) {
    rows.push(`
      <div class="card">
        <h3>Serveur : ${guildId}</h3>
        <pre>${JSON.stringify(data[guildId], null, 2)}</pre>
      </div>
    `);
  }

  if (!rows.length) {
    content.innerHTML = `<div class="empty">Aucune configuration serveur.</div>`;
    return;
  }

  content.innerHTML = `<div class="grid">${rows.join('')}</div>`;
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    renderPage(btn.dataset.page);
  });
});

refreshBtn.addEventListener('click', fetchData);

fetchMe();
fetchData();
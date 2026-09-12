// The London Salon - Staff Operations Portal Engine

(function() {
  'use strict';

  const STORAGE_KEY = 'tls_appointments';

  const sampleData = [
    {
      id: 'TLS-8921',
      name: 'Swathi Reddy',
      phone: '081717 17579',
      service: 'French Balayage & Gloss',
      stylist: 'Sophia Roy',
      date: 'Today',
      time: '11:30 AM',
      price: '₹2,499',
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    },
    {
      id: 'TLS-7412',
      name: 'Kiran Kumar',
      phone: '081717 17579',
      service: "Men's Executive Grooming",
      stylist: 'Vikram Singh',
      date: 'Today',
      time: '02:00 PM',
      price: '₹499',
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    },
    {
      id: 'TLS-6320',
      name: 'Anusha Devi',
      phone: '081717 17579',
      service: 'Cellular Gold Facial',
      stylist: 'Priyanka Sharma',
      date: 'Tomorrow',
      time: '10:00 AM',
      price: '₹1,499',
      status: 'Completed',
      timestamp: new Date().toISOString()
    },
    {
      id: 'TLS-5104',
      name: 'Arjun Varma',
      phone: '081717 17579',
      service: 'Precision Hair Architecture',
      stylist: 'Arjun Mehta',
      date: 'Tomorrow',
      time: '04:30 PM',
      price: '₹1,500',
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    }
  ];

  function getAppointments() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      return sampleData;
    }
    try {
      return JSON.parse(raw);
    } catch(e) {
      return sampleData;
    }
  }

  function saveAppointments(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    render();
  }

  // --- Auth Gate ---
  const authOverlay = document.getElementById('auth-overlay');
  const authInput = document.getElementById('auth-code');
  const authBtn = document.getElementById('btn-auth-login');
  const logoutBtn = document.getElementById('btn-logout');

  function checkAuth() {
    if (sessionStorage.getItem('tls_admin_auth') === 'true') {
      authOverlay.style.display = 'none';
    } else {
      authOverlay.style.display = 'flex';
    }
  }

  if (authBtn) {
    authBtn.addEventListener('click', () => {
      const val = authInput.value.trim().toLowerCase();
      if (val === 'londonsalon' || val === 'admin123' || val === 'admin') {
        sessionStorage.setItem('tls_admin_auth', 'true');
        authOverlay.style.display = 'none';
      } else {
        alert('Invalid Passcode. Enter londonsalon to access.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('tls_admin_auth');
      checkAuth();
    });
  }

  // --- Rendering Dashboard ---
  let activeFilter = 'all';
  let searchQuery = '';

  function render() {
    const all = getAppointments();
    
    // Stats calculation
    let total = all.length;
    let confirmed = 0;
    let completed = 0;
    let revenue = 0;

    all.forEach(app => {
      if (app.status === 'Confirmed') confirmed++;
      if (app.status === 'Completed') completed++;
      const numericPrice = parseInt(String(app.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      if (app.status !== 'Cancelled') revenue += numericPrice;
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-confirmed').textContent = confirmed;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
    document.getElementById('count-all').textContent = total;

    // Filter and search
    const filtered = all.filter(app => {
      const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        app.name.toLowerCase().includes(q) ||
        app.phone.includes(q) ||
        app.service.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    const tbody = document.getElementById('appointments-tbody');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--muted);">No matching appointments found.</td></tr>';
      return;
    }

    filtered.forEach(app => {
      const tr = document.createElement('tr');
      const statusClass = 'status-' + (app.status || 'pending').toLowerCase();

      tr.innerHTML = `
        <td style="font-family:'Space Mono'; font-weight:700; color:var(--gold-light);">${app.id}</td>
        <td><strong>${app.name}</strong></td>
        <td><a href="tel:${app.phone}" style="color:var(--gold-light); text-decoration:none;">${app.phone}</a></td>
        <td>${app.service}</td>
        <td><em>${app.stylist}</em></td>
        <td>${app.date} • ${app.time}</td>
        <td style="font-family:'Space Mono';">${app.price || '₹1,500'}</td>
        <td><span class="status-badge ${statusClass}">${app.status}</span></td>
        <td>
          <button class="btn-table-action" onclick="window.updateStatus('${app.id}', 'Completed')">Complete</button>
          <button class="btn-table-action" onclick="window.updateStatus('${app.id}', 'Cancelled')">Cancel</button>
          <a href="https://wa.me/91${(app.phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(app.name)},%20this%20is%20The%20London%20Salon%20Anantapur%20confirming%20your%20appointment%20#${app.id}." target="_blank" class="btn-table-action" style="text-decoration:none;">WhatsApp</a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.updateStatus = function(id, newStatus) {
    const all = getAppointments();
    const target = all.find(a => a.id === id);
    if (target) {
      target.status = newStatus;
      saveAppointments(all);
    }
  };

  // --- Filter Tabs ---
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  // --- Search Box ---
  const searchBox = document.getElementById('search-box');
  if (searchBox) {
    searchBox.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  // --- Add Walk-in ---
  const walkinBtn = document.getElementById('btn-add-walkin');
  if (walkinBtn) {
    walkinBtn.addEventListener('click', () => {
      const name = prompt('Client Name:');
      if (!name) return;
      const service = prompt('Service (e.g. Precision Haircut & Style):', 'Precision Haircut & Style');
      const phone = prompt('Contact Number:', '081717 17579');
      const price = prompt('Price (e.g. ₹1,500):', '₹1,500');

      const all = getAppointments();
      const newApp = {
        id: 'TLS-' + Math.floor(1000 + Math.random() * 9000),
        name: name,
        phone: phone || '081717 17579',
        service: service || 'Precision Haircut & Style',
        stylist: 'Arjun Mehta',
        date: 'Today',
        time: 'Walk-In Now',
        price: price || '₹1,500',
        status: 'Confirmed',
        timestamp: new Date().toISOString()
      };
      all.unshift(newApp);
      saveAppointments(all);
    });
  }

  // --- Export Data ---
  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = getAppointments();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `London_Salon_Bookings_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    });
  }

  checkAuth();
  render();

})();

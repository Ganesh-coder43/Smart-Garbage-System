function getReportCount() {
  return Number(localStorage.getItem('reportCount') || 0);
}

function setReportCount(count) {
  localStorage.setItem('reportCount', String(count));
}

function getUserCreditsMap() {
  try {
    return JSON.parse(localStorage.getItem('userCredits') || '{}');
  } catch (error) {
    return {};
  }
}

function saveUserCreditsMap(map) {
  localStorage.setItem('userCredits', JSON.stringify(map));
}

function getCreditsForUser(userContact) {
  const map = getUserCreditsMap();
  return Number(map[userContact] || 0);
}

function addCreditsForUser(userContact, amount) {
  if (!userContact) return 0;
  const map = getUserCreditsMap();
  map[userContact] = Number(map[userContact] || 0) + Number(amount);
  saveUserCreditsMap(map);
  return map[userContact];
}

function ensureUserCredits(userContact) {
  if (!userContact) return 0;
  const map = getUserCreditsMap();
  if (!(userContact in map)) {
    map[userContact] = 0;
    saveUserCreditsMap(map);
  }
  return Number(map[userContact] || 0);
}

function getReports() {
  return JSON.parse(localStorage.getItem('reports') || '[]');
}

function setReports(reports) {
  localStorage.setItem('reports', JSON.stringify(reports));
}

function updateReportCountElements() {
  const count = getReportCount();
  const homeCount = document.getElementById('reportCount');
  const homeCard = document.getElementById('reportCountCard');
  const pageCount = document.getElementById('pageCount');

  if (homeCount) {
    homeCount.textContent = `${count} people have shared garbage reports so far.`;
  }
  if (homeCard) {
    homeCard.textContent = count;
  }
  if (pageCount) {
    pageCount.textContent = `${count} people have already reported garbage.`;
  }
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  const reports = getReports();

  if (!historyList) return;
  if (reports.length === 0) {
    historyList.innerHTML = '<p>No reports yet. Submit one to see it here.</p>';
    return;
  }

  historyList.innerHTML = reports.map(report => {
    return `
      <div class="history-item">
        <strong>${report.location}</strong>
        <p>${report.details}</p>
        ${report.image ? `<img src="${report.image}" alt="Report photo" style="max-width:120px;max-height:120px;border-radius:10px;margin:10px 0;">` : ''}
        <div><b>Reward:</b> ${report.price ? report.price + ' ₹' : 'N/A'}</div>
        <small>${report.date}</small>
      </div>
    `;
  }).join('');
}

function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('previewImage');
  const previewBox = document.getElementById('previewBox');

  if (!file) {
    preview.style.display = 'none';
    previewBox.querySelector('span').textContent = 'No photo selected yet.';
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    preview.src = reader.result;
    preview.style.display = 'block';
    const placeholder = previewBox.querySelector('span');
    if (placeholder) placeholder.textContent = '';
  };
  reader.readAsDataURL(file);
}

function submitReport(event) {
  event.preventDefault();
  const location = document.getElementById('location').value.trim();
  const details = document.getElementById('details').value.trim();
  const price = document.getElementById('price') ? document.getElementById('price').value : '';
  const photoInput = document.getElementById('photo');
  const photo = photoInput.files[0];
  const status = document.getElementById('statusMessage');
  const creditMsg = document.getElementById('creditMessage');
  const coinSound = document.getElementById('coinSound');

  if (!location || !details || !photo || !price) {
    status.textContent = 'Please complete every field before submitting.';
    status.style.color = '#dc2626';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;
    const count = getReportCount() + 1;
    setReportCount(count);

    const reports = getReports();
    reports.unshift({
      location,
      details,
      price,
      date: new Date().toLocaleString(),
      image: imageUrl
    });
    setReports(reports);

    // Add credits for current logged-in user
    const currentUser = localStorage.getItem('userContact');
    if (currentUser) {
      ensureUserCredits(currentUser); // maintain persistency across logins
      const currentCredits = addCreditsForUser(currentUser, 20);
      const creditSummary = document.getElementById('creditSummary');
      if (creditSummary) {
        creditSummary.textContent = `Credits: ${currentCredits}`;
      }
    }

    updateReportCountElements();

    // Show gold credit message and play sound
    if (creditMsg) {
      creditMsg.innerHTML = "<span style='color:#FFD700;font-weight:900;font-size:1.2rem;'>You earned <b>20 credits!</b> &#x1F4B0;</span>";
      creditMsg.style.display = 'block';
      if (coinSound) { coinSound.currentTime = 0; coinSound.play(); }
      setTimeout(() => {
        creditMsg.style.display = 'none';
        // Show success message
        status.textContent = '✅ Submitted successfully! Your report is saved and will appear in History.';
        status.style.color = '#15803d';
        document.getElementById('reportForm').reset();
        const preview = document.getElementById('previewImage');
        preview.style.display = 'none';
        document.getElementById('previewBox').querySelector('span').textContent = 'No photo selected yet.';
        renderHistory();
      }, 3500);
    } else {
      // fallback
      status.textContent = '✅ Submitted successfully! Your report is saved and will appear in History.';
      status.style.color = '#15803d';
      document.getElementById('reportForm').reset();
      const preview = document.getElementById('previewImage');
      preview.style.display = 'none';
      document.getElementById('previewBox').querySelector('span').textContent = 'No photo selected yet.';
      renderHistory();
    }
  };
  reader.readAsDataURL(photo);
}

function saveReport(location, description, photoData, price) {
  const reports = JSON.parse(localStorage.getItem('reports') || '[]');
  reports.push({ location, description, photo: photoData, price });
  localStorage.setItem('reports', JSON.stringify(reports));
  // Increment report count
  let reportCount = parseInt(localStorage.getItem('reportCount') || '0', 10);
  reportCount += 1;
  localStorage.setItem('reportCount', reportCount);
  // Show credits message and play sound
  const creditMsg = document.getElementById('creditMessage');
  const coinSound = document.getElementById('coinSound');
  if (creditMsg) {
    creditMsg.innerHTML = "<span style='color:#FFD700;font-weight:900;font-size:1.2rem;'>You earned <b>20 credits!</b> &#x1F4B0;</span>";
    creditMsg.style.display = 'block';
    if (coinSound) { coinSound.currentTime = 0; coinSound.play(); }
    setTimeout(() => {
      creditMsg.style.display = 'none';
      // Show success message and redirect
      const statusMsg = document.getElementById('statusMessage');
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = `<span style='color:green;font-weight:600;'>Report successfully done and thanks for reporting!</span>`;
        setTimeout(() => { window.location.href = 'history.html'; }, 1800);
      } else {
        window.location.href = 'history.html';
      }
    }, 3500);
  } else {
    // fallback
    window.location.href = 'history.html';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateReportCountElements();
  renderHistory();
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.onclick = function() {
      if (confirm('Are you sure you want to clear all history?')) {
        setReports([]);
        setReportCount(0);
        renderHistory();
        updateReportCountElements();
      }
    };
  }
});

// Login tab transition logic
window.addEventListener('DOMContentLoaded', () => {
  const emailTab = document.getElementById('emailTab');
  const mobileTab = document.getElementById('mobileTab');
  const loginFormEmail = document.getElementById('loginFormEmail');
  const loginFormMobile = document.getElementById('loginFormMobile');

  function showTab(tab) {
    if (tab === 'email') {
      loginFormEmail.classList.remove('hide-left', 'hide-right');
      loginFormMobile.classList.remove('show');
      loginFormMobile.classList.add('hide-right');
      setTimeout(() => {
        loginFormEmail.classList.add('show');
      }, 10);
      emailTab.classList.add('active');
      mobileTab.classList.remove('active');
    } else {
      loginFormEmail.classList.remove('show');
      loginFormEmail.classList.add('hide-left');
      loginFormMobile.classList.remove('hide-left', 'hide-right');
      setTimeout(() => {
        loginFormMobile.classList.add('show');
      }, 10);
      emailTab.classList.remove('active');
      mobileTab.classList.add('active');
    }
  }

  emailTab.addEventListener('click', () => showTab('email'));
  mobileTab.addEventListener('click', () => showTab('mobile'));

  // Initial state
  loginFormEmail.classList.add('show');
  loginFormMobile.classList.add('hide-right');
});

function getUserContactHistory() {
  try {
    const history = JSON.parse(localStorage.getItem('userContactHistory') || '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function addUserContactHistory(contact) {
  if (!contact) return;
  const historical = getUserContactHistory();
  const normalized = contact.trim();
  if (!normalized) return;
  const existingIndex = historical.findIndex(value => value === normalized);
  if (existingIndex !== -1) {
    historical.splice(existingIndex, 1);
  }
  historical.unshift(normalized);
  if (historical.length > 10) historical.length = 10;
  localStorage.setItem('userContactHistory', JSON.stringify(historical));
}

function renderFooter() {
  const footerContact = document.getElementById('footerContact');
  const footerHistory = document.getElementById('footerContactHistory');
  const footerSupport = document.getElementById('footerSupport');
  if (!footerContact && !footerHistory && !footerSupport) {
    return;
  }

  const savedContact = localStorage.getItem('userContact') || 'Not logged in';
  const history = getUserContactHistory();
  if (footerContact) {
    footerContact.textContent = `Logged in as: ${savedContact}`;
  }
  if (footerHistory) {
    const entries = history.length > 0 ? history.join(' | ') : 'No previous contacts yet';
    footerHistory.textContent = `Previous login(s): ${entries}`;
  }

  if (footerSupport) {
    const fallbackEmail = localStorage.getItem('siteContactEmail') || 'support@smartgrab.example';
    const fallbackPhone = localStorage.getItem('siteContactPhone') || '+91-12345-67890';
    footerSupport.innerHTML = `Contact Detail: <strong>${savedContact}</strong> | Support: <a href='mailto:${fallbackEmail}'>${fallbackEmail}</a> | <a href='tel:${fallbackPhone}'>${fallbackPhone}</a>`;
  }
}

// Show profile button with email if logged in
window.addEventListener('DOMContentLoaded', () => {
  const profileBtn = document.getElementById('profileBtn');
  const loginEmail = localStorage.getItem('loginEmail');
  if (profileBtn && loginEmail) {
    profileBtn.textContent = loginEmail;
    profileBtn.style.display = '';
  }

  renderFooter();
});

// Keep footer updated if contact changes from other scripts
window.addEventListener('storage', renderFooter);


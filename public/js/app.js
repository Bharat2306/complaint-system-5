// Main Application Logic for Smart Complaint System

document.addEventListener('DOMContentLoaded', () => {
  // App State
  let currentUser = JSON.parse(localStorage.getItem('complaint_user') || 'null');
  let complaintsList = [];
  let selectedComplaint = null;
  let selectedRating = 5;
  let selectedFiles = [];
  let chatPollInterval = null;

  // DOM Elements - Auth & Nav
  const authView = document.getElementById('authView');
  const dashboardView = document.getElementById('dashboardView');
  const userBadge = document.getElementById('userBadge');
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Auth Forms
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const roleCardOptions = document.querySelectorAll('.role-card-option');
  const regRoleInput = document.getElementById('regRole');
  const authAlert = document.getElementById('authAlert');
  const authFormTitle = document.getElementById('authFormTitle');
  const authFormSubtitle = document.getElementById('authFormSubtitle');

  // Dashboard & Stats
  const dashGreeting = document.getElementById('dashGreeting');
  const dashSubtitle = document.getElementById('dashSubtitle');
  const studentActionContainer = document.getElementById('studentActionContainer');
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statProgress = document.getElementById('statProgress');
  const statResolved = document.getElementById('statResolved');

  // Filters & Cards Grid
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const complaintsContainer = document.getElementById('complaintsContainer');

  // Modals
  const openRaiseModalBtn = document.getElementById('openRaiseModalBtn');
  const raiseModal = document.getElementById('raiseModal');
  const closeRaiseModalBtn = document.getElementById('closeRaiseModalBtn');
  const cancelRaiseModalBtn = document.getElementById('cancelRaiseModalBtn');
  const raiseForm = document.getElementById('raiseForm');

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewGrid = document.getElementById('previewGrid');

  // Detail Modal
  const detailModal = document.getElementById('detailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const closeDetailFooterBtn = document.getElementById('closeDetailFooterBtn');
  const adminActionPanel = document.getElementById('adminActionPanel');
  const assignStaffSelect = document.getElementById('assignStaffSelect');
  const updateStatusSelect = document.getElementById('updateStatusSelect');
  const actionNoteInput = document.getElementById('actionNoteInput');
  const saveAdminActionBtn = document.getElementById('saveAdminActionBtn');
  const chatMessagesBox = document.getElementById('chatMessagesBox');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const giveFeedbackBtn = document.getElementById('giveFeedbackBtn');

  // Feedback Modal
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
  const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const starRatingContainer = document.getElementById('starRatingContainer');

  // ==================== INIT & THEME ====================
  const init = () => {
    // Theme setup
    const savedTheme = localStorage.getItem('complaint_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (currentUser) {
      showDashboard();
    } else {
      showAuth();
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('complaint_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  }

  const deptFormGroup = document.getElementById('deptFormGroup');
  const regEmailLabel = document.getElementById('regEmailLabel');
  const regEmailInput = document.getElementById('regEmail');
  const regEmailIcon = document.getElementById('regEmailIcon');

  // Role Selector Cards Click Handler
  roleCardOptions.forEach(card => {
    card.addEventListener('click', () => {
      roleCardOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const selectedRole = card.getAttribute('data-role');
      regRoleInput.value = selectedRole;

      if (selectedRole === 'staff') {
        if (regEmailLabel) regEmailLabel.textContent = 'Staff Unique ID';
        if (regEmailInput) regEmailInput.placeholder = 'e.g. STF-101 / EMP-502';
        if (regEmailIcon) regEmailIcon.className = 'fa-solid fa-id-card';
        if (deptFormGroup) deptFormGroup.style.display = 'none';
      } else if (selectedRole === 'admin') {
        if (regEmailLabel) regEmailLabel.textContent = 'Admin Email / ID';
        if (regEmailInput) regEmailInput.placeholder = 'admin@campus.edu';
        if (regEmailIcon) regEmailIcon.className = 'fa-solid fa-user-shield';
        if (deptFormGroup) deptFormGroup.style.display = 'none';
      } else {
        if (regEmailLabel) regEmailLabel.textContent = 'Campus Email';
        if (regEmailInput) regEmailInput.placeholder = 'student@campus.edu';
        if (regEmailIcon) regEmailIcon.className = 'fa-regular fa-envelope';
        if (deptFormGroup) deptFormGroup.style.display = 'block';
      }
    });
  });

  function showAlert(message, type = 'success') {
    authAlert.className = `auth-alert auth-alert-${type}`;
    authAlert.innerHTML = type === 'success' 
      ? `<i class="fa-solid fa-circle-check"></i> ${message}`
      : `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    authAlert.style.display = 'flex';
  }

  function hideAlert() {
    authAlert.style.display = 'none';
  }

  // ==================== AUTH & SWITCHING ====================
  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authFormTitle.textContent = 'Welcome Back';
    authFormSubtitle.textContent = 'Please sign in to access your complaint dashboard';
    hideAlert();
  });

  tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    authFormTitle.textContent = 'Create Account';
    authFormSubtitle.textContent = 'Register to raise & track campus complaints';
    hideAlert();
  });

  // Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await API.login(email, password);
      if (res.success) {
        currentUser = res.user;
        localStorage.setItem('complaint_user', JSON.stringify(currentUser));
        showDashboard();
      } else {
        showAlert(res.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showAlert('Error connecting to server.', 'error');
    }
  });

  // Register Submit (Redirects to Login tab after signup so user logs in explicitly)
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const selectedRole = regRoleInput ? regRoleInput.value : 'student';
    const emailOrIdValue = document.getElementById('regEmail').value.trim();

    const userData = {
      name: document.getElementById('regName').value.trim(),
      email: emailOrIdValue,
      staffId: selectedRole === 'staff' ? emailOrIdValue : '',
      password: document.getElementById('regPassword').value,
      role: selectedRole,
      department: document.getElementById('regDept') ? document.getElementById('regDept').value.trim() : ''
    };

    try {
      const res = await API.register(userData);
      if (res.success) {
        registerForm.reset();
        tabLoginBtn.click();
        document.getElementById('loginEmail').value = emailOrIdValue;
        document.getElementById('loginPassword').value = '';
        showAlert('Registration successful! Please enter your password to sign in.', 'success');
        const loginPassInput = document.getElementById('loginPassword');
        if (loginPassInput) loginPassInput.focus();
      } else {
        showAlert(res.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showAlert('Error connecting to server.', 'error');
    }
  });

  // Quick Demo Buttons
  document.getElementById('demoStudentBtn').addEventListener('click', () => quickLogin('student@campus.edu', 'password123'));
  document.getElementById('demoAdminBtn').addEventListener('click', () => quickLogin('admin@campus.edu', 'admin123'));
  document.getElementById('demoStaffBtn').addEventListener('click', () => quickLogin('staff@campus.edu', 'staff123'));

  async function quickLogin(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    loginForm.dispatchEvent(new Event('submit'));
  // Brand Logo Click Handler
  const brandLogo = document.querySelector('.brand-logo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        showDashboard();
      } else {
        showAuth();
      }
    });
  }

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('complaint_user');
    document.documentElement.classList.remove('user-logged-in');
    if (chatPollInterval) clearInterval(chatPollInterval);
    showAuth();
  });

  function showAuth() {
    document.documentElement.classList.remove('user-logged-in');
    authView.style.display = 'block';
    dashboardView.style.display = 'none';
    userBadge.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  function showDashboard() {
    document.documentElement.classList.add('user-logged-in');
    authView.style.display = 'none';
    dashboardView.style.display = 'block';
    userBadge.style.display = 'flex';
    logoutBtn.style.display = 'inline-flex';

    // Populate navbar user info
    userName.textContent = currentUser.name;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userRole.textContent = currentUser.role.toUpperCase();
    userRole.className = `role-tag ${currentUser.role}`;

    // Header greetings
    if (currentUser.role === 'student') {
      dashGreeting.textContent = `Welcome, ${currentUser.name.split(' ')[0]}! 👋`;
      dashSubtitle.textContent = 'Track your complaints, upload evidence, and chat with technical support.';
      studentActionContainer.style.display = 'block';
    } else if (currentUser.role === 'admin') {
      dashGreeting.textContent = `Admin Management Portal 🛡️`;
      dashSubtitle.textContent = `Review all student complaints, assign staff technicians, and monitor resolution timelines.`;
      studentActionContainer.style.display = 'none';
    } else {
      dashGreeting.textContent = `Staff Technician Portal 🛠️`;
      dashSubtitle.textContent = `View assigned tasks, update complaint progress, and respond to student inquiries.`;
      studentActionContainer.style.display = 'none';
    }

    const assignedFilter = document.getElementById('assignedFilter');
    if (currentUser.role === 'staff' || currentUser.role === 'admin') {
      if (assignedFilter) {
        assignedFilter.style.display = 'inline-block';
        if (currentUser.role === 'staff') {
          assignedFilter.value = 'MY_ASSIGNED';
        }
      }
    } else {
      if (assignedFilter) assignedFilter.style.display = 'none';
    }

    loadComplaints();
    if (currentUser.role !== 'student') {
      loadStaffDropdown();
    }
  }

  function getExpectedCompletionDate(createdAt, priority) {
    const dt = new Date(createdAt);
    let hoursToAdd = 48;
    if (priority === 'High' || priority === 'Emergency') hoursToAdd = 24;
    else if (priority === 'Low') hoursToAdd = 72;
    dt.setHours(dt.getHours() + hoursToAdd);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ==================== LOAD & RENDER COMPLAINTS ====================
  async function loadComplaints() {
    try {
      const res = await API.getComplaints(currentUser.role, currentUser.email);
      if (res.success) {
        complaintsList = res.complaints;
        updateStats();
        renderComplaintsGrid();
        updateNotifications();
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  }

  function updateStats() {
    const total = complaintsList.length;
    const pending = complaintsList.filter(c => c.status === 'Pending').length;
    const progress = complaintsList.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const resolved = complaintsList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    statTotal.textContent = total;
    statPending.textContent = pending;
    statProgress.textContent = progress;
    statResolved.textContent = resolved;
  }

  function renderComplaintsGrid() {
    const query = searchInput.value.toLowerCase().trim();
    const cat = categoryFilter.value;
    const stat = statusFilter.value;
    const assignedChoice = document.getElementById('assignedFilter') ? document.getElementById('assignedFilter').value : 'ALL';

    const filtered = complaintsList.filter(c => {
      const matchesSearch = c.ticketId.toLowerCase().includes(query) ||
                            c.title.toLowerCase().includes(query) ||
                            c.description.toLowerCase().includes(query) ||
                            (c.studentName && c.studentName.toLowerCase().includes(query)) ||
                            (c.location && c.location.toLowerCase().includes(query));
      
      const matchesCat = cat === 'ALL' || c.category === cat;
      const matchesStat = stat === 'ALL' || c.status === stat;

      let matchesAssigned = true;
      if (currentUser.role === 'staff' && assignedChoice === 'MY_ASSIGNED') {
        const isAssigned = (c.assignedStaffId && (
          c.assignedStaffId.toLowerCase() === currentUser.email.toLowerCase() ||
          (currentUser.staffId && c.assignedStaffId.toLowerCase() === currentUser.staffId.toLowerCase())
        )) || (c.assignedTo && c.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase()));
        matchesAssigned = isAssigned;
      }

      return matchesSearch && matchesCat && matchesStat && matchesAssigned;
    });

    if (filtered.length === 0) {
      complaintsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No complaints found</h3>
          <p style="font-size: 0.9rem;">${currentUser.role === 'staff' ? 'No tasks currently assigned to you.' : 'Try adjusting your search query or filters.'}</p>
        </div>
      `;
      return;
    }

    complaintsContainer.innerHTML = filtered.map(c => {
      const statusClass = `status-${c.status.toLowerCase().replace(/\s+/g, '')}`;
      const priorityClass = `priority-${c.priority.toLowerCase()}`;
      const expectedDate = getExpectedCompletionDate(c.createdAt, c.priority);
      
      let mediaStrip = '';
      if (c.media && c.media.length > 0) {
        mediaStrip = `
          <div class="media-thumbnail-strip">
            ${c.media.map(m => m.type === 'video' 
              ? `<div class="thumbnail-box"><video src="${m.url}"></video><i class="fa-solid fa-play" style="position:absolute; top:30%; left:35%; color:white;"></i></div>`
              : `<div class="thumbnail-box"><img src="${m.url}" alt="Attachment"></div>`
            ).join('')}
          </div>
        `;
      }

      const showStaffActions = (currentUser.role === 'staff' || currentUser.role === 'admin') && c.status !== 'Resolved' && c.status !== 'Closed';

      return `
        <div class="complaint-card">
          <div>
            <div class="complaint-header">
              <span class="ticket-id">${c.ticketId}</span>
              <span class="status-pill ${statusClass}">${c.status}</span>
            </div>
            
            <h3 class="complaint-title">${escapeHTML(c.title)}</h3>

            <div class="complaint-meta">
              <div class="meta-item"><i class="fa-solid fa-tag"></i> ${c.category}</div>
              <div class="meta-item"><span class="priority-pill ${priorityClass}">${c.priority} Priority</span></div>
              <div class="meta-item"><span class="expected-date-pill"><i class="fa-regular fa-calendar-check"></i> Expected: ${expectedDate}</span></div>
              <div class="meta-item"><i class="fa-solid fa-location-dot"></i> <strong>${escapeHTML(c.location || 'Campus')}</strong></div>
              <div class="meta-item"><i class="fa-solid fa-user-graduate"></i> Raised By: <strong>${escapeHTML(c.studentName || 'Student')}</strong></div>
              ${c.assignedTo ? `<div class="meta-item" style="color: var(--primary);"><i class="fa-solid fa-user-gear"></i> Staff: <strong>${escapeHTML(c.assignedTo)}</strong></div>` : ''}
            </div>

            <p class="complaint-body">${escapeHTML(c.description)}</p>

            ${mediaStrip}
          </div>

          <div class="complaint-footer" style="gap: 0.5rem; flex-wrap: wrap;">
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              <i class="fa-regular fa-clock"></i> ${new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>

            <div style="display: flex; gap: 0.5rem; margin-left: auto;">
              ${showStaffActions ? `
                <button class="btn btn-success btn-sm" onclick="quickMarkResolved('${c.ticketId}')" title="Mark work completed">
                  <i class="fa-solid fa-check"></i> Complete
                </button>
              ` : ''}
              <button class="btn btn-secondary btn-sm" onclick="openDetailModal('${c.ticketId}')">
                View Details <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter Listeners
  searchInput.addEventListener('input', renderComplaintsGrid);
  categoryFilter.addEventListener('change', renderComplaintsGrid);
  statusFilter.addEventListener('change', renderComplaintsGrid);
  const assignedFilterElem = document.getElementById('assignedFilter');
  if (assignedFilterElem) {
    assignedFilterElem.addEventListener('change', renderComplaintsGrid);
  }

  // ==================== RAISE COMPLAINT MODAL ====================
  openRaiseModalBtn.addEventListener('click', () => {
    raiseForm.reset();
    selectedFiles = [];
    previewGrid.innerHTML = '';
    raiseModal.classList.add('active');
  });

  closeRaiseModalBtn.addEventListener('click', () => raiseModal.classList.remove('active'));
  cancelRaiseModalBtn.addEventListener('click', () => raiseModal.classList.remove('active'));

  // Dropzone drag & drop handling
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-color)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  });

  function handleFileSelection(files) {
    Array.from(files).forEach(file => {
      selectedFiles.push(file);
      const url = URL.createObjectURL(file);
      const isVid = file.type.startsWith('video/');

      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = isVid
        ? `<video src="${url}"></video><button type="button" class="preview-remove">&times;</button>`
        : `<img src="${url}"><button type="button" class="preview-remove">&times;</button>`;

      item.querySelector('.preview-remove').addEventListener('click', () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        item.remove();
      });

      previewGrid.appendChild(item);
    });
  }

  // Raise Form Submit
  raiseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('cTitle').value.trim());
    formData.append('category', document.getElementById('cCategory').value);
    formData.append('priority', document.getElementById('cPriority').value);
    formData.append('location', document.getElementById('cLocation').value.trim());
    formData.append('description', document.getElementById('cDescription').value.trim());
    formData.append('studentName', currentUser.name);
    formData.append('studentEmail', currentUser.email);

    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await API.raiseComplaint(formData);
      if (res.success) {
        alert(`🎉 Complaint Submitted Successfully!\nTicket ID: ${res.complaint.ticketId}\n\nYour complaint has been forwarded to the Admin Portal. Admin will review staff details and assign a technician.`);
        raiseModal.classList.remove('active');
        loadComplaints();
      } else {
        alert(res.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      alert('Error submitting complaint.');
    }
  });

  // ==================== COMPLAINT DETAILS & CHAT ====================
  window.openDetailModal = async (ticketId) => {
    try {
      const res = await API.getComplaintById(ticketId);
      if (!res.success) return alert('Complaint not found.');

      selectedComplaint = res.complaint;
      renderDetailDrawer();
      detailModal.classList.add('active');

      // Start Chat Polling
      loadChatMessages();
      if (chatPollInterval) clearInterval(chatPollInterval);
      chatPollInterval = setInterval(loadChatMessages, 3000);

    } catch (err) {
      console.error(err);
    }
  };

  closeDetailModalBtn.addEventListener('click', closeDetailDrawer);
  closeDetailFooterBtn.addEventListener('click', closeDetailDrawer);

  function closeDetailDrawer() {
    detailModal.classList.remove('active');
    if (chatPollInterval) clearInterval(chatPollInterval);
  }

  function renderDetailDrawer() {
    const c = selectedComplaint;

    document.getElementById('detailTicketId').textContent = c.ticketId;
    document.getElementById('detailTitle').textContent = c.title;
    document.getElementById('detailStudentName').textContent = c.studentName;
    document.getElementById('detailStudentEmail').textContent = c.studentEmail;
    document.getElementById('detailLocation').textContent = c.location || 'Campus Location';
    document.getElementById('detailDescription').textContent = c.description;

    // Status & Priority Pills
    const statusPill = document.getElementById('detailStatusPill');
    statusPill.textContent = c.status;
    statusPill.className = `status-pill status-${c.status.toLowerCase().replace(/\s+/g, '')}`;

    const priorityPill = document.getElementById('detailPriorityPill');
    priorityPill.textContent = `${c.priority} Priority`;
    priorityPill.className = `priority-pill priority-${c.priority.toLowerCase()}`;

    // Media Attachments
    const mediaSection = document.getElementById('detailMediaSection');
    const mediaGrid = document.getElementById('detailMediaGrid');
    if (c.media && c.media.length > 0) {
      mediaSection.style.display = 'block';
      mediaGrid.innerHTML = c.media.map(m => m.type === 'video'
        ? `<div style="width: 140px; height: 100px; border-radius: 8px; overflow: hidden;"><video src="${m.url}" controls style="width:100%; height:100%; object-fit:cover;"></video></div>`
        : `<div style="width: 140px; height: 100px; border-radius: 8px; overflow: hidden;"><a href="${m.url}" target="_blank"><img src="${m.url}" style="width:100%; height:100%; object-fit:cover;"></a></div>`
      ).join('');
    } else {
      mediaSection.style.display = 'none';
    }

    // Timeline Rendering
    const timelineContainer = document.getElementById('detailTimeline');
    const statusOrder = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    const currentIdx = statusOrder.indexOf(c.status);

    const visualTimelineHTML = `
      <div class="visual-step-timeline">
        <div class="step-node ${currentIdx >= 0 ? (currentIdx === 0 ? 'active' : 'completed') : ''}">
          <div class="step-circle"><i class="fa-solid fa-paper-plane"></i></div>
          <div class="step-label">Submitted</div>
        </div>
        <div class="step-line-connector ${currentIdx >= 1 ? 'active' : ''}"></div>
        <div class="step-node ${currentIdx >= 1 ? (currentIdx === 1 ? 'active' : 'completed') : ''}">
          <div class="step-circle"><i class="fa-solid fa-user-gear"></i></div>
          <div class="step-label">Assigned</div>
        </div>
        <div class="step-line-connector ${currentIdx >= 2 ? 'active' : ''}"></div>
        <div class="step-node ${currentIdx >= 2 ? (currentIdx === 2 ? 'active' : 'completed') : ''}">
          <div class="step-circle"><i class="fa-solid fa-wrench"></i></div>
          <div class="step-label">In Progress</div>
        </div>
        <div class="step-line-connector ${currentIdx >= 3 ? 'active' : ''}"></div>
        <div class="step-node ${currentIdx >= 3 ? 'completed' : ''}">
          <div class="step-circle"><i class="fa-solid fa-circle-check"></i></div>
          <div class="step-label">Resolved</div>
        </div>
      </div>
    `;

    timelineContainer.innerHTML = visualTimelineHTML + c.timeline.map(t => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div style="display: flex; justify-content: space-between;">
            <span class="timeline-title">${t.status}</span>
            <span class="timeline-time">${new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(t.timestamp).toLocaleDateString()})</span>
          </div>
          <div class="timeline-note">${escapeHTML(t.note || '')} - <em>by ${escapeHTML(t.updatedBy || 'System')}</em></div>
        </div>
      </div>
    `).join('');

    // Admin Panel Controls
    if (currentUser.role === 'admin' || currentUser.role === 'staff') {
      adminActionPanel.style.display = 'block';
      updateStatusSelect.value = c.status;
      actionNoteInput.value = '';
    } else {
      adminActionPanel.style.display = 'none';
    }

    // Feedback Button & Display
    const feedbackBox = document.getElementById('feedbackDisplayBox');
    if (c.status === 'Closed' && c.feedback) {
      feedbackBox.style.display = 'block';
      document.getElementById('feedbackRatingStars').textContent = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating);
      document.getElementById('feedbackCommentText').textContent = `"${c.feedback}"`;
      giveFeedbackBtn.style.display = 'none';
    } else if (c.status === 'Resolved' && currentUser.role === 'student' && currentUser.email === c.studentEmail) {
      feedbackBox.style.display = 'none';
      giveFeedbackBtn.style.display = 'inline-flex';
    } else {
      feedbackBox.style.display = 'none';
      giveFeedbackBtn.style.display = 'none';
    }
  }

  // Quick Mark Resolved from Card
  window.quickMarkResolved = async (ticketId) => {
    try {
      const res = await API.updateStatus(ticketId, 'Resolved', 'Work marked as completed by staff technician.', currentUser.name);
      if (res.success) {
        alert('🎉 Complaint marked as RESOLVED!');
        loadComplaints();
        if (selectedComplaint && selectedComplaint.ticketId === ticketId) {
          selectedComplaint = res.complaint;
          renderDetailDrawer();
        }
      }
    } catch (err) {
      alert('Failed to mark complaint as resolved.');
    }
  };

  // Quick Action Buttons in Modal
  const btnQuickInProgress = document.getElementById('btnQuickInProgress');
  const btnQuickResolve = document.getElementById('btnQuickResolve');

  if (btnQuickInProgress) {
    btnQuickInProgress.addEventListener('click', async () => {
      if (!selectedComplaint) return;
      try {
        const res = await API.updateStatus(selectedComplaint.ticketId, 'In Progress', 'Technician investigating and working on issue.', currentUser.name);
        if (res.success) {
          alert('Status updated to "In Progress"!');
          selectedComplaint = res.complaint;
          renderDetailDrawer();
          loadComplaints();
        }
      } catch (err) {
        alert('Failed to update status.');
      }
    });
  }

  if (btnQuickResolve) {
    btnQuickResolve.addEventListener('click', async () => {
      if (!selectedComplaint) return;
      try {
        const res = await API.updateStatus(selectedComplaint.ticketId, 'Resolved', 'Work completed by technician.', currentUser.name);
        if (res.success) {
          alert('🎉 Issue marked as COMPLETED & RESOLVED!');
          selectedComplaint = res.complaint;
          renderDetailDrawer();
          loadComplaints();
        }
      } catch (err) {
        alert('Failed to mark work as resolved.');
      }
    });
  }

  // Load Staff Dropdown
  async function loadStaffDropdown() {
    try {
      const res = await API.getStaffList();
      if (res.success) {
        assignStaffSelect.innerHTML = `
          <option value="Unassigned" data-email="" data-staffid="">Choose Staff Member to Assign...</option>
          ${res.staff.map(s => {
            const idInfo = s.staffId ? ` [ID: ${s.staffId}]` : '';
            const deptInfo = s.department ? ` (${s.department})` : '';
            return `<option value="${s.name}" data-email="${s.email}" data-staffid="${s.staffId || s.email}">🛠️ ${s.name}${idInfo}${deptInfo}</option>`;
          }).join('')}
        `;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Save Admin Status & Assignment Action
  saveAdminActionBtn.addEventListener('click', async () => {
    if (!selectedComplaint) return;
    const ticketId = selectedComplaint.ticketId;
    const newStatus = updateStatusSelect.value;
    const assignedTo = assignStaffSelect.value;
    const selectedOpt = assignStaffSelect.options[assignStaffSelect.selectedIndex];
    const assignedStaffId = selectedOpt ? (selectedOpt.getAttribute('data-staffid') || selectedOpt.getAttribute('data-email') || '') : '';
    const note = actionNoteInput.value.trim() || `Status set to ${newStatus}`;

    try {
      const res = await API.updateStatus(ticketId, newStatus, note, currentUser.name);
      if (assignedTo !== selectedComplaint.assignedTo) {
        await API.assignStaff(ticketId, assignedTo, assignedStaffId, `Assigned to ${assignedTo}`, currentUser.name);
      }

      if (res.success) {
        alert('Complaint updated successfully!');
        selectedComplaint = res.complaint;
        renderDetailDrawer();
        loadComplaints();
      }
    } catch (err) {
      alert('Failed to update complaint.');
    }
  });

  // Support Chat
  async function loadChatMessages() {
    if (!selectedComplaint) return;
    try {
      const res = await API.getChatMessages(selectedComplaint.ticketId);
      if (res.success) {
        renderChat(res.messages);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function renderChat(messages) {
    if (!messages || messages.length === 0) {
      chatMessagesBox.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.85rem;">
          No messages yet. Send a message to start support conversation.
        </div>
      `;
      return;
    }

    chatMessagesBox.innerHTML = messages.map(m => {
      const isMine = m.senderId === currentUser.email || m.senderName === currentUser.name;
      return `
        <div class="chat-bubble ${isMine ? 'mine' : 'other'}">
          <div class="chat-sender-info">${escapeHTML(m.senderName)} (${m.senderRole.toUpperCase()})</div>
          <div>${escapeHTML(m.text)}</div>
          <div class="chat-time">${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
    }).join('');

    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  sendChatBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || !selectedComplaint) return;

    try {
      chatInput.value = '';
      await API.sendChatMessage(selectedComplaint.ticketId, {
        senderId: currentUser.email,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text
      });
      loadChatMessages();
    } catch (err) {
      alert('Failed to send message.');
    }
  }

  // ==================== FEEDBACK & RATING MODAL ====================
  giveFeedbackBtn.addEventListener('click', () => {
    selectedRating = 5;
    updateStarUI(5);
    document.getElementById('feedbackComments').value = '';
    feedbackModal.classList.add('active');
  });

  closeFeedbackModalBtn.addEventListener('click', () => feedbackModal.classList.remove('active'));
  cancelFeedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('active'));

  starRatingContainer.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      updateStarUI(selectedRating);
    });
  });

  function updateStarUI(rating) {
    starRatingContainer.querySelectorAll('.star').forEach(star => {
      const val = parseInt(star.getAttribute('data-value'));
      if (val <= rating) {
        star.classList.add('selected');
      } else {
        star.classList.remove('selected');
      }
    });
  }

  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const feedback = document.getElementById('feedbackComments').value.trim();

    try {
      const res = await API.submitFeedback(selectedComplaint.ticketId, selectedRating, feedback);
      if (res.success) {
        alert('Thank you for your feedback! The complaint has been officially closed.');
        feedbackModal.classList.remove('active');
        selectedComplaint = res.complaint;
        renderDetailDrawer();
        loadComplaints();
      }
    } catch (err) {
      alert('Failed to submit feedback.');
    }
  });

  // ==================== NOTIFICATIONS MODULE ====================
  const notifBellBtn = document.getElementById('notifBellBtn');
  const notifDropdownMenu = document.getElementById('notifDropdownMenu');
  const notifBadgeCount = document.getElementById('notifBadgeCount');
  const notifList = document.getElementById('notifList');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  let notificationsList = [];

  function updateNotifications() {
    notificationsList = [];
    complaintsList.forEach(c => {
      if (c.timeline && c.timeline.length > 0) {
        c.timeline.slice(-2).forEach(t => {
          notificationsList.push({
            id: c.ticketId,
            title: `[${c.ticketId}] Status: ${t.status}`,
            note: t.note || `Complaint updated to ${t.status}`,
            time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true
          });
        });
      }
    });

    const unreadCount = notificationsList.filter(n => n.unread).length;
    if (unreadCount > 0 && notifBadgeCount) {
      notifBadgeCount.textContent = unreadCount;
      notifBadgeCount.style.display = 'flex';
    } else if (notifBadgeCount) {
      notifBadgeCount.style.display = 'none';
    }

    if (!notifList) return;
    if (notificationsList.length === 0) {
      notifList.innerHTML = `<div class="notif-empty">No notifications yet</div>`;
    } else {
      notifList.innerHTML = notificationsList.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="openDetailModal('${n.id}')">
          <div class="notif-item-title">${escapeHTML(n.title)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.2rem;">${escapeHTML(n.note)}</div>
          <div class="notif-item-time"><i class="fa-regular fa-clock"></i> ${n.time}</div>
        </div>
      `).join('');
    }
  }

  if (notifBellBtn) {
    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!notifDropdownMenu) return;
      const isVisible = notifDropdownMenu.style.display === 'block';
      notifDropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
  }

  document.addEventListener('click', () => {
    if (notifDropdownMenu) notifDropdownMenu.style.display = 'none';
  });

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      notificationsList.forEach(n => n.unread = false);
      if (notifBadgeCount) notifBadgeCount.style.display = 'none';
      updateNotifications();
    });
  }

  // ==================== STUDENT PROFILE MODAL ====================
  const profileModal = document.getElementById('profileModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const profileForm = document.getElementById('profileForm');

  if (userBadge) {
    userBadge.addEventListener('click', () => {
      if (!currentUser) return;
      document.getElementById('profModalAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
      document.getElementById('profModalName').textContent = currentUser.name;
      document.getElementById('profModalRole').textContent = currentUser.role.toUpperCase();
      document.getElementById('profNameInput').value = currentUser.name || '';
      document.getElementById('profEmailInput').value = currentUser.email || '';
      document.getElementById('profRollInput').value = currentUser.rollNumber || currentUser.staffId || '';
      document.getElementById('profHostelInput').value = currentUser.hostel || currentUser.department || '';
      document.getElementById('profRoomInput').value = currentUser.roomNo || '';
      document.getElementById('profPhoneInput').value = currentUser.phone || '';
      if (profileModal) profileModal.classList.add('active');
    });
  }

  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => profileModal.classList.remove('active'));
  if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => profileModal.classList.remove('active'));

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser.name = document.getElementById('profNameInput').value.trim();
      currentUser.rollNumber = document.getElementById('profRollInput').value.trim();
      currentUser.hostel = document.getElementById('profHostelInput').value.trim();
      currentUser.roomNo = document.getElementById('profRoomInput').value.trim();
      currentUser.phone = document.getElementById('profPhoneInput').value.trim();

      localStorage.setItem('complaint_user', JSON.stringify(currentUser));
      userName.textContent = currentUser.name;
      userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
      if (dashGreeting) dashGreeting.textContent = `Welcome, ${currentUser.name.split(' ')[0]}! 👋`;
      profileModal.classList.remove('active');
      alert('✅ Student Profile updated successfully!');
    });
  }

  // Utility Helper
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Initialize
  init();
});

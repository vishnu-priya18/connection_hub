// ==========================================================================
// ConnectionHub Main Application Logic
// Handles Simulated Firebase DB, AI Engine, Routing, Roles & UI Rendering
// ==========================================================================

// Configurable lists of default profiles.
// The user can edit these lists directly here or add new ones in the UI.
const CONFIG_STAFF_PROFILES = [
  {
    userId: "staff_jenkins",
    fullName: "Dr. Sarah Jenkins",
    officialEmail: "sjenkins@college.edu",
    department: "Computer Science",
    role: "Head of Department",
    verifiedStatus: true,
    avatar: "SJ"
  },
  {
    userId: "staff_kumar",
    fullName: "Prof. Rajesh Kumar",
    officialEmail: "rkumar@college.edu",
    department: "Electronics & Communication",
    role: "Placement Coordinator",
    verifiedStatus: true,
    avatar: "RK"
  },
  {
    userId: "staff_carter",
    fullName: "Dr. Emily Carter",
    officialEmail: "ecarter@college.edu",
    department: "Information Technology",
    role: "Assistant Professor",
    verifiedStatus: true,
    avatar: "EC"
  }
];

const CONFIG_STUDENT_PROFILES = [
  {
    userId: "student_arjun",
    fullName: "Arjun Sharma",
    officialEmail: "arjun.s@student.edu",
    department: "Computer Science",
    role: "Student (3rd Year)",
    avatar: "AS"
  },
  {
    userId: "student_priya",
    fullName: "Priya Patel",
    officialEmail: "priya.p@student.edu",
    department: "Electronics & Communication",
    role: "Student (4th Year)",
    avatar: "PP"
  },
  {
    userId: "student_sneha",
    fullName: "Sneha Reddy",
    officialEmail: "sneha.r@student.edu",
    department: "Information Technology",
    role: "Student (2nd Year)",
    avatar: "SR"
  }
];

// Global App State
const state = {
  currentRole: 'student', // 'student' or 'instructor'
  currentTab: 'home', // 'home', 'categories', 'bookmarks', 'notifications', 'instructor'
  activeCategoryFilter: 'all', // For explore page
  searchQuery: '',
  selectedDeptFilter: 'all',
  selectedDateFilter: 'all',
  
  // Database Mock Collections (populated from LocalStorage or Defaults)
  studentsList: [],
  instructorsList: [],
  activeUser: null, // stores active user object
  activeLoginTab: 'student', // 'student' or 'staff'
  
  instructors: [], // verified staff cache
  notices: [],
  bookmarks: [], // Array of noticeIds
  notifications: [],
  
  // Simulated Analytics (views, register clicks, bookmarks count)
  analytics: {
    clicks: {},
    views: {}
  }
};

const DEFAULT_NOTICES = [
  {
    noticeId: "notice_1",
    title: "Google STEP Internship 2026",
    description: "Google's Student Training in Engineering Program (STEP) is a 12-week internship for first and second-year undergraduate students with a passion for computer science. The internship includes software engineering projects and professional development mentorship.",
    category: "Internships",
    deadline: "2026-06-15",
    registrationLink: "https://buildyourfuture.withgoogle.com",
    imageURL: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format&fit=crop",
    pdfURL: "brochure.pdf",
    uploadedBy: "Dr. Sarah Jenkins",
    timestamp: "2026-05-28T09:00:00.000Z",
    aiSummary: "🎯 12-week software engineering internship at Google for 1st/2nd year CS students. Includes 1-on-1 mentorship.",
    visibilityStatus: "pinned" // Pinned notice
  },
  {
    noticeId: "notice_2",
    title: "Smart India Hackathon (SIH) 2026 College Selection",
    description: "Register your team for the internal college hackathon selection round for SIH 2026. Bring your innovative solutions to real-world problems. Teams must have 6 members with at least one female member. Selected teams will represent the college at the national level.",
    category: "Hackathons",
    deadline: "2026-06-02",
    registrationLink: "https://sih.gov.in",
    imageURL: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop",
    pdfURL: "eligibility.pdf",
    uploadedBy: "Dr. Sarah Jenkins",
    timestamp: "2026-05-28T07:30:00.000Z",
    aiSummary: "💻 Internal selection for Smart India Hackathon 2026. Teams of 6 required. Deadline approaching soon!",
    visibilityStatus: "active"
  },
  {
    noticeId: "notice_3",
    title: "Hands-on Workshop: Building Generative AI Apps with React",
    description: "Learn how to build AI-driven web applications from scratch. This workshop covers integrating Gemini API, creating smart UI components, and managing asynchronous state. Bring your laptops with Node.js and Git installed.",
    category: "Workshops",
    deadline: "2026-06-10",
    registrationLink: "https://college.edu/workshop-genai",
    imageURL: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop",
    pdfURL: "syllabus.pdf",
    uploadedBy: "Dr. Emily Carter",
    timestamp: "2026-05-27T14:20:00.000Z",
    aiSummary: "🤖 Practical workshop on React & Gemini API app development. Laptop with Node/Git required.",
    visibilityStatus: "active"
  },
  {
    noticeId: "notice_4",
    title: "TCS Ninja & Digital Placement Prep Bootcamp",
    description: "Kickstart your career with our exclusive placement prep bootcamp sponsored by the Training and Placement Cell. Covers quantitative aptitude, algorithmic coding, resume building sessions, and mock interviews with industry veterans.",
    category: "Placement Training",
    deadline: "2026-06-08",
    registrationLink: "https://college.edu/placement-prep",
    imageURL: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop",
    pdfURL: "none",
    uploadedBy: "Prof. Rajesh Kumar",
    timestamp: "2026-05-26T10:15:00.000Z",
    aiSummary: "💼 Comprehensive placement bootcamp covering aptitude, coding, mock interviews, and resume building.",
    visibilityStatus: "active"
  },
  {
    noticeId: "notice_5",
    title: "National RoboCon Robotics Challenge 2026",
    description: "The biggest robotics competition on campus. Design, build, and program a robot capable of navigating a complex obstacle course and performing automated sorting tasks. Massive cash prizes and certificates for finalists.",
    category: "Competitions",
    deadline: "2026-06-20",
    registrationLink: "https://college.edu/robocon",
    imageURL: "https://images.unsplash.com/photo-1578269174936-2709b5a5c0e5?w=500&auto=format&fit=crop",
    pdfURL: "brochure.pdf",
    uploadedBy: "Prof. Rajesh Kumar",
    timestamp: "2026-05-25T08:00:00.000Z",
    aiSummary: "🏆 Campus robotics contest featuring obstacle courses & sorting tasks. Cash rewards for top performers.",
    visibilityStatus: "active"
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    notificationId: "noti_1",
    title: "New Internship Added",
    message: "Dr. Sarah Jenkins posted: Google STEP Internship 2026 in Internships.",
    category: "Internships",
    timestamp: "2026-05-28T09:02:00.000Z",
    read: false
  },
  {
    notificationId: "noti_2",
    title: "New Hackathon Announcement",
    message: "Dr. Sarah Jenkins posted: Smart India Hackathon Selection in Hackathons.",
    category: "Hackathons",
    timestamp: "2026-05-28T07:31:00.000Z",
    read: false
  },
  {
    notificationId: "noti_3",
    title: "Symposium Deadline Tomorrow",
    message: "Reminder: Registration for the AI National Symposium ends tomorrow. Book your slot now!",
    category: "Symposiums",
    timestamp: "2026-05-28T05:00:00.000Z",
    read: false,
    urgent: true
  }
];

const BANNER_MAPPING = {
  "tech_banner.jpg": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop",
  "intern_banner.jpg": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&auto=format&fit=crop",
  "hackathon_banner.jpg": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop",
  "workshop_banner.jpg": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop",
  "competition_banner.jpg": "https://images.unsplash.com/photo-1578269174936-2709b5a5c0e5?w=500&auto=format&fit=crop"
};

// ==========================================================================
// Initialization & LocalStorage Database Sync
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  
  // Hide active role selector bar if not needed (role selection now integrated into profile logins)
  // We keep it hidden by default, or just let it adjust automatically based on user login
  const selectorBar = document.querySelector('.role-selector-bar');
  if (selectorBar) {
    selectorBar.style.display = 'none'; // hide floating bar, logins are now integrated
  }

  // Bind new profile department dropdown to keep roles neat
  const dateInput = document.getElementById('form-deadline');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Render Login Profiles Screen or App content
  checkSessionState();
  lucide.createIcons();
});

function initDatabase() {
  // Sync Profile lists
  if (!localStorage.getItem('ch_students_list')) {
    localStorage.setItem('ch_students_list', JSON.stringify(CONFIG_STUDENT_PROFILES));
  }
  state.studentsList = JSON.parse(localStorage.getItem('ch_students_list'));

  if (!localStorage.getItem('ch_instructors_list')) {
    localStorage.setItem('ch_instructors_list', JSON.stringify(CONFIG_STAFF_PROFILES));
  }
  state.instructorsList = JSON.parse(localStorage.getItem('ch_instructors_list'));
  state.instructors = state.instructorsList; // align verified list

  // Sync Notices
  if (!localStorage.getItem('ch_notices')) {
    localStorage.setItem('ch_notices', JSON.stringify(DEFAULT_NOTICES));
  }
  state.notices = JSON.parse(localStorage.getItem('ch_notices'));

  // Sync Bookmarks
  if (!localStorage.getItem('ch_bookmarks')) {
    localStorage.setItem('ch_bookmarks', JSON.stringify([]));
  }
  state.bookmarks = JSON.parse(localStorage.getItem('ch_bookmarks'));

  // Sync Notifications
  if (!localStorage.getItem('ch_notifications')) {
    localStorage.setItem('ch_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  state.notifications = JSON.parse(localStorage.getItem('ch_notifications'));

  // Sync Analytics
  if (!localStorage.getItem('ch_analytics_clicks')) {
    const clicks = {};
    state.notices.forEach(n => {
      clicks[n.noticeId] = Math.floor(Math.random() * 25) + 5;
    });
    localStorage.setItem('ch_analytics_clicks', JSON.stringify(clicks));
  }
  state.analytics.clicks = JSON.parse(localStorage.getItem('ch_analytics_clicks'));
  
  if (!localStorage.getItem('ch_analytics_views')) {
    const views = {};
    state.notices.forEach(n => {
      views[n.noticeId] = Math.floor(Math.random() * 100) + 40;
    });
    localStorage.setItem('ch_analytics_views', JSON.stringify(views));
  }
  state.analytics.views = JSON.parse(localStorage.getItem('ch_analytics_views'));
}

function saveDatabase() {
  localStorage.setItem('ch_notices', JSON.stringify(state.notices));
  localStorage.setItem('ch_bookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('ch_notifications', JSON.stringify(state.notifications));
  localStorage.setItem('ch_analytics_clicks', JSON.stringify(state.analytics.clicks));
  localStorage.setItem('ch_analytics_views', JSON.stringify(state.analytics.views));
  localStorage.setItem('ch_students_list', JSON.stringify(state.studentsList));
  localStorage.setItem('ch_instructors_list', JSON.stringify(state.instructorsList));
}

// ==========================================================================
// User Session and Login Actions
// ==========================================================================
function checkSessionState() {
  const activeUser = JSON.parse(localStorage.getItem('ch_active_user'));
  const layoutNode = document.getElementById('app-layout-node');
  
  if (activeUser) {
    state.activeUser = activeUser;
    const isStudent = activeUser.userId.startsWith('student');
    state.currentRole = isStudent ? 'student' : 'instructor';
    
    if (layoutNode) layoutNode.classList.remove('logged-out');
    
    // Apply user info to welcome widgets
    updateWelcomeUI();
    
    // Redirect to home page
    switchTab('home');
    renderAllPages();
  } else {
    state.activeUser = null;
    if (layoutNode) layoutNode.classList.add('logged-out');
    renderLoginProfiles();
  }
}

function updateWelcomeUI() {
  if (!state.activeUser) return;

  const role = state.currentRole;
  const user = state.activeUser;
  const initials = user.avatar || user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);

  // Update Top Header profile nodes
  const headerAvatar = document.getElementById('header-avatar-node');
  if (headerAvatar) headerAvatar.textContent = initials;

  const headerName = document.getElementById('header-user-name-node');
  if (headerName) headerName.textContent = user.fullName;

  const headerRole = document.getElementById('header-user-role-node');
  if (headerRole) headerRole.textContent = user.role;

  const dropdownEmail = document.getElementById('dropdown-user-email');
  if (dropdownEmail) dropdownEmail.textContent = user.officialEmail;

  // Update Sidebar profile nodes
  const sidebarAvatar = document.getElementById('sidebar-avatar-initials');
  if (sidebarAvatar) sidebarAvatar.textContent = initials;

  const sidebarName = document.getElementById('sidebar-username-label');
  if (sidebarName) sidebarName.textContent = user.fullName;

  const sidebarRole = document.getElementById('sidebar-userrole-label');
  if (sidebarRole) sidebarRole.textContent = user.role;

  // Update Home Tab welcome hero
  const welcomeTitle = document.getElementById('home-welcome-title');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome back, ${user.fullName.split(' ')[0]}!`;
  }

  const welcomeSubtitle = document.getElementById('welcome-user-subtitle');
  if (welcomeSubtitle) {
    if (role === 'student') {
      welcomeSubtitle.textContent = `Explore opportunities matching your ${user.department} profile`;
    } else {
      welcomeSubtitle.textContent = `${user.role} • College Coordinator Dashboard`;
    }
  }
}

function switchLoginTab(tab) {
  state.activeLoginTab = tab;
  document.getElementById('login-tab-student').classList.toggle('active', tab === 'student');
  document.getElementById('login-tab-staff').classList.toggle('active', tab === 'staff');
  
  const title = document.getElementById('login-section-title');
  if (title) {
    title.textContent = tab === 'student' ? 'Select a student account to log in:' : 'Select an instructor account to log in:';
  }
  
  renderLoginProfiles();
}

function renderLoginProfiles() {
  const container = document.getElementById('login-profiles-list');
  if (!container) return;

  const profiles = state.activeLoginTab === 'student' ? state.studentsList : state.instructorsList;

  container.innerHTML = profiles.map(profile => {
    return `
      <div class="profile-card" onclick="loginUser('${profile.userId}')">
        <div class="profile-avatar">${profile.avatar}</div>
        <div class="profile-info">
          <span class="profile-name">${profile.fullName}</span>
          <span class="profile-meta">${profile.role} • ${profile.department}</span>
        </div>
      </div>
    `;
  }).join('');
}

function loginUser(userId) {
  let user = state.studentsList.find(s => s.userId === userId);
  let role = 'student';
  
  if (!user) {
    user = state.instructorsList.find(i => i.userId === userId);
    role = 'instructor';
  }

  if (user) {
    localStorage.setItem('ch_active_user', JSON.stringify(user));
    state.activeUser = user;
    state.currentRole = role;
    
    const layoutNode = document.getElementById('app-layout-node');
    if (layoutNode) layoutNode.classList.remove('logged-out');
    
    updateWelcomeUI();
    switchTab('home');
    renderAllPages();
    lucide.createIcons();
    
    showToast(`Logged in successfully`, `Welcome as ${user.fullName}`, "success");
  }
}

function logoutUser() {
  localStorage.removeItem('ch_active_user');
  state.activeUser = null;
  
  const layoutNode = document.getElementById('app-layout-node');
  if (layoutNode) layoutNode.classList.add('logged-out');
  
  document.getElementById('add-profile-form').classList.add('hidden');
  document.getElementById('btn-toggle-add-profile').classList.remove('hidden');

  renderLoginProfiles();
  lucide.createIcons();
  
  showToast("Logged Out", "Session ended successfully", "info");
}

function toggleAddProfileForm() {
  const form = document.getElementById('add-profile-form');
  const toggleBtn = document.getElementById('btn-toggle-add-profile');
  
  const isHidden = form.classList.contains('hidden');
  if (isHidden) {
    form.classList.remove('hidden');
    toggleBtn.classList.add('hidden');
    document.getElementById('login-portal').scrollTop = form.offsetTop;
  } else {
    form.classList.add('hidden');
    toggleBtn.classList.remove('hidden');
  }
}

function handleCreateProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById('new-profile-name').value;
  const email = document.getElementById('new-profile-email').value;
  const dept = document.getElementById('new-profile-dept').value;
  const title = document.getElementById('new-profile-title').value;
  
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const isStudentTab = state.activeLoginTab === 'student';
  const roleType = isStudentTab ? 'student' : 'staff';
  
  const newProfile = {
    userId: `${roleType}_${Date.now()}`,
    fullName: name,
    officialEmail: email,
    department: dept,
    role: title,
    avatar: initials,
    verifiedStatus: !isStudentTab
  };

  if (isStudentTab) {
    state.studentsList.push(newProfile);
  } else {
    state.instructorsList.push(newProfile);
    state.instructors = state.instructorsList;
  }

  saveDatabase();
  renderLoginProfiles();
  
  document.getElementById('new-profile-name').value = "";
  document.getElementById('new-profile-email').value = "";
  document.getElementById('new-profile-title').value = "";
  
  toggleAddProfileForm();
  showToast("Profile Added", `New ${roleType} profile created successfully!`, "success");
}

// ==========================================================================
// Sidebar and Dropdown Helpers
// ==========================================================================
function toggleUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown-menu');
  if (dropdown) dropdown.classList.toggle('active');
}

// Close dropdown on window click
window.addEventListener('click', () => {
  const dropdown = document.getElementById('profile-dropdown-menu');
  if (dropdown) dropdown.classList.remove('active');
});

function toggleSidebarMenu() {
  const sidebar = document.getElementById('app-sidebar-node');
  if (sidebar) sidebar.classList.toggle('open');
}

// ==========================================================================
// Tab Router Utilities
// ==========================================================================
function switchTab(tabId) {
  state.currentTab = tabId;

  // Toggle active class on screen divs
  document.querySelectorAll('.app-page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`tab-${tabId}`);
  if (targetPage) targetPage.classList.add('active');

  // Toggle active class on sidebar navigation items
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeNavItem = document.getElementById(`nav-${tabId}`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  // Update Breadcrumb Path
  const activeBreadcrumb = document.getElementById('breadcrumb-active');
  if (activeBreadcrumb) {
    const tabNames = {
      'home': 'Dashboard',
      'categories': 'Explore Opportunities',
      'bookmarks': 'Saved Notices',
      'notifications': 'Activity Center',
      'instructor': 'Instructor Portal'
    };
    activeBreadcrumb.textContent = tabNames[tabId] || 'Dashboard';
  }

  // Close sidebar drawer on menu navigate (mobile views)
  const sidebar = document.getElementById('app-sidebar-node');
  if (sidebar) sidebar.classList.remove('open');

  // Handle specific tab loading logic
  if (tabId === 'instructor') {
    handleInstructorDashboardView();
  }

  // Re-init icons just in case
  lucide.createIcons();
  
  // Scroll main body back to top on navigation
  document.getElementById('app-main-content').scrollTop = 0;
}

function handleInstructorDashboardView() {
  const restrictedView = document.getElementById('instructor-access-restricted');
  const dashboardView = document.getElementById('instructor-dashboard-content');

  if (state.currentRole === 'student') {
    restrictedView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
  } else {
    restrictedView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    renderInstructorDashboard();
  }
}

// ==========================================================================
// Theme Logic
// ==========================================================================

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);

  // Update theme toggle icon
  const toggleBtn = document.getElementById('theme-toggle');
  if (newTheme === 'dark') {
    toggleBtn.innerHTML = '<i data-lucide="sun"></i>';
    toggleBtn.style.color = 'var(--warning-color)';
    toggleBtn.style.background = 'var(--warning-light)';
  } else {
    toggleBtn.innerHTML = '<i data-lucide="moon"></i>';
    toggleBtn.style.color = 'var(--primary-color)';
    toggleBtn.style.background = 'var(--primary-light)';
  }
  lucide.createIcons();
  showToast("Theme Updated", `Switched to ${newTheme} mode`, "info");
}

// ==========================================================================
// AI Auto-Classification & Summary Engines (Simulated)
// ==========================================================================
function toggleAIClassify(checkbox) {
  const catSelect = document.getElementById('form-category');
  if (checkbox.checked) {
    catSelect.setAttribute('disabled', 'true');
    catSelect.style.opacity = '0.6';
    runAutoClassification();
  } else {
    catSelect.removeAttribute('disabled');
    catSelect.style.opacity = '1';
  }
}

// Triggered on title or description input changes
document.getElementById('form-title').addEventListener('input', runAutoClassification);
document.getElementById('form-desc').addEventListener('input', runAutoClassification);

function runAutoClassification() {
  const aiCheckbox = document.getElementById('form-ai-classify');
  if (!aiCheckbox || !aiCheckbox.checked) return;

  const title = document.getElementById('form-title').value.toLowerCase();
  const desc = document.getElementById('form-desc').value.toLowerCase();
  const text = title + " " + desc;

  let detectedCategory = "Department Events"; // fallback

  if (text.includes("intern") || text.includes("stipend") || text.includes("co-op")) {
    detectedCategory = "Internships";
  } else if (text.includes("hack") || text.includes("hackathon") || text.includes("coding challenge")) {
    detectedCategory = "Hackathons";
  } else if (text.includes("symposium") || text.includes("college fest") || text.includes("cultural")) {
    detectedCategory = "Symposiums";
  } else if (text.includes("workshop") || text.includes("hands-on") || text.includes("bootcamp") || text.includes("learn react")) {
    detectedCategory = "Workshops";
  } else if (text.includes("placement") || text.includes("mock interview") || text.includes("aptitude") || text.includes("recruit")) {
    detectedCategory = "Placement Training";
  } else if (text.includes("competition") || text.includes("contest") || text.includes("challenge") || text.includes("prize")) {
    detectedCategory = "Competitions";
  } else if (text.includes("conference") || text.includes("paper submission") || text.includes("journal")) {
    detectedCategory = "Conferences";
  } else if (text.includes("webinar") || text.includes("online seminar") || text.includes("zoom session")) {
    detectedCategory = "Webinars";
  }

  const catSelect = document.getElementById('form-category');
  if (catSelect) {
    catSelect.value = detectedCategory;
  }
}

function generateAISummary(title, desc, deadline) {
  // Simple heuristic bullet point summarizer
  let icon = "💡";
  if (title.toLowerCase().includes("intern")) icon = "💼";
  else if (title.toLowerCase().includes("hack")) icon = "💻";
  else if (title.toLowerCase().includes("workshop")) icon = "⚙️";
  else if (title.toLowerCase().includes("contest") || title.toLowerCase().includes("challenge")) icon = "🏆";
  
  // Format deadline readability
  const dDate = new Date(deadline);
  const formattedDeadline = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Excerpt first sentence of description, limit to 65 chars
  let excerpt = desc.split(/[.!?]/)[0] || desc;
  if (excerpt.length > 70) excerpt = excerpt.substring(0, 68) + "...";

  return `⚡ ${icon} ${excerpt} Deadline: ${formattedDeadline}.`;
}

// ==========================================================================
// Date Helpers
// ==========================================================================
function getDaysRemaining(deadlineStr) {
  const diffTime = new Date(deadlineStr) - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDaysRemainingText(days) {
  if (days < 0) return "Expired";
  if (days === 0) return "Ends today";
  if (days === 1) return "Ends tomorrow";
  return `${days} days left`;
}

function getRelativeTime(timestampStr) {
  const diffTime = new Date() - new Date(timestampStr);
  const diffMins = Math.floor(diffTime / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ==========================================================================
// UI Rendering Engines
// ==========================================================================

function renderAllPages() {
  renderHomeTab();
  renderExploreTab();
  renderBookmarksTab();
  renderNotificationsTab();
  
  // Update Unread Notification count Badge in Header
  const unreadNoti = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('noti-badge-count');
  if (badge) {
    badge.textContent = unreadNoti;
    badge.style.display = unreadNoti > 0 ? 'block' : 'none';
  }
}

// Render notices inside the main student dashboards
function renderHomeTab() {
  const sliderContainer = document.getElementById('trending-slider-container');
  const updatesContainer = document.getElementById('new-updates-container');
  const soonContainer = document.getElementById('ending-soon-container');
  const recomContainer = document.getElementById('recommended-container');

  if (!sliderContainer) return;

  // 1. Trending (Horizontal Cards) - Sort by most simulated clicks/views
  const sortedTrending = [...state.notices].sort((a, b) => {
    const clicksA = state.analytics.clicks[a.noticeId] || 0;
    const clicksB = state.analytics.clicks[b.noticeId] || 0;
    return clicksB - clicksA;
  }).slice(0, 3);

  sliderContainer.innerHTML = sortedTrending.map(notice => {
    const isBookmarked = state.bookmarks.includes(notice.noticeId);
    const bookmarkClass = isBookmarked ? 'bookmarked' : '';
    const bookmarkIcon = isBookmarked ? 'bookmark' : 'bookmark';
    const remainingDays = getDaysRemaining(notice.deadline);
    const deadlineText = formatDaysRemainingText(remainingDays);
    const isPinned = notice.visibilityStatus === 'pinned';

    return `
      <div class="trending-card" onclick="openNoticeDetailModal('${notice.noticeId}')">
        <div class="card-header-img" style="background-image: url('${notice.imageURL}')">
          <span class="card-badge">${notice.category}</span>
          ${isPinned ? `<span class="pin-badge" title="Pinned Announcement"><i data-lucide="pin"></i></span>` : ''}
        </div>
        <div class="trending-body">
          <div class="trending-meta">
            <span>By ${notice.uploadedBy}</span>
            <span class="dot"></span>
            <span>${getRelativeTime(notice.timestamp)}</span>
          </div>
          <h4>${notice.title}</h4>
          <div class="ai-mini-summary">
            ${notice.aiSummary}
          </div>
        </div>
        <div class="trending-footer">
          <span class="deadline-timer">
            <i data-lucide="clock"></i> ${deadlineText}
          </span>
          <div class="action-icon-row" onclick="event.stopPropagation()">
            <button class="save-btn ${bookmarkClass}" onclick="toggleBookmark('${notice.noticeId}')" aria-label="Bookmark">
              <i data-lucide="bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 2. New Updates (Vertical cards) - Sort by timestamp
  const sortedNew = [...state.notices].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);
  updatesContainer.innerHTML = sortedNew.map(notice => renderVerticalNoticeCard(notice)).join('');

  // 3. Ending Soon (Countdown Cards) - Deadline <= 10 days remaining
  const endingSoon = state.notices
    .filter(notice => {
      const days = getDaysRemaining(notice.deadline);
      return days >= 0 && days <= 15;
    })
    .sort((a, b) => getDaysRemaining(a.deadline) - getDaysRemaining(b.deadline))
    .slice(0, 3);

  soonContainer.innerHTML = endingSoon.map(notice => {
    const days = getDaysRemaining(notice.deadline);
    const daysText = days === 0 ? "TODAY" : days === 1 ? "TOMORROW" : `${days} DAYS`;
    return `
      <div class="deadline-item" onclick="openNoticeDetailModal('${notice.noticeId}')">
        <div class="deadline-info">
          <h4>${notice.title}</h4>
          <p>${notice.category} • Posted by ${notice.uploadedBy}</p>
        </div>
        <div class="deadline-countdown">
          <div>${daysText}</div>
          <div style="font-size: 0.5rem; opacity: 0.8; font-weight: 500;">LEFT</div>
        </div>
      </div>
    `;
  }).join('');

  // 4. Recommended Events (Matching student's interest/department HOD)
  const userDept = state.activeUser ? state.activeUser.department : 'Computer Science';
  
  // Find instructors in student's department
  const deptStaff = state.instructorsList
    .filter(i => i.department === userDept)
    .map(i => i.fullName);

  const recommended = state.notices.filter(notice => 
    notice.category === "Hackathons" || 
    notice.category === "Workshops" || 
    deptStaff.includes(notice.uploadedBy)
  ).sort((a, b) => {
    // prioritize department specific notices
    const aIsDept = deptStaff.includes(a.uploadedBy);
    const bIsDept = deptStaff.includes(b.uploadedBy);
    if (aIsDept && !bIsDept) return -1;
    if (!aIsDept && bIsDept) return 1;
    return 0;
  }).slice(0, 3);

  recomContainer.innerHTML = recommended.map(notice => renderVerticalNoticeCard(notice)).join('');
}

// Generate vertical layout card used across several dashboard lists
function renderVerticalNoticeCard(notice) {
  const isBookmarked = state.bookmarks.includes(notice.noticeId);
  const bookmarkClass = isBookmarked ? 'bookmarked' : '';
  const remainingDays = getDaysRemaining(notice.deadline);
  const daysText = formatDaysRemainingText(remainingDays);
  const isSoon = remainingDays >= 0 && remainingDays <= 3;
  const deadlineSpan = isSoon ? `<span class="soon">${daysText}</span>` : `<span>${daysText}</span>`;
  const isPinned = notice.visibilityStatus === 'pinned';

  // Category Badge Class Mapping
  const badgeClass = notice.category.toLowerCase().replace(" ", "-");

  return `
    <div class="notice-card" onclick="openNoticeDetailModal('${notice.noticeId}')">
      <div class="notice-top-row">
        <div class="notice-details-block">
          <span class="badge badge-${badgeClass}">${notice.category}</span>
          <h4 style="margin-top: 6px;">${isPinned ? '📌 ' : ''}${notice.title}</h4>
          <p class="notice-instructor" style="margin-top: 4px;">
            <i data-lucide="user"></i> ${notice.uploadedBy} • ${getRelativeTime(notice.timestamp)}
          </p>
        </div>
        <div onclick="event.stopPropagation()">
          <button class="save-btn ${bookmarkClass}" onclick="toggleBookmark('${notice.noticeId}')" aria-label="Save Opportunity">
            <i data-lucide="bookmark"></i>
          </button>
        </div>
      </div>
      <div class="ai-mini-summary" style="margin-top: 4px;">
        ${notice.aiSummary}
      </div>
      <div class="notice-info-footer">
        <span class="notice-deadline">Deadline: ${deadlineSpan}</span>
        <button class="btn btn-outline" style="padding: 5px 12px; font-size: 0.7rem; border-radius: 8px;">View Details</button>
      </div>
    </div>
  `;
}

// Render the Explore & Categories Page
function renderExploreTab() {
  const pillsBar = document.getElementById('category-pills-bar');
  const noticesContainer = document.getElementById('explore-notices-container');

  if (!pillsBar) return;

  // 1. Build Category Pills
  const categoriesList = [
    'All', 'Internships', 'Hackathons', 'Symposiums', 'Workshops', 
    'Placement Training', 'Competitions', 'Conferences', 'Webinars', 'Department Events'
  ];

  pillsBar.innerHTML = categoriesList.map(cat => {
    const filterVal = cat === 'All' ? 'all' : cat;
    const isActive = state.activeCategoryFilter === filterVal;
    return `
      <button class="pill-btn ${isActive ? 'active' : ''}" onclick="selectCategoryFilter('${filterVal}')">
        ${cat}
      </button>
    `;
  }).join('');

  // 2. Perform filtering on notices
  let filtered = [...state.notices];

  // Search keyword filter
  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.description.toLowerCase().includes(query) || 
      n.uploadedBy.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (state.activeCategoryFilter !== 'all') {
    filtered = filtered.filter(n => n.category === state.activeCategoryFilter);
  }

  // Department filter
  if (state.selectedDeptFilter !== 'all') {
    // Find instructors in that department
    const targetInstructors = state.instructors
      .filter(i => i.department === state.selectedDeptFilter)
      .map(i => i.fullName);

    filtered = filtered.filter(n => targetInstructors.includes(n.uploadedBy));
  }

  // Date Filter
  if (state.selectedDateFilter !== 'all') {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (state.selectedDateFilter === 'today') {
      filtered = filtered.filter(n => {
        const pDate = new Date(n.timestamp);
        pDate.setHours(0,0,0,0);
        return pDate.getTime() === today.getTime();
      });
    } else if (state.selectedDateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(n => new Date(n.timestamp) >= oneWeekAgo);
    }
  }

  // Sort: Pinned first, then by timestamp descending
  filtered.sort((a, b) => {
    if (a.visibilityStatus === 'pinned' && b.visibilityStatus !== 'pinned') return -1;
    if (a.visibilityStatus !== 'pinned' && b.visibilityStatus === 'pinned') return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Display notice list count
  const summaryText = document.getElementById('filter-summary-text');
  if (summaryText) {
    const count = filtered.length;
    summaryText.textContent = count === 1 ? '1 opportunity found' : `${count} opportunities found`;
  }

  // Render cards
  if (filtered.length === 0) {
    noticesContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <i data-lucide="frown" style="width: 40px; height: 40px; margin-bottom: 12px; stroke-width: 1.5;"></i>
        <h4>No opportunities found</h4>
        <p style="font-size: 0.75rem; margin-top: 4px;">Try loosening up your search filters or check back later.</p>
      </div>
    `;
  } else {
    noticesContainer.innerHTML = filtered.map(notice => renderVerticalNoticeCard(notice)).join('');
  }
}

function selectCategoryFilter(catFilter) {
  state.activeCategoryFilter = catFilter;
  renderExploreTab();
  lucide.createIcons();
}

function viewCategory(cat) {
  state.activeCategoryFilter = cat;
  switchTab('categories');
}

function handleFiltersChange() {
  state.searchQuery = document.getElementById('search-input').value;
  state.selectedDeptFilter = document.getElementById('filter-dept').value;
  state.selectedDateFilter = document.getElementById('filter-date').value;
  renderExploreTab();
  lucide.createIcons();
}

// Bookmarks/Saved Page Renderer
function renderBookmarksTab() {
  const container = document.getElementById('bookmarks-container');
  if (!container) return;

  const savedNotices = state.notices.filter(n => state.bookmarks.includes(n.noticeId));

  if (savedNotices.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i data-lucide="bookmark" style="width: 44px; height: 44px; margin-bottom: 14px; stroke-width: 1.5;"></i>
        <h3>No saved items yet</h3>
        <p style="font-size: 0.75rem; margin-top: 6px; line-height: 1.4;">Bookmarked notices will appear here so you can find them quickly later.</p>
      </div>
    `;
  } else {
    container.innerHTML = savedNotices.map(notice => renderVerticalNoticeCard(notice)).join('');
  }
}

// Notifications Tab Renderer
function renderNotificationsTab() {
  const container = document.getElementById('notifications-inbox-container');
  if (!container) return;

  if (state.notifications.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i data-lucide="bell-off" style="width: 44px; height: 44px; margin-bottom: 14px; stroke-width: 1.5;"></i>
        <h3>Inbox is empty</h3>
        <p style="font-size: 0.75rem; margin-top: 6px;">You will get instant alerts whenever an instructor publishes an update.</p>
      </div>
    `;
  } else {
    // Sort notifications by timestamp descending
    const sortedNoti = [...state.notifications].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = sortedNoti.map(noti => {
      const isUnread = !noti.read;
      const isUrgent = noti.urgent;
      const unreadClass = isUnread ? 'unread' : '';
      const icon = isUrgent ? 'alert-triangle' : 'bell';
      const iconClass = isUrgent ? 'urgent' : '';

      return `
        <div class="noti-card-item ${unreadClass}" onclick="markNotificationRead('${noti.notificationId}')">
          <div class="noti-card-icon ${iconClass}">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="noti-card-content">
            <h4>${noti.title}</h4>
            <p>${noti.message}</p>
            <span class="noti-card-time">${getRelativeTime(noti.timestamp)}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function markNotificationRead(notiId) {
  const noti = state.notifications.find(n => n.notificationId === notiId);
  if (noti) {
    noti.read = true;
    saveDatabase();
    renderAllPages();
  }
}

function clearAllNotifications() {
  state.notifications = [];
  saveDatabase();
  renderAllPages();
  showToast("Inbox Cleared", "Cleared all notifications", "info");
}

// ==========================================================================
// Bookmarking Core Engine
// ==========================================================================
function toggleBookmark(noticeId) {
  const index = state.bookmarks.indexOf(noticeId);
  let msg = "";
  if (index === -1) {
    state.bookmarks.push(noticeId);
    msg = "Added opportunity to bookmarks";
  } else {
    state.bookmarks.splice(index, 1);
    msg = "Removed opportunity from bookmarks";
  }
  
  saveDatabase();
  renderAllPages();
  lucide.createIcons();
  
  showToast("Bookmarks Updated", msg, "success");
}

// ==========================================================================
// Instructor Analytics and Dashboard Rendering
// ==========================================================================
function renderInstructorDashboard() {
  if (!state.activeUser) return;
  const activeInstructor = state.activeUser;
  document.getElementById('instructor-welcome-title').textContent = activeInstructor.fullName;
  document.getElementById('instructor-welcome-dept').innerHTML = `${activeInstructor.department} • ${activeInstructor.role}`;

  // Calculate statistics
  // Active notices uploaded by this logged-in staff member
  const uploaded = state.notices.filter(n => n.uploadedBy === activeInstructor.fullName);
  document.getElementById('stat-active-count').textContent = uploaded.length;

  // Bookmarks count: count how many times this staff member's notices are saved
  let bookmarksCount = 0;
  uploaded.forEach(n => {
    if (state.bookmarks.includes(n.noticeId)) {
      bookmarksCount++;
    }
  });
  // Add some fake randomized engagement metrics so dashboard looks premium
  const simulatedSaved = uploaded.length * 3 + bookmarksCount;
  document.getElementById('stat-bookmarks-count').textContent = simulatedSaved;

  // Clicks count: read from state.analytics.clicks
  let clicksCount = 0;
  uploaded.forEach(n => {
    clicksCount += (state.analytics.clicks[n.noticeId] || 0);
  });
  document.getElementById('stat-clicks-count').textContent = clicksCount;

  // Render uploaded notices list with Edit/Delete options
  const listContainer = document.getElementById('instructor-notices-container');
  if (!listContainer) return;

  if (uploaded.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); color: var(--text-muted);">
        <p style="font-size: 0.75rem;">You haven't uploaded any announcements yet. Click "New Post" to start.</p>
      </div>
    `;
  } else {
    // Pinned notices first, then date
    const sorted = [...uploaded].sort((a, b) => {
      if (a.visibilityStatus === 'pinned' && b.visibilityStatus !== 'pinned') return -1;
      if (a.visibilityStatus !== 'pinned' && b.visibilityStatus === 'pinned') return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    listContainer.innerHTML = sorted.map(notice => {
      const clicks = state.analytics.clicks[notice.noticeId] || 0;
      const views = state.analytics.views[notice.noticeId] || 0;
      const badge = notice.visibilityStatus === 'pinned' ? '📌 PINNED' : notice.category;

      return `
        <div class="editable-card">
          <div class="editable-card-info" onclick="openNoticeDetailModal('${notice.noticeId}')" style="cursor: pointer; flex: 1;">
            <h4>${notice.title}</h4>
            <p>${badge} • 📊 ${views} views • 🖱️ ${clicks} clicks</p>
          </div>
          <div class="editable-card-actions">
            <button class="edit-btn" onclick="openEditNoticeForm('${notice.noticeId}')" title="Edit Notice">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="delete-btn" onclick="deleteNotice('${notice.noticeId}')" title="Delete Notice">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
    lucide.createIcons();
  }
}

// ==========================================================================
// CRUD Actions (Notices)
// ==========================================================================
function openNewNoticeModal() {
  // Clear form fields
  document.getElementById('form-notice-id').value = "";
  document.getElementById('form-title').value = "";
  document.getElementById('form-desc').value = "";
  document.getElementById('form-category').value = "";
  document.getElementById('form-ai-classify').checked = false;
  document.getElementById('form-category').removeAttribute('disabled');
  document.getElementById('form-category').style.opacity = '1';
  document.getElementById('form-deadline').value = "";
  document.getElementById('form-reg-link').value = "";
  document.getElementById('form-poster-select').value = "tech_banner.jpg";
  document.getElementById('form-pdf-select').value = "brochure.pdf";
  document.getElementById('form-pinned').checked = false;
  document.getElementById('form-scheduled').checked = false;
  document.getElementById('schedule-date-group').classList.add('hidden');
  
  document.getElementById('notice-form-title').textContent = "Create Announcement";
  document.getElementById('btn-submit-notice').textContent = "Post Notice";

  document.getElementById('notice-form-modal').classList.add('active');
}

function openEditNoticeForm(noticeId) {
  const notice = state.notices.find(n => n.noticeId === noticeId);
  if (!notice) return;

  // Fill form fields
  document.getElementById('form-notice-id').value = notice.noticeId;
  document.getElementById('form-title').value = notice.title;
  document.getElementById('form-desc').value = notice.description;
  document.getElementById('form-category').value = notice.category;
  document.getElementById('form-ai-classify').checked = false;
  document.getElementById('form-category').removeAttribute('disabled');
  document.getElementById('form-category').style.opacity = '1';
  document.getElementById('form-deadline').value = notice.deadline;
  document.getElementById('form-reg-link').value = notice.registrationLink;
  
  // Try mapping poster URL back to select
  let posterName = "tech_banner.jpg";
  for (const [key, val] of Object.entries(BANNER_MAPPING)) {
    if (val === notice.imageURL) posterName = key;
  }
  document.getElementById('form-poster-select').value = posterName;
  document.getElementById('form-pdf-select').value = notice.pdfURL === 'none' ? 'none' : notice.pdfURL;
  
  document.getElementById('form-pinned').checked = notice.visibilityStatus === 'pinned';
  document.getElementById('form-scheduled').checked = notice.visibilityStatus === 'scheduled';
  
  const scheduleGroup = document.getElementById('schedule-date-group');
  if (notice.visibilityStatus === 'scheduled') {
    scheduleGroup.classList.remove('hidden');
    // populate simulated schedule date (2 days from now)
    const future = new Date();
    future.setDate(future.getDate() + 2);
    document.getElementById('form-schedule-time').value = future.toISOString().slice(0, 16);
  } else {
    scheduleGroup.classList.add('hidden');
  }

  document.getElementById('notice-form-title').textContent = "Edit Announcement";
  document.getElementById('btn-submit-notice').textContent = "Update Notice";

  document.getElementById('notice-form-modal').classList.add('active');
}

function closeNoticeFormModal(event) {
  if (!event || event.target === document.getElementById('notice-form-modal')) {
    document.getElementById('notice-form-modal').classList.remove('active');
  }
}

function toggleScheduleDate(checkbox) {
  const group = document.getElementById('schedule-date-group');
  if (checkbox.checked) {
    group.classList.remove('hidden');
    // Set default schedule date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    document.getElementById('form-schedule-time').value = tomorrow.toISOString().slice(0, 16);
  } else {
    group.classList.add('hidden');
  }
}

function handleNoticeFormSubmit(event) {
  event.preventDefault();

  if (state.currentRole !== 'instructor') {
    showToast("Access Restricted", "Access Restricted: Only authorized staff members can create or manage announcements.", "danger");
    return;
  }

  const noticeId = document.getElementById('form-notice-id').value;
  const title = document.getElementById('form-title').value;
  const desc = document.getElementById('form-desc').value;
  const category = document.getElementById('form-category').value;
  const deadline = document.getElementById('form-deadline').value;
  const regLink = document.getElementById('form-reg-link').value;
  const posterFile = document.getElementById('form-poster-select').value;
  const pdfFile = document.getElementById('form-pdf-select').value;
  const isPinned = document.getElementById('form-pinned').checked;
  const isScheduled = document.getElementById('form-scheduled').checked;
  const scheduleTime = document.getElementById('form-schedule-time').value;

  const activeInstructor = state.activeUser || state.instructorsList[0];
  const imageURL = BANNER_MAPPING[posterFile] || BANNER_MAPPING["tech_banner.jpg"];

  let visibilityStatus = "active";
  if (isPinned) visibilityStatus = "pinned";
  else if (isScheduled) visibilityStatus = "scheduled";

  const aiSummary = generateAISummary(title, desc, deadline);

  if (noticeId === "") {
    // 1. CREATE ACTION
    const newNotice = {
      noticeId: "notice_" + Date.now(),
      title,
      description: desc,
      category,
      deadline,
      registrationLink: regLink || "https://college.edu/register-simulated",
      imageURL,
      pdfURL: pdfFile,
      uploadedBy: activeInstructor.fullName,
      timestamp: new Date().toISOString(),
      aiSummary,
      visibilityStatus
    };

    // Save in DB
    state.notices.push(newNotice);
    state.analytics.clicks[newNotice.noticeId] = 0;
    state.analytics.views[newNotice.noticeId] = 0;

    // Trigger FCM Sim Notification
    if (visibilityStatus !== "scheduled") {
      triggerPushNotification(newNotice);
    } else {
      showToast("Post Scheduled", `Notice will go live on ${new Date(scheduleTime).toLocaleDateString()}`, "warning");
    }

    showToast("Notice Published", `"${title}" has been posted successfully.`, "success");

  } else {
    // 2. UPDATE ACTION
    const noticeIdx = state.notices.findIndex(n => n.noticeId === noticeId);
    if (noticeIdx !== -1) {
      const existing = state.notices[noticeIdx];
      state.notices[noticeIdx] = {
        ...existing,
        title,
        description: desc,
        category,
        deadline,
        registrationLink: regLink || existing.registrationLink,
        imageURL,
        pdfURL: pdfFile,
        aiSummary,
        visibilityStatus
      };
      showToast("Notice Updated", "Announcement details updated successfully.", "success");
    }
  }

  saveDatabase();
  closeNoticeFormModal(null);
  renderAllPages();
  renderInstructorDashboard();
}

function deleteNotice(noticeId) {
  if (state.currentRole !== 'instructor') {
    showToast("Access Restricted", "Access Restricted: Only authorized staff members can create or manage announcements.", "danger");
    return;
  }

  if (confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
    state.notices = state.notices.filter(n => n.noticeId !== noticeId);
    // Remove from bookmarks if present
    state.bookmarks = state.bookmarks.filter(id => id !== noticeId);
    
    saveDatabase();
    showToast("Notice Deleted", "Announcment removed from board.", "warning");
    
    renderAllPages();
    renderInstructorDashboard();
  }
}

// Simulated Firebase Cloud Messaging Notification Router
function triggerPushNotification(notice) {
  const newNoti = {
    notificationId: "noti_" + Date.now(),
    title: `New ${notice.category.replace("s", "")} Added`,
    message: `${notice.uploadedBy} posted: "${notice.title}" in ${notice.category}.`,
    category: notice.category,
    timestamp: new Date().toISOString(),
    read: false
  };

  state.notifications.push(newNoti);
  saveDatabase();
  renderNotificationsTab();

  // Create overlay toast
  showToast(newNoti.title, newNoti.message, "success", () => {
    openNoticeDetailModal(notice.noticeId);
  });
}

// ==========================================================================
// Details Modal Window Renderer
// ==========================================================================
function openNoticeDetailModal(noticeId) {
  const notice = state.notices.find(n => n.noticeId === noticeId);
  if (!notice) return;

  // Increment view analytic
  state.analytics.views[notice.noticeId] = (state.analytics.views[notice.noticeId] || 0) + 1;
  saveDatabase();
  if (state.currentTab === 'instructor') {
    renderInstructorDashboard();
  }

  const modalBody = document.getElementById('detail-modal-body');
  const modal = document.getElementById('notice-detail-modal');

  const remainingDays = getDaysRemaining(notice.deadline);
  const deadlineText = formatDaysRemainingText(remainingDays);
  
  const isBookmarked = state.bookmarks.includes(notice.noticeId);
  const bookmarkText = isBookmarked ? 'Saved' : 'Save Opportunity';
  const bookmarkIcon = isBookmarked ? 'check' : 'bookmark';
  const bookmarkBtnClass = isBookmarked ? 'btn-primary' : 'btn-outline';

  let pdfSection = '';
  if (notice.pdfURL && notice.pdfURL !== 'none') {
    pdfSection = `
      <div class="detail-desc-block">
        <span class="detail-desc-title">Attached Document</span>
        <div class="detail-attachment-box" onclick="simulatePDFOpen('${notice.pdfURL}')" style="cursor:pointer;">
          <div class="attachment-info">
            <i data-lucide="file-text"></i>
            <span>${notice.pdfURL}</span>
          </div>
          <i data-lucide="download" class="download-icon"></i>
        </div>
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="detail-header-img" style="background-image: url('${notice.imageURL}')"></div>
    
    <div class="detail-meta-row">
      <span class="badge badge-${notice.category.toLowerCase().replace(" ", "-")}">${notice.category}</span>
      <span style="font-size: 0.72rem; color: var(--text-muted);">Posted ${new Date(notice.timestamp).toLocaleDateString()}</span>
    </div>

    <h2 class="detail-title">${notice.title}</h2>
    
    <div class="notice-instructor">
      <i data-lucide="user"></i>
      <span>Posted by <strong>${notice.uploadedBy}</strong> • Campus Instructor</span>
    </div>

    <!-- AI Summary Box -->
    <div class="detail-ai-summary">
      <div class="detail-ai-summary-title">
        <i data-lucide="sparkles"></i> AI-Generated Summary
      </div>
      <div class="detail-ai-summary-text">
        ${notice.aiSummary}
      </div>
    </div>

    <!-- Description -->
    <div class="detail-desc-block">
      <span class="detail-desc-title">Description</span>
      <p class="detail-desc-text">${notice.description}</p>
    </div>

    <!-- Deadline -->
    <div class="detail-desc-block">
      <span class="detail-desc-title">Enrollment / Application Deadline</span>
      <div style="font-size: 0.8rem; color: var(--danger-color); font-weight: 700; display:flex; align-items:center; gap:6px;">
        <i data-lucide="calendar"></i> ${new Date(notice.deadline).toLocaleDateString()} (${deadlineText})
      </div>
    </div>

    <!-- PDF Attachment if any -->
    ${pdfSection}

    <!-- Action Bar -->
    <div class="detail-footer-btn-row">
      <button class="btn ${bookmarkBtnClass}" onclick="toggleBookmarkFromModal('${notice.noticeId}')">
        <i data-lucide="${bookmarkIcon}"></i> ${bookmarkText}
      </button>
      <button class="btn btn-primary" onclick="simulateRegistrationClick('${notice.noticeId}', '${notice.registrationLink}')">
        Apply / Register <i data-lucide="external-link"></i>
      </button>
    </div>
  `;

  modal.classList.add('active');
  lucide.createIcons();
}

function toggleBookmarkFromModal(noticeId) {
  toggleBookmark(noticeId);
  // Re-open detail modal to update state visually
  openNoticeDetailModal(noticeId);
}

function closeNoticeDetailModal(event) {
  if (!event || event.target === document.getElementById('notice-detail-modal')) {
    document.getElementById('notice-detail-modal').classList.remove('active');
  }
}

// Simulate actions
function simulatePDFOpen(filename) {
  showToast("Opening Document", `Simulating PDF viewer for ${filename}`, "info");
}

function simulateRegistrationClick(noticeId, link) {
  // Increment clicks analytic
  state.analytics.clicks[noticeId] = (state.analytics.clicks[noticeId] || 0) + 1;
  saveDatabase();
  
  showToast("Redirecting Opportunity", "Opening external registration link...", "success");
  
  setTimeout(() => {
    window.open(link, '_blank');
  }, 1000);
}

// ==========================================================================
// Dynamic Toast Alert System
// ==========================================================================
function showToast(title, message, type = 'success', clickCallback = null) {
  const container = document.getElementById('toast-stack-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-alert ${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  else if (type === 'warning') icon = 'alert-circle';
  else if (type === 'danger') icon = 'shield-alert';

  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${icon}"></i></div>
    <div class="toast-content" style="${clickCallback ? 'cursor:pointer;' : ''}">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <button class="toast-close-btn">&times;</button>
  `;

  // Handle click on content redirect
  if (clickCallback) {
    toast.querySelector('.toast-content').addEventListener('click', () => {
      clickCallback();
      toast.remove();
    });
  }

  // Handle close click
  toast.querySelector('.toast-close-btn').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);
  lucide.createIcons();

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 6000);
}

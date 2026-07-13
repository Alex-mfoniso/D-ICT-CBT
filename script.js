const STORAGE_KEY = "office-cbt-state-v1";
const SCORES_KEY = "office-cbt-scores-v1";
const ADMIN_AUTH_KEY = "office-cbt-admin-auth-v1";
const STUDENT_AUTH_KEY = "office-cbt-student-auth-v1";
const FIREBASE_CONFIG_KEY = "office-cbt-firebase-config-v1";
const FIREBASE_COLLECTION = "cbtExams";
const FIREBASE_SCORES_COLLECTION = "cbtScores";
const FIREBASE_DOC = "office-exam";
const ADMIN_PASSWORD = "office123";

// Paste your Firebase web app config here if you want a code fallback.
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAT26t957y5IsPIWhDYPJq0BqFLRZsyqEk",
  authDomain: "dict-33c4d.firebaseapp.com",
  projectId: "dict-33c4d",
  storageBucket: "dict-33c4d.firebasestorage.app",
  messagingSenderId: "1007854757672",
  appId: "1:1007854757672:web:31c47e9981dd8e1853921d",
  measurementId: "G-FR4VR6SHYC"
};

let firebaseConfig = loadFirebaseConfig();
let firebaseSdkPromise = null;
let examLockActive = false;
let examFullscreenSeen = false;
let escWarningArmed = false;
let escWarningTimer = null;

const defaultState = {
  examTitle: "Microsoft Office CBT Exam",
  studentUsers: [
    { username: "student1", displayName: "Student One", password: "1234", active: true, approved: true }
  ],
  questions: [
    { topic: "Word", question: "What is Microsoft Word mainly used for?", options: ["Spreadsheets", "Word processing", "Presentations", "Email"], correctIndex: 1 },
    { topic: "Word", question: "Which shortcut saves a document?", options: ["Ctrl + P", "Ctrl + S", "Ctrl + V", "Ctrl + X"], correctIndex: 1 },
    { topic: "Word", question: "What is the common file extension for a Word document?", options: [".pptx", ".xlsx", ".docx", ".accdb"], correctIndex: 2 },
    { topic: "Word", question: "Which shortcut prints a document?", options: ["Ctrl + N", "Ctrl + O", "Ctrl + P", "Ctrl + R"], correctIndex: 2 },
    { topic: "Word", question: "Which tab is commonly used to change font settings?", options: ["Insert", "Home", "View", "Review"], correctIndex: 1 },
    { topic: "Word", question: "Which key creates a new line while typing?", options: ["Tab", "Enter", "Shift", "Esc"], correctIndex: 1 },
    { topic: "Word", question: "Which feature checks spelling and grammar?", options: ["AutoFill", "Spelling & Grammar", "Sort", "Merge"], correctIndex: 1 },
    { topic: "Word", question: "How do you insert a table in Word?", options: ["Insert > Table", "View > Table", "Home > Table", "File > Table"], correctIndex: 0 },
    { topic: "Word", question: "Which alignment makes text flush on both left and right margins?", options: ["Center", "Right", "Justify", "Left"], correctIndex: 2 },
    { topic: "Word", question: "What is the shortcut for bold text?", options: ["Ctrl + I", "Ctrl + B", "Ctrl + U", "Ctrl + L"], correctIndex: 1 },

    { topic: "Excel", question: "Microsoft Excel is mainly used for?", options: ["Word processing", "Spreadsheet work", "Email management", "Drawing"], correctIndex: 1 },
    { topic: "Excel", question: "A workbook is made up of?", options: ["Slides", "Sheets", "Folders", "Paragraphs"], correctIndex: 1 },
    { topic: "Excel", question: "The intersection of a row and column is called a?", options: ["Cell", "Chart", "Sheet", "Range"], correctIndex: 0 },
    { topic: "Excel", question: "Every Excel formula starts with which symbol?", options: ["+", "=", "#", "@"], correctIndex: 1 },
    { topic: "Excel", question: "Column labels in Excel are usually?", options: ["Numbers", "Letters", "Symbols", "Colors"], correctIndex: 1 },
    { topic: "Excel", question: "What does SUM() do?", options: ["Finds the maximum", "Adds numbers", "Formats cells", "Inserts an image"], correctIndex: 1 },
    { topic: "Excel", question: "Which is an absolute reference example?", options: ["A1", "$A$1", "1A", "A$1$"], correctIndex: 1 },
    { topic: "Excel", question: "Which function finds the average of numbers?", options: ["AVG()", "MEAN()", "AVERAGE()", "MID()"], correctIndex: 2 },
    { topic: "Excel", question: "Which chart is best for showing parts of a whole?", options: ["Pie chart", "Line chart", "Scatter chart", "Radar chart"], correctIndex: 0 },
    { topic: "Excel", question: "What feature arranges data in order?", options: ["Sort", "Merge", "Protect", "Freeze"], correctIndex: 0 },

    { topic: "PowerPoint", question: "Microsoft PowerPoint is used for?", options: ["Emails", "Presentations", "Spreadsheets", "Databases"], correctIndex: 1 },
    { topic: "PowerPoint", question: "What do we call the pages in PowerPoint?", options: ["Sheets", "Slides", "Rows", "Cells"], correctIndex: 1 },
    { topic: "PowerPoint", question: "Which key starts Slide Show mode?", options: ["F2", "F4", "F5", "F12"], correctIndex: 2 },
    { topic: "PowerPoint", question: "What is the box used for writing text on a slide?", options: ["Text box", "Cell", "Pane", "Row"], correctIndex: 0 },
    { topic: "PowerPoint", question: "What is the effect between one slide and the next called?", options: ["Transition", "Formula", "Filter", "Border"], correctIndex: 0 },
    { topic: "PowerPoint", question: "Which command adds a new slide?", options: ["Insert > New Slide", "Home > Close", "View > Slide Sorter", "File > Export"], correctIndex: 0 },

    { topic: "Outlook", question: "Microsoft Outlook is mainly used for?", options: ["Email management", "Drawing", "Typing code", "Calculating"], correctIndex: 0 },
    { topic: "Outlook", question: "Where are incoming emails stored?", options: ["Drafts", "Inbox", "Sent", "Archive"], correctIndex: 1 },
    { topic: "Outlook", question: "The folder for deleted emails is?", options: ["Trash", "Deleted Items", "Junk", "Notes"], correctIndex: 1 },
    { topic: "Outlook", question: "To attach a file, you usually click?", options: ["Attach File", "Spell Check", "Reply All", "Calendar"], correctIndex: 0 },
    { topic: "Outlook", question: "BCC means?", options: ["Blind Carbon Copy", "Basic Copy", "Busy Contact Card", "Blank Code"], correctIndex: 0 },
    { topic: "Outlook", question: "Where are scheduled meetings stored?", options: ["Contacts", "Calendar", "Tasks", "Drafts"], correctIndex: 1 },
    { topic: "Outlook", question: "To reply to everyone, you click?", options: ["Reply", "Reply All", "Forward", "Send Later"], correctIndex: 1 },
    { topic: "Outlook", question: "What is used for an automatic reply when away?", options: ["Signature", "Out of Office", "Rules", "Draft"], correctIndex: 1 },
    { topic: "Outlook", question: "Contacts in Outlook stores?", options: ["Emails", "Meeting notes", "People information", "Deleted files"], correctIndex: 2 },

    { topic: "Windows and Shortcuts", question: "Which command is used to rename a file?", options: ["Rename", "Replace", "Attach", "Paste"], correctIndex: 0 },
    { topic: "Windows and Shortcuts", question: "Which shortcut copies selected text?", options: ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z"], correctIndex: 1 },
    { topic: "Windows and Shortcuts", question: "Which shortcut pastes copied text?", options: ["Ctrl + P", "Ctrl + S", "Ctrl + V", "Ctrl + B"], correctIndex: 2 },
    { topic: "Windows and Shortcuts", question: "Which shortcut cuts selected text?", options: ["Ctrl + X", "Ctrl + Y", "Ctrl + K", "Ctrl + U"], correctIndex: 0 },
    { topic: "Windows and Shortcuts", question: "Which shortcut undoes the last action?", options: ["Ctrl + Y", "Ctrl + Z", "Ctrl + A", "Ctrl + F"], correctIndex: 1 }
  ]
};

function readLocalState() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocalState(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage limits or file-origin restrictions.
  }
}

function readLocalScores() {
  try {
    return localStorage.getItem(SCORES_KEY);
  } catch {
    return null;
  }
}

function writeLocalScores(value) {
  try {
    localStorage.setItem(SCORES_KEY, value);
  } catch {
    // Ignore storage limits or file-origin restrictions.
  }
}

function readLocalFirebaseConfig() {
  try {
    return localStorage.getItem(FIREBASE_CONFIG_KEY);
  } catch {
    return null;
  }
}

function writeLocalFirebaseConfig(value) {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, value);
  } catch {
    // Ignore storage limits or file-origin restrictions.
  }
}

function clearLocalFirebaseConfig() {
  try {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  } catch {
    // Ignore storage limits or file-origin restrictions.
  }
}

function loadFirebaseConfig() {
  const raw = readLocalFirebaseConfig();
  if (!raw) {
    return { ...defaultFirebaseConfig };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultFirebaseConfig,
      ...parsed
    };
  } catch {
    return { ...defaultFirebaseConfig };
  }
}

function loadScores() {
  const raw = readLocalScores();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStudentSession() {
  try {
    const raw = sessionStorage.getItem(STUDENT_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStudentSession(value) {
  try {
    if (value) {
      sessionStorage.setItem(STUDENT_AUTH_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(STUDENT_AUTH_KEY);
    }
  } catch {
    // Ignore session storage limits.
  }
}

const appState = loadState();
const pageMode = document.body?.dataset?.page || "student";
const isStudentPage = pageMode === "student";
const isAdminPage = pageMode === "admin";
let currentIndex = 0;
let answers = Array(appState.questions.length).fill(null);
let editingIndex = null;
let editingStudentIndex = null;
let firebaseReady = false;
let db = null;
let scoreAttempts = loadScores();
let currentStudent = readStudentSession();

const examTitleLabel = document.getElementById("examTitleLabel");
const storagePill = document.getElementById("storagePill");
const questionCountPill = document.getElementById("questionCountPill");
const bankCountPill = document.getElementById("bankCountPill");
const studentGate = document.getElementById("studentGate");
const studentApp = document.getElementById("studentApp");
const adminGate = document.getElementById("adminGate");
const adminApp = document.getElementById("adminApp");
const examView = document.getElementById("examView");
const resultView = document.getElementById("resultView");
const adminView = document.getElementById("adminView");
const questionCounter = document.getElementById("questionCounter");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const questionTopic = document.getElementById("questionTopic");
const questionText = document.getElementById("questionText");
const optionsWrap = document.getElementById("options");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const clearBtn = document.getElementById("clearBtn");
const submitBtn = document.getElementById("submitBtn");
const backToExamBtn = document.getElementById("backToExamBtn");
const scoreValue = document.getElementById("scoreValue");
const percentValue = document.getElementById("percentValue");
const remarkValue = document.getElementById("remarkValue");
const reviewText = document.getElementById("reviewText");
const reviewList = document.getElementById("reviewList");
const submitModal = document.getElementById("submitModal");
const cancelSubmitBtn = document.getElementById("cancelSubmitBtn");
const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");
const escWarningModal = document.getElementById("escWarningModal");
const escWarningCancelBtn = document.getElementById("escWarningCancelBtn");
const examTitleInput = document.getElementById("examTitleInput");
const topicInput = document.getElementById("topicInput");
const questionInput = document.getElementById("questionInput");
const optionAInput = document.getElementById("optionAInput");
const optionBInput = document.getElementById("optionBInput");
const optionCInput = document.getElementById("optionCInput");
const optionDInput = document.getElementById("optionDInput");
const correctInput = document.getElementById("correctInput");
const saveQuestionBtn = document.getElementById("saveQuestionBtn");
const resetFormBtn = document.getElementById("resetFormBtn");
const restoreDefaultsBtn = document.getElementById("restoreDefaultsBtn");
const saveAllBtn = document.getElementById("saveAllBtn");
const adminQuestionList = document.getElementById("adminQuestionList");
const studentLoginUsernameInput = document.getElementById("studentLoginUsernameInput");
const studentLoginPasswordInput = document.getElementById("studentLoginPasswordInput");
const studentLoginBtn = document.getElementById("studentLoginBtn");
const studentLoginErrorText = document.getElementById("studentLoginErrorText");
const studentLogoutBtn = document.getElementById("studentLogoutBtn");
const studentSessionLabel = document.getElementById("studentSessionLabel");
const formHeading = document.getElementById("formHeading");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const adminErrorText = document.getElementById("adminErrorText");
const firebaseStatusPill = document.getElementById("firebaseStatusPill");
const firebaseApiKeyInput = document.getElementById("firebaseApiKeyInput");
const firebaseAuthDomainInput = document.getElementById("firebaseAuthDomainInput");
const firebaseProjectIdInput = document.getElementById("firebaseProjectIdInput");
const firebaseStorageBucketInput = document.getElementById("firebaseStorageBucketInput");
const firebaseMessagingSenderIdInput = document.getElementById("firebaseMessagingSenderIdInput");
const firebaseAppIdInput = document.getElementById("firebaseAppIdInput");
const firebaseMeasurementIdInput = document.getElementById("firebaseMeasurementIdInput");
const saveFirebaseBtn = document.getElementById("saveFirebaseBtn");
const loadFirebaseBtn = document.getElementById("loadFirebaseBtn");
const clearFirebaseBtn = document.getElementById("clearFirebaseBtn");
const totalAttemptsValue = document.getElementById("totalAttemptsValue");
const averageScoreValue = document.getElementById("averageScoreValue");
const bestScoreValue = document.getElementById("bestScoreValue");
const scoreCountPill = document.getElementById("scoreCountPill");
const scoreTableBody = document.getElementById("scoreTableBody");
const studentUserUsernameInput = document.getElementById("studentUserUsernameInput");
const studentUserDisplayNameInput = document.getElementById("studentUserDisplayNameInput");
const studentUserPasswordInput = document.getElementById("studentUserPasswordInput");
const studentUserActiveInput = document.getElementById("studentUserActiveInput");
const saveStudentUserBtn = document.getElementById("saveStudentUserBtn");
const resetStudentUserBtn = document.getElementById("resetStudentUserBtn");
const studentUserList = document.getElementById("studentUserList");
const studentUserCountPill = document.getElementById("studentUserCountPill");

function cloneState(state) {
  return {
    examTitle: state.examTitle,
    studentUsers: Array.isArray(state.studentUsers)
      ? state.studentUsers.map((item) => ({
          username: item.username,
          displayName: item.displayName,
          password: item.password,
          active: item.active !== false,
          approved: item.approved !== false
        }))
      : [],
    questions: state.questions.map((item) => ({
      topic: item.topic,
      question: item.question,
      options: [...item.options],
      correctIndex: item.correctIndex
    }))
  };
}

function loadState() {
  const raw = readLocalState();
  if (!raw) {
    return cloneState(defaultState);
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return cloneState(defaultState);
  }
}

function normalizeState(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const examTitle = typeof source.examTitle === "string" && source.examTitle.trim()
    ? source.examTitle.trim()
    : defaultState.examTitle;
  const normalizedUsers = Array.isArray(source.studentUsers) && source.studentUsers.length
    ? source.studentUsers.map(normalizeStudentUser).filter(Boolean)
    : [];

  const normalizedQuestions = Array.isArray(source.questions) && source.questions.length
    ? source.questions.map(normalizeQuestion).filter(Boolean)
    : [];
  const questions = normalizedQuestions.length
    ? normalizedQuestions
    : cloneState(defaultState).questions;
  const studentUsers = normalizedUsers.length
    ? normalizedUsers
    : cloneState(defaultState).studentUsers;

  return { examTitle, questions, studentUsers };
}

function normalizeStudentUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const username = String(user.username || "").trim();
  const displayName = String(user.displayName || username || "").trim();
  const password = String(user.password || "").trim();

  if (!username || !password) {
    return null;
  }

  return {
    username,
    displayName: displayName || username,
    password,
    active: user.active !== false,
    approved: user.approved !== false
  };
}

function normalizeQuestion(question) {
  if (!question || typeof question !== "object") {
    return null;
  }

  const topic = typeof question.topic === "string" && question.topic.trim() ? question.topic.trim() : "Office";
  const text = typeof question.question === "string" && question.question.trim() ? question.question.trim() : "";
  const options = Array.isArray(question.options) ? question.options.slice(0, 4).map((item) => String(item ?? "").trim()) : [];
  while (options.length < 4) {
    options.push("");
  }

  const correctIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : 0;

  if (!text || options.some((option) => !option)) {
    return null;
  }

  return {
    topic,
    question: text,
    options,
    correctIndex: Math.min(Math.max(correctIndex, 0), 3)
  };
}

function saveState() {
  writeLocalState(JSON.stringify(appState));
  syncToFirebase().catch(() => {});
}

function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

function initFirebase() {
  if (!hasFirebaseConfig()) {
    updateFirebaseStatus(readLocalFirebaseConfig() ? "Saved" : "Local Storage", false);
    return;
  }

  if (!window.firebase) {
    updateFirebaseStatus("Loading Firebase", false);
    return loadFirebaseSdk()
      .then(() => initFirebase())
      .catch(() => {
        updateFirebaseStatus("Local Storage", false);
      });
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  db = firebase.firestore();
  firebaseReady = true;
  updateFirebaseStatus("Firebase", true);
}

function loadFirebaseSdk() {
  if (window.firebase) {
    return Promise.resolve();
  }

  if (firebaseSdkPromise) {
    return firebaseSdkPromise;
  }

  firebaseSdkPromise = new Promise((resolve, reject) => {
    const appScript = document.createElement("script");
    appScript.src = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
    appScript.onload = () => {
      const firestoreScript = document.createElement("script");
      firestoreScript.src = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js";
      firestoreScript.onload = () => resolve();
      firestoreScript.onerror = () => reject(new Error("Failed to load Firebase Firestore"));
      document.head.appendChild(firestoreScript);
    };
    appScript.onerror = () => reject(new Error("Failed to load Firebase App"));
    document.head.appendChild(appScript);
  });

  return firebaseSdkPromise;
}

async function syncToFirebase() {
  if (!firebaseReady || !db) {
    return false;
  }

  await db.collection(FIREBASE_COLLECTION).doc(FIREBASE_DOC).set({
    examTitle: appState.examTitle,
    studentUsers: appState.studentUsers,
    questions: appState.questions,
    updatedAt: Date.now()
  }, { merge: true });
  return true;
}

async function syncScoreToFirebase(scoreRecord) {
  if (!firebaseReady || !db) {
    return;
  }

  await db.collection(FIREBASE_SCORES_COLLECTION).doc(scoreRecord.id).set(scoreRecord, { merge: true });
}

async function loadScoresFromFirebase() {
  if (!firebaseReady || !db) {
    return;
  }

  try {
    const snap = await db.collection(FIREBASE_SCORES_COLLECTION).get();
    const remoteScores = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data && typeof data === "object") {
        remoteScores.push({
          id: doc.id,
          examTitle: typeof data.examTitle === "string" ? data.examTitle : appState.examTitle,
          studentUsername: typeof data.studentUsername === "string" ? data.studentUsername : "",
          studentName: typeof data.studentName === "string" ? data.studentName : "",
          score: Number(data.score) || 0,
          total: Number(data.total) || appState.questions.length,
          percent: Number(data.percent) || 0,
          remark: typeof data.remark === "string" ? data.remark : "Keep practicing",
          submittedAt: Number(data.submittedAt) || Date.now()
        });
      }
    });

    if (remoteScores.length) {
      const merged = mergeScoreAttempts(scoreAttempts, remoteScores);
      scoreAttempts = merged;
      persistScoreAttempts(false);
    }
  } catch {
    // Local score storage remains available.
  }
}

async function syncAllScoresToFirebase() {
  if (!firebaseReady || !db) {
    return;
  }

  await Promise.all(scoreAttempts.map((record) => syncScoreToFirebase(record).catch(() => {})));
}

async function ensureFirebaseReady() {
  if (firebaseReady && db) {
    return true;
  }

  if (!hasFirebaseConfig()) {
    return false;
  }

  try {
    await Promise.resolve(initFirebase());
  } catch {
    return false;
  }

  return firebaseReady && db;
}

async function syncAppStateToFirebase(reason = "app state") {
  const ready = await ensureFirebaseReady();
  if (!ready) {
    updateFirebaseStatus("Local Storage", false);
    return false;
  }

  try {
    await syncToFirebase();
    updateFirebaseStatus("Firebase", true);
    return true;
  } catch (error) {
    console.error(`Firebase sync failed for ${reason}:`, error);
    updateFirebaseStatus("Sync failed", false);
    return false;
  }
}

function mergeScoreAttempts(localScores, remoteScores) {
  const byId = new Map();
  [...localScores, ...remoteScores].forEach((item) => {
    if (item && item.id) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values()).sort((a, b) => b.submittedAt - a.submittedAt);
}

function persistScoreAttempts(syncRemote = true, latestRecord = null) {
  writeLocalScores(JSON.stringify(scoreAttempts));
  if (syncRemote && latestRecord) {
    syncScoreToFirebase(latestRecord).catch(() => {});
  }
}

async function loadFromFirebase() {
  if (!firebaseReady || !db) {
    return;
  }

  try {
    const snap = await db.collection(FIREBASE_COLLECTION).doc(FIREBASE_DOC).get();
    if (snap.exists) {
      const data = snap.data() || {};
      if (typeof data.examTitle === "string" && data.examTitle.trim()) {
        appState.examTitle = data.examTitle.trim();
      }
      if (Array.isArray(data.studentUsers) && data.studentUsers.length) {
        const users = data.studentUsers.map(normalizeStudentUser).filter(Boolean);
        if (users.length) {
          appState.studentUsers = users;
        }
      }
      if (Array.isArray(data.questions) && data.questions.length) {
        const questions = data.questions.map(normalizeQuestion).filter(Boolean);
        if (questions.length) {
          appState.questions = questions;
        }
      }
    }
  } catch {
    // Local data stays active if Firebase is unavailable.
  }
}

function updateTopLabels() {
  if (examTitleLabel) {
    examTitleLabel.textContent = appState.examTitle;
  }
  if (questionCountPill) {
    questionCountPill.textContent = `${appState.questions.length} Questions`;
  }
  if (bankCountPill) {
    bankCountPill.textContent = `${appState.questions.length} Questions`;
  }
}

function getFirebaseFormConfig() {
  return {
    apiKey: firebaseApiKeyInput?.value.trim() || "",
    authDomain: firebaseAuthDomainInput?.value.trim() || "",
    projectId: firebaseProjectIdInput?.value.trim() || "",
    storageBucket: firebaseStorageBucketInput?.value.trim() || "",
    messagingSenderId: firebaseMessagingSenderIdInput?.value.trim() || "",
    appId: firebaseAppIdInput?.value.trim() || "",
    measurementId: firebaseMeasurementIdInput?.value.trim() || ""
  };
}

function getCurrentStudent() {
  if (currentStudent && currentStudent.username) {
    return currentStudent;
  }

  currentStudent = readStudentSession();
  return currentStudent;
}

function setCurrentStudent(user) {
  currentStudent = user;
  writeStudentSession(user);
}

function clearCurrentStudent() {
  currentStudent = null;
  writeStudentSession(null);
}

function isStudentAuthenticated() {
  return Boolean(getCurrentStudent());
}

function isExamSessionActive() {
  return isStudentPage && isStudentAuthenticated();
}

function enterExamLockMode() {
  if (!isExamSessionActive() || examLockActive) {
    return;
  }

  examLockActive = true;
  document.body.classList.add("exam-lock-active");

  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function exitExamLockMode() {
  if (!examLockActive) {
    return;
  }

  examLockActive = false;
  examFullscreenSeen = false;
  document.body.classList.remove("exam-lock-active");

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function enforceExamLock() {
  if (isExamSessionActive()) {
    enterExamLockMode();
  } else {
    exitExamLockMode();
  }
}

function showStudentGate() {
  if (studentGate) studentGate.classList.remove("hidden");
  if (studentApp) studentApp.classList.add("hidden");
  if (examView) examView.classList.add("hidden");
  if (resultView) resultView.classList.add("hidden");
  if (studentLogoutBtn) studentLogoutBtn.classList.add("hidden");
  exitExamLockMode();
}

function showStudentApp() {
  if (studentGate) studentGate.classList.add("hidden");
  if (studentApp) studentApp.classList.remove("hidden");
  if (examView) examView.classList.remove("hidden");
  if (studentLogoutBtn) studentLogoutBtn.classList.remove("hidden");
  enterExamLockMode();
}

function updateStudentSessionLabel() {
  if (!studentSessionLabel) {
    return;
  }

  const student = getCurrentStudent();
  studentSessionLabel.textContent = student
    ? `${student.displayName || student.username} (${student.username})`
    : "Not logged in";
}

function setStudentApproval(username, approved) {
  const user = appState.studentUsers.find((item) => item.username === username);
  if (!user) {
    return;
  }

  user.approved = approved;
}

function unlockStudent() {
  const username = String(studentLoginUsernameInput?.value || "").trim();
  const password = String(studentLoginPasswordInput?.value || "").trim();
  const match = appState.studentUsers.find((user) => user.active !== false && user.username === username && user.password === password);

  if (!match) {
    if (studentLoginErrorText) studentLoginErrorText.classList.remove("hidden");
    if (studentLoginErrorText) studentLoginErrorText.textContent = "Invalid username or password.";
    return;
  }

  if (match.approved === false) {
    if (studentLoginErrorText) studentLoginErrorText.textContent = "Your account is waiting for admin approval.";
    if (studentLoginErrorText) studentLoginErrorText.classList.remove("hidden");
    return;
  }

  if (studentLoginErrorText) studentLoginErrorText.classList.add("hidden");
  setCurrentStudent({
    username: match.username,
    displayName: match.displayName || match.username
  });
  updateStudentSessionLabel();
  showStudentApp();
  renderQuestion();
  enforceExamLock();
}

function logoutStudent(options = {}) {
  const { showGate = true, requireApproval = true } = options;
  const currentUsername = getCurrentStudent()?.username || "";
  if (requireApproval && currentUsername) {
    setStudentApproval(currentUsername, false);
    saveState();
    syncToFirebase().catch(() => {});
  }
  clearCurrentStudent();
  if (studentLoginUsernameInput) studentLoginUsernameInput.value = "";
  if (studentLoginPasswordInput) studentLoginPasswordInput.value = "";
  if (studentLoginErrorText) studentLoginErrorText.classList.add("hidden");
  if (studentLoginErrorText) studentLoginErrorText.textContent = "Invalid username or password.";
  updateStudentSessionLabel();
  if (showGate) {
    showStudentGate();
  } else if (studentLogoutBtn) {
    studentLogoutBtn.classList.add("hidden");
  }
  exitExamLockMode();
}

function populateFirebaseInputs(config = firebaseConfig) {
  if (firebaseApiKeyInput) firebaseApiKeyInput.value = config.apiKey || "";
  if (firebaseAuthDomainInput) firebaseAuthDomainInput.value = config.authDomain || "";
  if (firebaseProjectIdInput) firebaseProjectIdInput.value = config.projectId || "";
  if (firebaseStorageBucketInput) firebaseStorageBucketInput.value = config.storageBucket || "";
  if (firebaseMessagingSenderIdInput) firebaseMessagingSenderIdInput.value = config.messagingSenderId || "";
  if (firebaseAppIdInput) firebaseAppIdInput.value = config.appId || "";
  if (firebaseMeasurementIdInput) firebaseMeasurementIdInput.value = config.measurementId || "";
}

function updateFirebaseStatus(label, ready = false) {
  if (firebaseStatusPill) {
    firebaseStatusPill.textContent = label;
  }
  if (storagePill) {
    storagePill.textContent = ready ? "Firebase" : label;
  }
}

function normalizeFirebaseFormConfig(candidate) {
  return {
    apiKey: candidate.apiKey || "",
    authDomain: candidate.authDomain || "",
    projectId: candidate.projectId || "",
    storageBucket: candidate.storageBucket || "",
    messagingSenderId: candidate.messagingSenderId || "",
    appId: candidate.appId || "",
    measurementId: candidate.measurementId || ""
  };
}

function saveFirebaseSettings() {
  const config = normalizeFirebaseFormConfig(getFirebaseFormConfig());
  if (!config.apiKey || !config.projectId || !config.appId) {
    alert("Please fill API key, Project ID, and App ID.");
    return;
  }

  firebaseConfig = { ...defaultFirebaseConfig, ...config };
  writeLocalFirebaseConfig(JSON.stringify(firebaseConfig));
  updateFirebaseStatus("Saved", false);
  alert("Firebase config saved. Reloading the page so the new settings can connect.");
  window.location.reload();
}

function reloadFirebaseSettings() {
  firebaseConfig = loadFirebaseConfig();
  populateFirebaseInputs(firebaseConfig);
  updateFirebaseStatus(readLocalFirebaseConfig() ? "Saved" : "Not Saved", false);
}

function clearFirebaseSettings() {
  clearLocalFirebaseConfig();
  firebaseConfig = { ...defaultFirebaseConfig };
  populateFirebaseInputs(firebaseConfig);
  updateFirebaseStatus("Cleared", false);
  alert("Saved Firebase config cleared. Reloading the page.");
  window.location.reload();
}

function getIsAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "unlocked";
  } catch {
    return false;
  }
}

function setAdminUnlocked(value) {
  try {
    if (value) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "unlocked");
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    // Ignore session storage limits.
  }
}

function showAdminGate() {
  if (adminGate) adminGate.classList.remove("hidden");
  if (adminApp) adminApp.classList.add("hidden");
}

function showAdminApp() {
  if (adminGate) adminGate.classList.add("hidden");
  if (adminApp) adminApp.classList.remove("hidden");
}

function unlockAdmin() {
  const entered = String(adminPasswordInput?.value || "");
  if (entered === ADMIN_PASSWORD) {
    setAdminUnlocked(true);
    if (adminErrorText) adminErrorText.classList.add("hidden");
    showAdminApp();
    renderAdminList();
    renderScoreDashboard();
    renderStudentUserList();
    return;
  }

  if (adminErrorText) adminErrorText.classList.remove("hidden");
}

function logoutAdmin() {
  setAdminUnlocked(false);
  if (adminPasswordInput) adminPasswordInput.value = "";
  if (adminErrorText) adminErrorText.classList.add("hidden");
  showAdminGate();
}

function syncAnswersLength() {
  if (answers.length !== appState.questions.length) {
    const nextAnswers = Array(appState.questions.length).fill(null);
    answers.forEach((value, index) => {
      if (index < nextAnswers.length) {
        nextAnswers[index] = value;
      }
    });
    answers = nextAnswers;
  }

  if (currentIndex >= appState.questions.length) {
    currentIndex = Math.max(0, appState.questions.length - 1);
  }
}

function renderQuestion() {
  if (!isStudentPage) {
    return;
  }
  if (!isStudentAuthenticated()) {
    showStudentGate();
    return;
  }
  if (!appState.questions.length) {
    questionCounter.textContent = "0 / 0";
    progressText.textContent = "0%";
    progressBar.style.width = "0%";
    questionTopic.textContent = "Office";
    questionText.textContent = "No questions are available yet. Use the admin page to add one.";
    optionsWrap.innerHTML = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    clearBtn.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  syncAnswersLength();
  const currentQuestion = appState.questions[currentIndex];

  questionCounter.textContent = `${currentIndex + 1} / ${appState.questions.length}`;
  progressText.textContent = `${Math.round(((currentIndex + 1) / appState.questions.length) * 100)}%`;
  progressBar.style.width = `${((currentIndex + 1) / appState.questions.length) * 100}%`;
  questionTopic.textContent = currentQuestion.topic;
  questionText.textContent = currentQuestion.question;
  optionsWrap.innerHTML = "";

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option${answers[currentIndex] === index ? " selected" : ""}`;
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => {
      answers[currentIndex] = index;
      renderQuestion();
    });
    optionsWrap.appendChild(button);
  });

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = false;
  clearBtn.disabled = answers[currentIndex] === null;
  nextBtn.textContent = currentIndex === appState.questions.length - 1 ? "Finish" : "Next";
  submitBtn.disabled = false;
}

function goNext() {
  if (currentIndex < appState.questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  confirmAndFinishExam();
}

function goPrev() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
}

function clearAnswer() {
  answers[currentIndex] = null;
  renderQuestion();
}

function confirmAndFinishExam() {
  if (!isStudentAuthenticated()) {
    showStudentGate();
    return;
  }
  openSubmitModal();
}

function openSubmitModal() {
  if (!submitModal) {
    finishExam();
    return;
  }

  submitModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  cancelSubmitBtn?.focus();
}

function closeSubmitModal() {
  if (submitModal) {
    submitModal.classList.add("hidden");
  }
  document.body.classList.remove("modal-open");
}

function confirmSubmitExam() {
  closeSubmitModal();
  finishExam();
}

function openEscWarningModal() {
  if (!escWarningModal) {
    return;
  }

  escWarningModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeEscWarningModal() {
  if (escWarningModal) {
    escWarningModal.classList.add("hidden");
  }
  if (escWarningTimer) {
    clearTimeout(escWarningTimer);
    escWarningTimer = null;
  }
  escWarningArmed = false;
  document.body.classList.remove("modal-open");
}

function armEscWarning() {
  escWarningArmed = true;
  openEscWarningModal();

  if (escWarningTimer) {
    clearTimeout(escWarningTimer);
  }

  escWarningTimer = setTimeout(() => {
    escWarningArmed = false;
    closeEscWarningModal();
  }, 5000);
}

function handleEscKeyDuringExam() {
  if (!isExamSessionActive()) {
    return false;
  }

  if (!escWarningArmed) {
    armEscWarning();
    return true;
  }

  closeEscWarningModal();
  return true;
}

function handleExamLeaveAttempt() {
  if (!isExamSessionActive()) {
    return;
  }

  closeSubmitModal();
  if (studentSessionLabel) {
    studentSessionLabel.textContent = "Tab switch detected";
  }
  finishExam();
}

function shouldBlockExamShortcut(event) {
  if (!isExamSessionActive()) {
    return false;
  }

  if (submitModal && !submitModal.classList.contains("hidden") && event.key === "Escape") {
    return false;
  }

  if (event.key === "Escape") {
    return handleEscKeyDuringExam();
  }

  const key = String(event.key || "").toLowerCase();
  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  if (event.key === "F12" || event.key === "PrintScreen") {
    return true;
  }

  if (ctrlOrMeta && ["r", "w", "s", "p", "u", "l"].includes(key)) {
    return true;
  }

  if (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) {
    return true;
  }

  if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    return true;
  }

  return false;
}

function getRemark(percent) {
  if (percent >= 80) return "Excellent work";
  if (percent >= 60) return "Good effort";
  if (percent >= 40) return "Fair progress";
  return "Keep practicing";
}

function renderScoreDashboard() {
  if (!isAdminPage) {
    return;
  }

  const total = scoreAttempts.length;
  const average = total ? Math.round(scoreAttempts.reduce((sum, item) => sum + item.percent, 0) / total) : 0;
  const best = total ? Math.max(...scoreAttempts.map((item) => item.percent)) : 0;

  if (totalAttemptsValue) totalAttemptsValue.textContent = String(total);
  if (averageScoreValue) averageScoreValue.textContent = `${average}%`;
  if (bestScoreValue) bestScoreValue.textContent = `${best}%`;
  if (scoreCountPill) scoreCountPill.textContent = `${total} Attempts`;

  if (!scoreTableBody) {
    return;
  }

  scoreTableBody.innerHTML = "";
  if (!total) {
    const empty = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "score-empty";
    cell.textContent = "No scores have been saved yet.";
    empty.appendChild(cell);
    scoreTableBody.appendChild(empty);
    return;
  }

  scoreAttempts.forEach((item) => {
    const row = document.createElement("tr");
    const student = document.createElement("td");
    student.textContent = item.studentName || item.studentUsername || "Unknown";
    const date = document.createElement("td");
    date.textContent = new Date(item.submittedAt).toLocaleString();
    const score = document.createElement("td");
    score.textContent = `${item.score} / ${item.total}`;
    const percent = document.createElement("td");
    percent.textContent = `${item.percent}%`;
    const remark = document.createElement("td");
    remark.textContent = item.remark;
    row.append(student, date, score, percent, remark);
    scoreTableBody.appendChild(row);
  });
}

function renderStudentUserList() {
  if (!isAdminPage || !studentUserList) {
    return;
  }

  if (studentUserCountPill) {
    studentUserCountPill.textContent = `${appState.studentUsers.length} Students`;
  }

  studentUserList.innerHTML = "";
  if (!appState.studentUsers.length) {
    const empty = document.createElement("div");
    empty.className = "review-item";
    empty.textContent = "No student accounts saved yet.";
    studentUserList.appendChild(empty);
    return;
  }

  appState.studentUsers.forEach((user, index) => {
    const row = document.createElement("div");
    row.className = "question-row";

    const head = document.createElement("div");
    head.className = "question-row-head";
    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${user.displayName || user.username}`;
    const subtitle = document.createElement("small");
    subtitle.textContent = `${user.username} • ${user.active !== false ? "Active" : "Inactive"}`;
    left.append(title, subtitle);
    const pass = document.createElement("small");
    pass.textContent = `Password: ${user.password}`;
    head.append(left, pass);

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const approveBtn = document.createElement("button");
    approveBtn.type = "button";
    approveBtn.className = user.approved === false ? "btn success" : "btn secondary";
    approveBtn.textContent = user.approved === false ? "Approve" : "Approved";
    approveBtn.disabled = user.approved !== false;
    approveBtn.addEventListener("click", () => approveStudentUser(index));

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn secondary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => fillStudentForm(index));

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn secondary";
    toggleBtn.textContent = user.active !== false ? "Disable" : "Enable";
    toggleBtn.addEventListener("click", () => toggleStudentActive(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteStudentUser(index));

    actions.append(approveBtn, editBtn, toggleBtn, deleteBtn);
    row.append(head, actions);
    studentUserList.appendChild(row);
  });
}

function fillStudentForm(index) {
  if (!isAdminPage) {
    return;
  }

  const user = appState.studentUsers[index];
  if (!user) {
    return;
  }

  editingStudentIndex = index;
  if (studentUserUsernameInput) studentUserUsernameInput.value = user.username;
  if (studentUserDisplayNameInput) studentUserDisplayNameInput.value = user.displayName || "";
  if (studentUserPasswordInput) studentUserPasswordInput.value = user.password || "";
  if (studentUserActiveInput) studentUserActiveInput.checked = user.active !== false;
}

function resetStudentForm() {
  if (!isAdminPage) {
    return;
  }

  editingStudentIndex = null;
  if (studentUserUsernameInput) studentUserUsernameInput.value = "";
  if (studentUserDisplayNameInput) studentUserDisplayNameInput.value = "";
  if (studentUserPasswordInput) studentUserPasswordInput.value = "";
  if (studentUserActiveInput) studentUserActiveInput.checked = true;
}

async function saveStudentUser() {
  if (!isAdminPage) {
    return;
  }

  const previousUser = editingStudentIndex !== null ? appState.studentUsers[editingStudentIndex] : null;
  const existingIndex = appState.studentUsers.findIndex((item) => item.username === (studentUserUsernameInput?.value || "").trim());
  const existingUser = existingIndex !== -1 ? appState.studentUsers[existingIndex] : null;
  const user = normalizeStudentUser({
    username: studentUserUsernameInput?.value || "",
    displayName: studentUserDisplayNameInput?.value || "",
    password: studentUserPasswordInput?.value || "",
    active: studentUserActiveInput?.checked
  });

  if (!user) {
    alert("Please enter a username and password for the student.");
    return;
  }

  if (existingIndex !== -1 && existingIndex !== editingStudentIndex) {
    alert("That username already exists.");
    return;
  }

  const targetIndex = editingStudentIndex !== null ? editingStudentIndex : existingIndex;
  user.approved = previousUser?.approved ?? existingUser?.approved ?? true;
  if (targetIndex !== null && targetIndex !== -1) {
    appState.studentUsers[targetIndex] = user;
  } else {
    appState.studentUsers.push(user);
  }

  if (previousUser && getCurrentStudent()?.username === previousUser.username) {
    setCurrentStudent({
      username: user.username,
      displayName: user.displayName || user.username
    });
    updateStudentSessionLabel();
  }

  updateTopLabels();
  saveState();
  await syncAppStateToFirebase("student save");
  renderStudentUserList();
  resetStudentForm();
}

async function deleteStudentUser(index) {
  if (!isAdminPage) {
    return;
  }
  const removed = appState.studentUsers[index];
  if (!confirm(`Delete student account ${removed?.username || index + 1}?`)) {
    return;
  }

  appState.studentUsers.splice(index, 1);
  if (getCurrentStudent()?.username === removed?.username) {
    logoutStudent();
  }
  if (editingStudentIndex === index) {
    resetStudentForm();
  }
  updateTopLabels();
  saveState();
  await syncAppStateToFirebase("student delete");
  renderStudentUserList();
}

async function toggleStudentActive(index) {
  if (!isAdminPage) {
    return;
  }

  const user = appState.studentUsers[index];
  if (!user) {
    return;
  }

  user.active = user.active === false;
  if (getCurrentStudent()?.username === user.username && user.active === false) {
    logoutStudent();
  }
  saveState();
  await syncAppStateToFirebase("student active toggle");
  renderStudentUserList();
}

async function approveStudentUser(index) {
  if (!isAdminPage) {
    return;
  }

  const user = appState.studentUsers[index];
  if (!user) {
    return;
  }

  user.approved = true;
  saveState();
  await syncAppStateToFirebase("student approval");
  renderStudentUserList();
}

function finishExam() {
  if (!isStudentPage) {
    return;
  }
  if (!isStudentAuthenticated()) {
    showStudentGate();
    return;
  }
  const score = appState.questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctIndex ? 1 : 0);
  }, 0);

  const percent = Math.round((score / appState.questions.length) * 100);
  const remark = getRemark(percent);

  const missed = [];
  appState.questions.forEach((question, index) => {
    if (answers[index] !== question.correctIndex) {
      missed.push({
        number: index + 1,
        question: question.question,
        yourAnswer: answers[index] === null ? "No answer" : `${String.fromCharCode(65 + answers[index])}. ${question.options[answers[index]]}`,
        correctAnswer: `${String.fromCharCode(65 + question.correctIndex)}. ${question.options[question.correctIndex]}`
      });
    }
  });

  scoreValue.textContent = `${score} / ${appState.questions.length}`;
  percentValue.textContent = `${percent}%`;
  remarkValue.textContent = remark;
  reviewText.textContent = missed.length
    ? `You missed ${missed.length} question(s). Review the items below and try again.`
    : "Perfect score. Great work.";
  reviewList.innerHTML = "";

  if (missed.length) {
    missed.forEach((item) => {
      const row = document.createElement("div");
      row.className = "review-item";
      const title = document.createElement("strong");
      title.textContent = `Question ${item.number}`;
      const questionLine = document.createElement("div");
      questionLine.textContent = item.question;
      const yourLine = document.createElement("div");
      yourLine.textContent = `Your answer: ${item.yourAnswer}`;
      const correctLine = document.createElement("div");
      correctLine.textContent = `Correct answer: ${item.correctAnswer}`;
      row.append(title, questionLine, yourLine, correctLine);
      reviewList.appendChild(row);
    });
  } else {
    const row = document.createElement("div");
    row.className = "review-item success";
    row.textContent = "No missed questions.";
    reviewList.appendChild(row);
  }

  const scoreRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    examTitle: appState.examTitle,
    studentUsername: getCurrentStudent()?.username || "",
    studentName: getCurrentStudent()?.displayName || getCurrentStudent()?.username || "",
    score,
    total: appState.questions.length,
    percent,
    remark,
    submittedAt: Date.now()
  };

  scoreAttempts = [scoreRecord, ...scoreAttempts].sort((a, b) => b.submittedAt - a.submittedAt);
  persistScoreAttempts(true, scoreRecord);

  logoutStudent({ showGate: false });

  if (examView) {
    examView.classList.add("hidden");
  }
  if (adminView) {
    adminView.classList.add("hidden");
  }
  if (resultView) {
    resultView.classList.remove("hidden");
  }
}

function renderAdminList() {
  if (!isAdminPage) {
    return;
  }
  syncAnswersLength();
  adminQuestionList.innerHTML = "";

  if (!appState.questions.length) {
    const empty = document.createElement("div");
    empty.className = "review-item";
    empty.textContent = "No questions saved yet.";
    adminQuestionList.appendChild(empty);
    return;
  }

  appState.questions.forEach((question, index) => {
    const row = document.createElement("div");
    row.className = "question-row";

    const head = document.createElement("div");
    head.className = "question-row-head";
    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${question.topic}`;
    const subtitle = document.createElement("small");
    subtitle.textContent = question.question;
    left.append(title, subtitle);
    const correct = document.createElement("small");
    correct.textContent = `Correct: ${String.fromCharCode(65 + question.correctIndex)}`;
    head.append(left, correct);

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn secondary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => fillForm(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteQuestion(index));

    actions.append(editBtn, deleteBtn);
    row.append(head, actions);
    adminQuestionList.appendChild(row);
  });
}

function fillForm(index) {
  if (!isAdminPage) {
    return;
  }
  const question = appState.questions[index];
  editingIndex = index;
  formHeading.textContent = `Edit Question ${index + 1}`;
  examTitleInput.value = appState.examTitle;
  topicInput.value = question.topic;
  questionInput.value = question.question;
  optionAInput.value = question.options[0];
  optionBInput.value = question.options[1];
  optionCInput.value = question.options[2];
  optionDInput.value = question.options[3];
  correctInput.value = String(question.correctIndex);
}

function resetForm() {
  if (!isAdminPage) {
    return;
  }
  editingIndex = null;
  formHeading.textContent = "Add Question";
  examTitleInput.value = appState.examTitle;
  topicInput.value = "";
  questionInput.value = "";
  optionAInput.value = "";
  optionBInput.value = "";
  optionCInput.value = "";
  optionDInput.value = "";
  correctInput.value = "0";
}

function readFormQuestion() {
  const topic = topicInput.value.trim() || "Office";
  const question = questionInput.value.trim();
  const options = [
    optionAInput.value.trim(),
    optionBInput.value.trim(),
    optionCInput.value.trim(),
    optionDInput.value.trim()
  ];
  const correctIndex = Number(correctInput.value);

  if (!appState.examTitle.trim()) {
    throw new Error("Please enter an exam title.");
  }

  if (!question || options.some((option) => !option)) {
    throw new Error("Please fill in the question and all four options.");
  }

  return { topic, question, options, correctIndex };
}

function saveQuestion() {
  if (!isAdminPage) {
    return;
  }
  try {
    const examTitle = examTitleInput.value.trim();
    if (!examTitle) {
      alert("Please enter an exam title first.");
      return;
    }

    const question = readFormQuestion();
    appState.examTitle = examTitle;

    if (editingIndex === null) {
      appState.questions.push(question);
    } else {
      appState.questions[editingIndex] = question;
    }

    updateTopLabels();
    syncAnswersLength();
    saveState();
    renderQuestion();
    renderAdminList();
    resetForm();
  } catch (error) {
    alert(error.message);
  }
}

function deleteQuestion(index) {
  if (!isAdminPage) {
    return;
  }
  if (!confirm(`Delete question ${index + 1}?`)) {
    return;
  }

  appState.questions.splice(index, 1);
  answers.splice(index, 1);

  if (editingIndex === index) {
    resetForm();
  } else if (editingIndex !== null && editingIndex > index) {
    editingIndex -= 1;
  }

  if (currentIndex >= appState.questions.length) {
    currentIndex = Math.max(0, appState.questions.length - 1);
  }

  updateTopLabels();
  saveState();
  renderQuestion();
  renderAdminList();
}

function restoreDefaults() {
  if (!isAdminPage) {
    return;
  }
  if (!confirm("Restore the original 40-question set? This will replace the saved bank.")) {
    return;
  }

  const restored = cloneState(defaultState);
  appState.examTitle = restored.examTitle;
  appState.questions = restored.questions;
  currentIndex = 0;
  answers = Array(appState.questions.length).fill(null);
  editingIndex = null;
  updateTopLabels();
  resetForm();
  saveState();
  renderQuestion();
  renderAdminList();
  renderStudentUserList();
}

async function bootstrap() {
  firebaseConfig = loadFirebaseConfig();
  updateTopLabels();

  if (isAdminPage) {
    populateFirebaseInputs(firebaseConfig);
    updateFirebaseStatus(readLocalFirebaseConfig() ? "Saved" : "Not Saved", false);
  }
  saveState();

  if (isStudentPage) {
    updateStudentSessionLabel();
    if (isStudentAuthenticated()) {
      showStudentApp();
      renderQuestion();
    } else {
      showStudentGate();
    }
  }

  if (isAdminPage) {
    if (getIsAdminUnlocked()) {
      showAdminApp();
      resetForm();
      renderAdminList();
      renderScoreDashboard();
      renderStudentUserList();
      populateFirebaseInputs(firebaseConfig);
    } else {
      showAdminGate();
    }
  }

  Promise.resolve(initFirebase())
    .then(async () => {
      await loadFromFirebase();
      await loadScoresFromFirebase();
      await syncToFirebase();
      await syncAllScoresToFirebase();
      updateTopLabels();

      if (isStudentPage) {
        updateStudentSessionLabel();
        if (isStudentAuthenticated()) {
          showStudentApp();
          renderQuestion();
        }
      }

      if (isAdminPage) {
        populateFirebaseInputs(firebaseConfig);
        updateFirebaseStatus(readLocalFirebaseConfig() ? "Saved" : "Not Saved", firebaseReady);
        if (getIsAdminUnlocked()) {
          renderAdminList();
          renderScoreDashboard();
          renderStudentUserList();
        }
      }
    })
    .catch(() => {
      // Keep the local app working if Firebase is unavailable.
    });
}

if (prevBtn) prevBtn.addEventListener("click", goPrev);
if (nextBtn) nextBtn.addEventListener("click", goNext);
if (clearBtn) clearBtn.addEventListener("click", clearAnswer);
if (submitBtn) submitBtn.addEventListener("click", confirmAndFinishExam);
if (cancelSubmitBtn) cancelSubmitBtn.addEventListener("click", closeSubmitModal);
if (confirmSubmitBtn) confirmSubmitBtn.addEventListener("click", confirmSubmitExam);
if (escWarningCancelBtn) escWarningCancelBtn.addEventListener("click", closeEscWarningModal);
if (submitModal) {
  submitModal.addEventListener("click", (event) => {
    if (event.target === submitModal) {
      closeSubmitModal();
      return;
    }

    const action = event.target.closest("[data-submit-modal-action]")?.dataset.submitModalAction;
    if (action === "cancel") {
      closeSubmitModal();
    }

    if (action === "confirm") {
      confirmSubmitExam();
    }
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && submitModal && !submitModal.classList.contains("hidden")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeSubmitModal();
    return;
  }

  if (event.key === "Escape" && escWarningModal && !escWarningModal.classList.contains("hidden")) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeEscWarningModal();
    return;
  }
});
if (backToExamBtn) backToExamBtn.addEventListener("click", () => {
  if (resultView) resultView.classList.add("hidden");
  if (isStudentAuthenticated()) {
    if (examView) examView.classList.remove("hidden");
  } else {
    showStudentGate();
  }
});
if (studentLoginBtn) studentLoginBtn.addEventListener("click", unlockStudent);
if (studentLoginUsernameInput) {
  studentLoginUsernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlockStudent();
    }
  });
}
if (studentLoginPasswordInput) {
  studentLoginPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlockStudent();
    }
  });
}
if (studentLogoutBtn) studentLogoutBtn.addEventListener("click", logoutStudent);
if (adminLoginBtn) adminLoginBtn.addEventListener("click", unlockAdmin);
if (adminPasswordInput) {
  adminPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlockAdmin();
    }
  });
}
if (adminLogoutBtn) adminLogoutBtn.addEventListener("click", logoutAdmin);
if (saveFirebaseBtn) saveFirebaseBtn.addEventListener("click", saveFirebaseSettings);
if (loadFirebaseBtn) loadFirebaseBtn.addEventListener("click", reloadFirebaseSettings);
if (clearFirebaseBtn) clearFirebaseBtn.addEventListener("click", clearFirebaseSettings);
if (saveStudentUserBtn) saveStudentUserBtn.addEventListener("click", saveStudentUser);
if (resetStudentUserBtn) resetStudentUserBtn.addEventListener("click", resetStudentForm);
if (saveQuestionBtn) saveQuestionBtn.addEventListener("click", saveQuestion);
if (resetFormBtn) resetFormBtn.addEventListener("click", resetForm);
if (restoreDefaultsBtn) restoreDefaultsBtn.addEventListener("click", restoreDefaults);
if (saveAllBtn) {
  saveAllBtn.addEventListener("click", () => {
    appState.examTitle = examTitleInput?.value.trim() || defaultState.examTitle;
    updateTopLabels();
    saveState();
    renderAdminList();
    renderScoreDashboard();
    renderStudentUserList();
    renderQuestion();
  });
}

document.addEventListener("contextmenu", (event) => {
  if (isExamSessionActive()) {
    event.preventDefault();
  }
});

["copy", "cut", "paste", "selectstart"].forEach((type) => {
  document.addEventListener(type, (event) => {
    if (isExamSessionActive()) {
      event.preventDefault();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (submitModal && !submitModal.classList.contains("hidden") && event.key === "Escape") {
    event.preventDefault();
    closeSubmitModal();
    return;
  }

  if (shouldBlockExamShortcut(event)) {
    event.preventDefault();
  }
});

document.addEventListener("visibilitychange", () => {
  if (isExamSessionActive() && examFullscreenSeen && document.hidden) {
    handleExamLeaveAttempt();
  }
});

window.addEventListener("blur", () => {
  if (isExamSessionActive() && examFullscreenSeen) {
    handleExamLeaveAttempt();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!isExamSessionActive()) {
    return;
  }

  if (document.fullscreenElement) {
    examFullscreenSeen = true;
    return;
  }

  if (examFullscreenSeen) {
    handleExamLeaveAttempt();
  }
});

bootstrap();

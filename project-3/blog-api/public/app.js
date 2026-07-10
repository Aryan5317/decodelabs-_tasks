const API = '/api';

// ---------- helpers ----------
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('toast--error', isError);
  toast.classList.add('toast--show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('toast--show'), 2600);
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------- connection status ----------
async function checkStatus() {
  const dot = document.getElementById('status');
  const text = document.getElementById('statusText');
  try {
    await api('/users');
    dot.className = 'status status--ok';
    text.textContent = 'Connected';
  } catch (e) {
    dot.className = 'status status--down';
    text.textContent = 'Not reachable';
  }
}

// ---------- USERS ----------
let usersCache = [];

async function loadUsers() {
  const list = document.getElementById('userList');
  const select = document.getElementById('postAuthor');
  try {
    usersCache = await api('/users');
  } catch (e) {
    list.innerHTML = `<p class="empty">Couldn't load users: ${e.message}</p>`;
    return;
  }

  // populate author select
  const currentSelection = select.value;
  select.innerHTML = '<option value="" disabled>Select a user…</option>' +
    usersCache.map(u => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join('');
  if (currentSelection) select.value = currentSelection;

  if (usersCache.length === 0) {
    list.innerHTML = '<p class="empty">No users yet. Add one above to get started.</p>';
    return;
  }

  list.innerHTML = usersCache.map(u => `
    <div class="card" data-id="${u.id}">
      <div class="card__top">
        <div>
          <span class="card__id">USR-${String(u.id).padStart(3, '0')}</span>
          <div class="card__title">${escapeHtml(u.username)}</div>
          <div class="card__meta">${escapeHtml(u.email)}</div>
        </div>
      </div>
      <div class="card__actions">
        <button class="btn btn--icon" data-action="edit-user" data-id="${u.id}">Edit</button>
        <button class="btn btn--icon danger" data-action="delete-user" data-id="${u.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

const userForm = document.getElementById('userForm');
const userEditId = document.getElementById('userEditId');
const userSubmitBtn = document.getElementById('userSubmitBtn');
const userCancelBtn = document.getElementById('userCancelBtn');
const passwordHint = document.getElementById('passwordHint');

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const editId = userEditId.value;

  try {
    if (editId) {
      await api(`/users/${editId}`, { method: 'PUT', body: JSON.stringify({ username, email }) });
      showToast(`Updated user ${username}`);
    } else {
      if (!password) { showToast('Password is required to create a user', true); return; }
      await api('/users', { method: 'POST', body: JSON.stringify({ username, email, password }) });
      showToast(`Created user ${username}`);
    }
    resetUserForm();
    await loadUsers();
    await loadPosts();
  } catch (err) {
    showToast(err.message, true);
  }
});

userCancelBtn.addEventListener('click', resetUserForm);

function resetUserForm() {
  userForm.reset();
  userEditId.value = '';
  userSubmitBtn.textContent = 'Add user';
  userCancelBtn.hidden = true;
  document.getElementById('password').required = true;
  passwordHint.textContent = 'Stored as a bcrypt hash — never shown again.';
}

document.getElementById('userList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === 'delete-user') {
    if (!confirm('Delete this user? Their posts will be deleted too.')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      showToast('User deleted');
      await loadUsers();
      await loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  if (btn.dataset.action === 'edit-user') {
    const user = usersCache.find(u => u.id === Number(id));
    if (!user) return;
    userEditId.value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('password').value = '';
    document.getElementById('password').required = false;
    passwordHint.textContent = 'Leave blank to keep the current password.';
    userSubmitBtn.textContent = 'Save changes';
    userCancelBtn.hidden = false;
    document.getElementById('username').focus();
  }
});

// ---------- POSTS ----------
let postsCache = [];

async function loadPosts() {
  const list = document.getElementById('postList');
  try {
    postsCache = await api('/posts');
  } catch (e) {
    list.innerHTML = `<p class="empty">Couldn't load posts: ${e.message}</p>`;
    return;
  }

  if (postsCache.length === 0) {
    list.innerHTML = '<p class="empty">No posts yet. Publish one above.</p>';
    return;
  }

  list.innerHTML = postsCache.map(p => `
    <div class="card" data-id="${p.id}">
      <div class="card__top">
        <div>
          <span class="card__id">POST-${String(p.id).padStart(3, '0')}</span>
          <div class="card__title">${escapeHtml(p.title)}</div>
          <div class="card__meta">by ${escapeHtml(p.User?.username || 'unknown')} · ${timeAgo(p.createdAt)}</div>
        </div>
      </div>
      <div class="card__body">${escapeHtml(p.content)}</div>
      <div class="card__actions">
        <button class="btn btn--icon" data-action="edit-post" data-id="${p.id}">Edit</button>
        <button class="btn btn--icon danger" data-action="delete-post" data-id="${p.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

const postForm = document.getElementById('postForm');
const postEditId = document.getElementById('postEditId');
const postSubmitBtn = document.getElementById('postSubmitBtn');
const postCancelBtn = document.getElementById('postCancelBtn');

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const userId = document.getElementById('postAuthor').value;
  const editId = postEditId.value;

  try {
    if (editId) {
      await api(`/posts/${editId}`, { method: 'PUT', body: JSON.stringify({ title, content }) });
      showToast('Post updated');
    } else {
      if (!userId) { showToast('Choose an author first', true); return; }
      await api('/posts', { method: 'POST', body: JSON.stringify({ title, content, userId: Number(userId) }) });
      showToast('Post published');
    }
    resetPostForm();
    await loadPosts();
  } catch (err) {
    showToast(err.message, true);
  }
});

postCancelBtn.addEventListener('click', resetPostForm);

function resetPostForm() {
  postForm.reset();
  postEditId.value = '';
  postSubmitBtn.textContent = 'Publish post';
  postCancelBtn.hidden = true;
  document.getElementById('postAuthor').disabled = false;
}

document.getElementById('postList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === 'delete-post') {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      showToast('Post deleted');
      await loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  if (btn.dataset.action === 'edit-post') {
    const post = postsCache.find(p => p.id === Number(id));
    if (!post) return;
    postEditId.value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postAuthor').value = post.userId;
    document.getElementById('postAuthor').disabled = true; // author can't change on edit
    postSubmitBtn.textContent = 'Save changes';
    postCancelBtn.hidden = false;
    document.getElementById('postTitle').focus();
  }
});

// ---------- init ----------
(async function init() {
  await checkStatus();
  await loadUsers();
  await loadPosts();
})();

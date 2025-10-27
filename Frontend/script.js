const formTitle = document.getElementById('formTitle');
const toggleLink = document.getElementById('toggleLink');
const submitBtn = document.getElementById('submitBtn');
const message = document.getElementById('message');
let isLogin = false;

// Toggle between Login and Signup forms
toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
  submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
  toggleLink.textContent = isLogin
    ? "Don't have an account? Sign Up"
    : 'Already have an account? Login here';
});

// Handle form submission
submitBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const endpoint = isLogin ? '/login' : '/signup';
  const payload = isLogin ? { email, password } : { username, email, password };

  try {
    const res = await fetch(`http://localhost:4000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok && isLogin && data.token) {
      // Save token and redirect to home.html
      localStorage.setItem('token', data.token);
      message.style.color = 'green';
      window.location.href = 'home.html'; // Redirect to dashboard
    } else {
      message.style.color = 'red';
    }
  } catch (err) {
    console.error(err);
    message.textContent = 'Something went wrong. Try again later.';
    message.style.color = 'red';
  }
});

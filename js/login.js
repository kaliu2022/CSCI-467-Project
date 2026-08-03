const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const messageBox = document.getElementById('message');

function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message ${type} show`;
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = document.getElementById('user_id').value.trim();
    const password = document.getElementById('password').value;

    if (!userId || !password) {
        showMessage('Please enter both your user ID and password.');
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    messageBox.className = 'message';

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            const errorText = result.errors?.join(' ') || 'Login failed.';
            throw new Error(errorText);
        }

        localStorage.setItem('salesAssociate', JSON.stringify(result.associate));
        window.location.href = 'pages/createQuote.html';
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Log In';
    }
});

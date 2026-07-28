const messageBox = document.getElementById('message');
const associateBanner = document.getElementById('associate-banner');
const logoutButton = document.getElementById('logout-button');

const storedAssociate = localStorage.getItem('salesAssociate');
let associate = null;

try {
    associate = storedAssociate ? JSON.parse(storedAssociate) : null;
} catch (error) {
    localStorage.removeItem('salesAssociate');
}

if (!associate || !associate.associate_id) {
    window.location.href = 'login.html';
} else {
    associateBanner.textContent = `Logged in as ${associate.name} (${associate.associate_id})`;
}

function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message ${type} show`;
    messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message';
}

function formatMoney(value) {
    return value === null || value === undefined ? '—' : `$${Number(value).toFixed(2)}`;
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('salesAssociate');
    window.location.href = 'login.html';
});

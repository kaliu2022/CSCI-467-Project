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

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('salesAssociate');
    window.location.href = 'login.html';
});

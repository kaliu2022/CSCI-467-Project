const associatesBody = document.getElementById('associates-body');
const associateForm = document.getElementById('associate-form');
const formHeading = document.getElementById('form-heading');
const associateIdGroup = document.getElementById('associate-id-group');
const associateIdField = document.getElementById('associate_id');
const userIdInput = document.getElementById('user_id');
const passwordInput = document.getElementById('password');
const passwordHelp = document.getElementById('password-help');
const nameInput = document.getElementById('name');
const addressInput = document.getElementById('address');
const commissionInput = document.getElementById('accumulated_commission');
const saveButton = document.getElementById('save-associate-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

// Cache of the last-loaded associates, keyed by id, so the Edit button
// can populate the form without a second round trip.
let associatesById = {};

// associate_id is generated server-side on creation, so it only ever
// shows up (read-only) once editing an existing associate; this tracks
// which one, if any, is currently being edited.
let editingAssociateId = null;

function resetToAddMode() {
    associateForm.reset();
    editingAssociateId = null;
    associateIdGroup.hidden = true;
    passwordInput.required = true;
    passwordHelp.textContent = 'Required when adding a new associate.';
    formHeading.textContent = 'Add Sales Associate';
    saveButton.textContent = 'Add Associate';
    cancelEditButton.hidden = true;
}

function startEdit(associate) {
    editingAssociateId = associate.associate_id;
    associateIdGroup.hidden = false;
    associateIdField.value = associate.associate_id;
    userIdInput.value = associate.user_id;
    // Left blank on purpose (visible in the table already); the endpoint
    // keeps the current password unless a new one is typed here.
    passwordInput.value = '';
    passwordInput.required = false;
    passwordHelp.textContent = 'Leave blank to keep the current password.';
    nameInput.value = associate.name;
    addressInput.value = associate.address || '';
    commissionInput.value = associate.accumulated_commission;

    formHeading.textContent = `Edit Sales Associate ${associate.associate_id}`;
    saveButton.textContent = 'Save Changes';
    cancelEditButton.hidden = false;
    associateForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderAssociates(associates) {
    associatesById = Object.fromEntries(associates.map((associate) => [associate.associate_id, associate]));

    if (associates.length === 0) {
        associatesBody.innerHTML = '<tr><td colspan="7" class="empty-state">No sales associates yet.</td></tr>';
        return;
    }

    associatesBody.innerHTML = associates.map((associate) => `
        <tr>
            <td>${associate.associate_id}</td>
            <td>${associate.user_id}</td>
            <td>${associate.password}</td>
            <td>${associate.name}</td>
            <td>${associate.address || '—'}</td>
            <td>${formatMoney(associate.accumulated_commission)}</td>
            <td>
                <div class="row-actions">
                    <button class="button button-secondary button-small edit-button" type="button" data-id="${associate.associate_id}">Edit</button>
                    <button class="button button-danger button-small delete-button" type="button" data-id="${associate.associate_id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadAssociates() {
    const response = await fetch('viewSalesAssociates.php');
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.errors?.join(' ') || 'Unable to load sales associates.');
    }

    renderAssociates(result.associates);
}

associatesBody.addEventListener('click', async (event) => {
    const editTarget = event.target.closest('.edit-button');
    if (editTarget) {
        const associate = associatesById[editTarget.dataset.id];
        if (associate) {
            clearMessage();
            startEdit(associate);
        }
        return;
    }

    const deleteTarget = event.target.closest('.delete-button');
    if (deleteTarget) {
        const associate = associatesById[deleteTarget.dataset.id];
        if (!associate) {
            return;
        }

        if (!confirm(`Delete sales associate "${associate.name}" (${associate.associate_id})?`)) {
            return;
        }

        clearMessage();
        deleteTarget.disabled = true;

        try {
            const response = await fetch('deleteAssociate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ associate_id: associate.associate_id })
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.errors?.join(' ') || 'The associate could not be deleted.');
            }

            if (editingAssociateId === associate.associate_id) {
                resetToAddMode();
            }

            showMessage(`Sales associate ${associate.associate_id} was deleted.`, 'success');
            await loadAssociates();
        } catch (error) {
            showMessage(error.message || 'Unable to connect to the server.');
        } finally {
            deleteTarget.disabled = false;
        }
    }
});

cancelEditButton.addEventListener('click', () => {
    resetToAddMode();
    clearMessage();
});

associateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const isEdit = editingAssociateId !== null;
    const payload = {
        user_id: userIdInput.value.trim(),
        password: passwordInput.value,
        name: nameInput.value.trim(),
        address: addressInput.value.trim(),
        accumulated_commission: Number(commissionInput.value) || 0
    };

    if (isEdit) {
        payload.associate_id = editingAssociateId;
    }

    const endpoint = isEdit ? 'editAssociate.php' : 'createAssociate.php';

    saveButton.disabled = true;
    saveButton.textContent = isEdit ? 'Saving...' : 'Adding...';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.errors?.join(' ') || 'The associate could not be saved.');
        }

        showMessage(
            isEdit
                ? `Sales associate ${result.associate_id} was updated.`
                : `Sales associate ${result.associate_id} was created.`,
            'success'
        );
        resetToAddMode();
        await loadAssociates();
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
        saveButton.textContent = isEdit ? 'Save Changes' : 'Add Associate';
    } finally {
        saveButton.disabled = false;
    }
});

loadAssociates().catch((error) => {
    showMessage(error.message || 'Unable to connect to the server.');
});

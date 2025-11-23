const apiRoot =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'http://backend:3000';
const itemsEndpoint = `${apiRoot}/items`;

const fetchBtn = document.getElementById('fetch-btn');
const itemsContainer = document.getElementById('items');
const addForm = document.getElementById('add-form');
const addName = document.getElementById('add-name');
const addQuantity = document.getElementById('add-quantity');
const examplesEl = document.getElementById('examples');
const statusEl = document.getElementById('status');

const showStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#c0392b' : '#0b8457';
};

const fetchItems = async () => {
  try {
    const res = await fetch(itemsEndpoint);
    if (!res.ok) {
      throw new Error(`Failed to load items (${res.status})`);
    }
    const { items = [], requestExamples = {} } = await res.json();
    renderItems(items);
    renderExamples(requestExamples);
    showStatus('Items loaded');
  } catch (error) {
    showStatus(error.message, true);
  }
};

const addItem = async (name, quantity) => {
  try {
    const res = await fetch(itemsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, quantity }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to add item');
    }
    showStatus('Item added');
    addForm.reset();
    fetchItems();
  } catch (error) {
    showStatus(error.message, true);
  }
};

const updateItem = async (id, name, quantity) => {
  try {
    const res = await fetch(`${apiRoot}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, quantity }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update item');
    }
    showStatus('Item updated');
    fetchItems();
  } catch (error) {
    showStatus(error.message, true);
  }
};

const deleteItem = async (id) => {
  try {
    const res = await fetch(`${apiRoot}/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete item');
    }
    showStatus('Item deleted');
    fetchItems();
  } catch (error) {
    showStatus(error.message, true);
  }
};

const renderItems = (items) => {
  itemsContainer.innerHTML = '';
  if (!items.length) {
    const emptyState = document.createElement('p');
    emptyState.textContent = 'No items yet.';
    itemsContainer.appendChild(emptyState);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name';
    const nameInput = document.createElement('input');
    nameInput.value = item.name;
    nameLabel.appendChild(nameInput);

    const qtyLabel = document.createElement('label');
    qtyLabel.textContent = 'Quantity';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.value = item.quantity;
    qtyLabel.appendChild(qtyInput);

    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Update';
    updateBtn.addEventListener('click', () => {
      updateItem(item.id, nameInput.value.trim(), Number(qtyInput.value));
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    card.appendChild(document.createTextNode(`#${item.id}`));
    card.appendChild(nameLabel);
    card.appendChild(qtyLabel);
    card.appendChild(updateBtn);
    card.appendChild(deleteBtn);

    itemsContainer.appendChild(card);
  });
};

const renderExamples = (examples) => {
  const fallback = {
    post: { name: 'Marker', quantity: 3 },
    put: { name: 'Updated Marker', quantity: 6 },
  };
  examplesEl.textContent = JSON.stringify({ ...fallback, ...examples }, null, 2);
};

fetchBtn.addEventListener('click', fetchItems);

addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = addName.value.trim();
  const quantity = Number(addQuantity.value);
  if (!name || Number.isNaN(quantity)) {
    showStatus('Name and quantity are required', true);
    return;
  }
  addItem(name, quantity);
});

// Load initial state
fetchItems();

const addIngredientBtn = document.getElementById('addIngredientBtn');
const addActionBtn = document.getElementById('addActionBtn');
const saveBtn = document.getElementById('saveBtn');
const backBtn = document.getElementById('backBtn');
const recipeTitleInput = document.getElementById('recipeTitle');
const profilePicInput = document.getElementById('profilePicInput');
const profilePicPreview = document.getElementById('profilePicPreview');

let currentImageBase64 = '';
let initialData = null;
const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.has('edit') ? parseInt(urlParams.get('edit')) : null;

// -------------------------
// GESTIONE IMMAGINE
profilePicInput.addEventListener('change', () => {
  const file = profilePicInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      currentImageBase64 = e.target.result;
      profilePicPreview.src = currentImageBase64;
      profilePicPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// -------------------------
// INGREDIENTI
function addIngredient(data) {
  data = data || { name: '', qty: '', unit: '' };
  const container = document.getElementById('ingredientsContainer');
  const div = document.createElement('div');
  div.classList.add('ingredient-item');
  div.innerHTML = `
    <input type="text" class="ingredient-name" placeholder="Ingrediente" value="${data.name}" />
    <input type="number" min="0" step="any" class="ingredient-quantity" placeholder="Quantità" value="${data.qty}" />
    <select class="ingredient-unit">
      <option value="" ${data.unit === '' ? 'selected' : ''}>—</option>
      <option value="g" ${data.unit === 'g' ? 'selected' : ''}>g</option>
      <option value="kg" ${data.unit === 'kg' ? 'selected' : ''}>kg</option>
      <option value="mg" ${data.unit === 'mg' ? 'selected' : ''}>mg</option>
      <option value="l" ${data.unit === 'l' ? 'selected' : ''}>l</option>
      <option value="ml" ${data.unit === 'ml' ? 'selected' : ''}>ml</option>
    </select>
    <button class="delete-ingredient" title="Elimina ingrediente">🗑️</button>
  `;
  container.appendChild(div);

  div.querySelector('.delete-ingredient').addEventListener('click', () => {
    div.remove();
  });
}

// -------------------------
// AZIONI
function addAction(data = { actionText: '', time: '' }) {
  const container = document.getElementById('actionsContainer');
  const div = document.createElement('div');
  div.classList.add('action-item');
  div.innerHTML = `
    <textarea class="phase-action" placeholder="Descrizione azione...">${data.actionText}</textarea>
    <div class="action-time-container">
      <select class="phase-time-select">
        <option>-- : --</option>
        <option>5 min</option>
        <option>10 min</option>
        <option>15 min</option>
        <option>30 min</option>
        <option>1 ora</option>
        <option>Personalizzato</option>
      </select>
      <input type="time" class="custom-time-input" style="display:none;" />
      <button class="delete-action" title="Elimina azione">🗑️</button>
    </div>
  `;
  container.appendChild(div);

  const timeSelect = div.querySelector('.phase-time-select');
  const customInput = div.querySelector('.custom-time-input');

  const presetOptions = Array.from(timeSelect.options).map(o => o.value);

  if (presetOptions.includes(data.time)) {
    timeSelect.value = data.time;
    customInput.style.display = 'none';
    customInput.value = '';
  } else if (data.time && data.time.includes(':')) {
    timeSelect.value = 'Personalizzato';
    customInput.style.display = 'inline-block';
    customInput.value = data.time;
  } else {
    timeSelect.value = '-- : --';
    customInput.style.display = 'none';
    customInput.value = '';
  }

  timeSelect.addEventListener('change', () => {
    if (timeSelect.value === 'Personalizzato') {
      customInput.style.display = 'inline-block';
      if (!customInput.value) customInput.value = '00:05';
    } else {
      customInput.style.display = 'none';
      customInput.value = '';
    }
  });

  div.querySelector('.delete-action').addEventListener('click', () => {
    div.remove();
  });
}

// -------------------------
// SALVA E CARICA
function loadRecipe(index) {
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  if (recipes[index]) {
    const recipe = recipes[index];
    recipeTitleInput.value = recipe.title || '';
    currentImageBase64 = recipe.image || '';
    if (currentImageBase64) {
      profilePicPreview.src = currentImageBase64;
      profilePicPreview.style.display = 'block';
    } else {
      profilePicPreview.src = '';
      profilePicPreview.style.display = 'none';
    }

    const ingContainer = document.getElementById('ingredientsContainer');
    ingContainer.innerHTML = '';
    recipe.ingredients.forEach(ing => addIngredient(ing));

    const actContainer = document.getElementById('actionsContainer');
    actContainer.innerHTML = '';
    recipe.actions.forEach(act => addAction(act));
  }
}

function getCurrentData() {
  const title = recipeTitleInput.value.trim();
  const ingredients = [];
  document.querySelectorAll('.ingredient-item').forEach(item => {
    const nameInput = item.querySelector('.ingredient-name');
    const qtyInput = item.querySelector('.ingredient-qty');
    const unitInput = item.querySelector('.ingredient-unit');

    const name = nameInput ? nameInput.value.trim() : '';
    const qty = qtyInput ? qtyInput.value.trim() : '';
    const unit = unitInput ? unitInput.value : '';

    if (name || qty || unit) ingredients.push({ name, qty, unit });
  });

  const actions = [];
  document.querySelectorAll('.action-item').forEach(item => {
    const actionTextInput = item.querySelector('.phase-action');
    const timeSelectInput = item.querySelector('.phase-time-select');
    const customTimeInput = item.querySelector('.custom-time-input');

    const actionText = actionTextInput ? actionTextInput.value.trim() : '';
    const timeSelect = timeSelectInput ? timeSelectInput.value : '';
    const customTime = customTimeInput ? customTimeInput.value.trim() : '';

    const time = (timeSelect === 'Personalizzato') ? customTime : timeSelect;
    actions.push({ actionText, time });
  });

  return {
    title,
    image: currentImageBase64,
    ingredients,
    actions
  };
}

function saveInitialData() {
  initialData = JSON.stringify(getCurrentData());
}

function hasUnsavedChanges() {
  return JSON.stringify(getCurrentData()) !== initialData;
}

function saveRecipe() {
  const title = recipeTitleInput.value.trim();
  if (!title) {
    alert('Devi inserire un titolo!');
    return;
  }

  const ingredients = [];
  document.querySelectorAll('.ingredient-item').forEach(item => {
    const nameInput = item.querySelector('.ingredient-name');
    const qtyInput = item.querySelector('.ingredient-qty');
    const unitInput = item.querySelector('.ingredient-unit');

    const name = nameInput ? nameInput.value.trim() : '';
    const qty = qtyInput ? qtyInput.value.trim() : '';
    const unit = unitInput ? unitInput.value : '';

    if (name || qty || unit) ingredients.push({ name, qty, unit });
  });

  if (ingredients.length === 0) {
    alert('Devi aggiungere almeno un ingrediente!');
    return;
  }

  const actions = [];
  document.querySelectorAll('.action-item').forEach(item => {
    const actionTextInput = item.querySelector('.phase-action');
    const timeSelectInput = item.querySelector('.phase-time-select');
    const customTimeInput = item.querySelector('.custom-time-input');

    const actionText = actionTextInput ? actionTextInput.value.trim() : '';
    const timeSelect = timeSelectInput ? timeSelectInput.value : '';
    const customTime = customTimeInput ? customTimeInput.value.trim() : '';

    let time = '';
    if (timeSelect === 'Personalizzato') {
      time = customTime;
    } else {
      time = timeSelect;
    }

    if (actionText || time) {
      actions.push({ actionText, time });
    }
  });

  if (actions.length === 0) {
    alert('Devi aggiungere almeno un\'azione!');
    return;
  }

  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');

  if (editIndex !== null && recipes[editIndex]) {
    recipes[editIndex] = {
      title,
      image: currentImageBase64,
      ingredients,
      actions
    };
  } else {
    recipes.push({
      title,
      image: currentImageBase64,
      ingredients,
      actions
    });
  }

  localStorage.setItem('recipes', JSON.stringify(recipes));
  alert('Ricetta salvata!');
  saveInitialData();
  window.location.href = 'index.html';
}

// -------------------------
// EVENT LISTENER BOTTONI
addIngredientBtn.addEventListener('click', () => addIngredient());
addActionBtn.addEventListener('click', () => addAction());
saveBtn.addEventListener('click', saveRecipe);
backBtn.addEventListener('click', () => {
  if (hasUnsavedChanges()) {
    if (confirm('Sei sicuro di voler tornare indietro? Le modifiche non salvate andranno perse.')) {
      window.location.href = 'index.html';
    }
  } else {
    window.location.href = 'index.html';
  }
});

// -------------------------
// CARICAMENTO INIZIALE
if (editIndex !== null) {
  loadRecipe(editIndex);
} else {
  addIngredient();
  addAction();
}

saveInitialData();

const phasesContainer = document.getElementById('phasesContainer');
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
function addIngredient(data = { name: '', qty: '', unit: 'g' }) {
  const container = document.getElementById('ingredientsContainer');
  const div = document.createElement('div');
  div.classList.add('ingredient-item');
  div.innerHTML = `
    <input type="text" class="ingredient-name" placeholder="Ingrediente" value="${data.name}" />
    <input type="number" min="0" step="any" class="ingredient-qty" placeholder="Quantità" value="${data.qty}" />
    <select class="ingredient-unit">
      <option value="g" ${data.unit === 'g' ? 'selected' : ''}>g</option>
      <option value="kg" ${data.unit === 'kg' ? 'selected' : ''}>kg</option>
      <option value="mg" ${data.unit === 'mg' ? 'selected' : ''}>mg</option>
      <option value="l" ${data.unit === 'l' ? 'selected' : ''}>l</option>
      <option value="ml" ${data.unit === 'ml' ? 'selected' : ''}>ml</option>
    </select>
    <button class="delete-ingredient" title="Elimina ingrediente">🗑️</button>
  `;
  container.appendChild(div);

  // elimina ingrediente
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

  // Imposta tempo se presente
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
    timeSelect.value = '5 min';
    customInput.style.display = 'none';
    customInput.value = '';
  }

  // cambio selezione tempo
  timeSelect.addEventListener('change', () => {
    if (timeSelect.value === 'Personalizzato') {
      customInput.style.display = 'inline-block';
      if (!customInput.value) customInput.value = '00:05';
    } else {
      customInput.style.display = 'none';
      customInput.value = '';
    }
  });

  // elimina azione
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
    recipeTitleInput.textContent = recipe.title || '';
    currentImageBase64 = recipe.image || '';
    if (currentImageBase64) {
      profilePicPreview.src = currentImageBase64;
      profilePicPreview.style.display = 'block';
    } else {
      profilePicPreview.src = '';
      profilePicPreview.style.display = 'none';
    }

    // ingredienti
    const ingContainer = document.getElementById('ingredientsContainer');
    ingContainer.innerHTML = '';
    recipe.ingredients.forEach(ing => addIngredient(ing));

    // azioni
    const actContainer = document.getElementById('actionsContainer');
    actContainer.innerHTML = '';
    recipe.actions.forEach(act => addAction(act));
  }
}

// prende lo stato attuale serializzato per confronto modifiche
function getCurrentData() {
  const title = recipeTitleInput.textContent.trim();
  const ingredients = [];
  document.querySelectorAll('.ingredient-item').forEach(item => {
    const name = item.querySelector('.ingredient-name').value.trim();
    const qty = item.querySelector('.ingredient-qty').value.trim();
    const unit = item.querySelector('.ingredient-unit').value;
    if (name || qty || unit) ingredients.push({ name, qty, unit });
  });
  const actions = [];
  document.querySelectorAll('.action-item').forEach(item => {
    const actionText = item.querySelector('.phase-action').value.trim();
    const timeSelect = item.querySelector('.phase-time-select').value;
    const customTime = item.querySelector('.custom-time-input').value.trim();
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
  const title = recipeTitleInput.textContent.trim();
  if (!title) {
    alert('Devi inserire un titolo!');
    return;
  }

  const ingredients = [];
  document.querySelectorAll('.ingredient-item').forEach(item => {
    const name = item.querySelector('.ingredient-name').value.trim();
    const qty = item.querySelector('.ingredient-qty').value.trim();
    const unit = item.querySelector('.ingredient-unit').value;
    if (name || qty || unit) ingredients.push({ name, qty, unit });
  });

  if (ingredients.length === 0) {
    alert('Devi aggiungere almeno un ingrediente!');
    return;
  }

  const actions = [];
  document.querySelectorAll('.action-item').forEach(item => {
    const actionText = item.querySelector('.phase-action').value.trim();
    const timeSelect = item.querySelector('.phase-time-select').value;
    const customTime = item.querySelector('.custom-time-input').value.trim();
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

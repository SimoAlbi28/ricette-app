const addIngredientBtn = document.getElementById('addIngredientBtn');
const addActionBtn = document.getElementById('addActionBtn');
const saveBtn = document.getElementById('saveBtn');
const backBtn = document.getElementById('backBtn');
const recipeTitleInput = document.getElementById('recipeTitle');
const profilePicInput = document.getElementById('profilePicInput');
const profilePicPreview = document.getElementById('profilePicPreview');
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');

let currentImageBase64 = '';
let initialData = null;
const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.has('edit') ? parseInt(urlParams.get('edit')) : null;

let dragged = null;
let dragInsertBefore = true;

// --- CREA SELECT "Pers:" SOTTO IL TITOLO con stile migliorato ---
const personsContainer = document.createElement('div');
personsContainer.style.marginTop = '8px';
personsContainer.style.marginBottom = '16px';
personsContainer.style.display = 'flex';
personsContainer.style.alignItems = 'center';
personsContainer.style.gap = '10px';
personsContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

const personsLabel = document.createElement('label');
personsLabel.setAttribute('for', 'personsSelect');
personsLabel.textContent = 'Pers:';
personsLabel.style.fontWeight = '600';
personsLabel.style.fontSize = '1rem';
personsLabel.style.color = '#333';

const personsSelect = document.createElement('select');
personsSelect.id = 'personsSelect';
personsSelect.style.width = '70px';
personsSelect.style.padding = '6px 10px';
personsSelect.style.border = '1.8px solid #008079';
personsSelect.style.borderRadius = '6px';
personsSelect.style.backgroundColor = '#f0fdfa';
personsSelect.style.color = '#00504a';
personsSelect.style.fontWeight = '500';
personsSelect.style.fontSize = '1rem';
personsSelect.style.cursor = 'pointer';
personsSelect.style.transition = 'border-color 0.3s ease';

personsSelect.addEventListener('focus', () => {
  personsSelect.style.borderColor = '#00bfa5';
  personsSelect.style.boxShadow = '0 0 5px #00bfa5';
});

personsSelect.addEventListener('blur', () => {
  personsSelect.style.borderColor = '#008079';
  personsSelect.style.boxShadow = 'none';
});

for (let i = 1; i <= 10; i++) {
  const option = document.createElement('option');
  option.value = i.toString();
  option.textContent = i.toString();
  personsSelect.appendChild(option);
}

personsContainer.appendChild(personsLabel);
personsContainer.appendChild(personsSelect);

recipeTitleInput.parentNode.insertBefore(personsContainer, recipeTitleInput.nextSibling);
// --- FINE SELECT Pers ---

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

function addIngredient(data = { name: '', qty: '', unit: '' }) {
  const container = document.getElementById('ingredientsContainer');
  const div = document.createElement('div');
  div.classList.add('ingredient-item');
  div.innerHTML = `
    <input type="text" class="ingredient-name" placeholder="Ingrediente" value="${data.name}" />
    <input type="number" min="0" step="any" class="ingredient-quantity" placeholder="Q" value="${data.qty}" />
    <select class="ingredient-unit">
      <option value="" ${data.unit === '' ? 'selected' : ''}>—</option>
      <option value="g" ${data.unit === 'g' ? 'selected' : ''}>g</option>
      <option value="kg" ${data.unit === 'kg' ? 'selected' : ''}>kg</option>
      <option value="mg" ${data.unit === 'mg' ? 'selected' : ''}>mg</option>
      <option value="l" ${data.unit === 'l' ? 'selected' : ''}>l</option>
      <option value="ml" ${data.unit === 'ml' ? 'selected' : ''}>ml</option>
      <option value="unità" ${data.unit === 'unità' ? 'selected' : ''}>unità</option>
    </select>
    <button class="delete-ingredient" title="Elimina ingrediente">🗑️</button>
  `;
  container.appendChild(div);

  div.querySelector('.delete-ingredient').addEventListener('click', () => {
    const name = div.querySelector('.ingredient-name').value.trim() || 'Ingrediente senza nome';
    if (confirm(`Confermi di voler eliminare l'ingrediente: "${name}"?`)) {
      div.remove();
    }
  });
}

function addAction(data = { actionText: '', time: '' }) {
  const container = document.getElementById('actionsContainer');
  const div = document.createElement('div');
  div.classList.add('action-item');
  div.setAttribute('draggable', 'true');
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
    let actionText = div.querySelector('.phase-action').value.trim();
    actionText = actionText.replace(/^\d+\.\s*/, '') || 'Azione senza descrizione';
    if (confirm(`Confermi di voler eliminare l'azione: "${actionText}"?`)) {
      div.remove();
      updateActionNumbers();
    }
  });

  div.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', null);
    dragged = div;
    setTimeout(() => div.classList.add('dragging'), 0);
  });

  div.addEventListener('dragend', e => {
    dragged = null;
    div.classList.remove('dragging');
    removeDropIndicators();
    updateActionNumbers();
  });

  div.addEventListener('dragover', e => {
    e.preventDefault();
    const bounding = div.getBoundingClientRect();
    const offset = e.clientY - bounding.top;
    const half = bounding.height / 2;
    removeDropIndicators();
    if (offset < half) {
      div.classList.add('drag-over-top');
      dragInsertBefore = true;
    } else {
      div.classList.add('drag-over-bottom');
      dragInsertBefore = false;
    }
  });

  div.addEventListener('dragleave', e => {
    removeDropIndicators();
  });

  div.addEventListener('drop', e => {
    e.preventDefault();
    removeDropIndicators();
    if (!dragged || dragged === div) return;
    const container = div.parentNode;
    if (dragInsertBefore) {
      container.insertBefore(dragged, div);
    } else {
      container.insertBefore(dragged, div.nextSibling);
    }
    updateActionNumbers();
  });
}

function removeDropIndicators() {
  document.querySelectorAll('.drag-over-top').forEach(el => el.classList.remove('drag-over-top'));
  document.querySelectorAll('.drag-over-bottom').forEach(el => el.classList.remove('drag-over-bottom'));
}

function updateActionNumbers() {
  const container = document.getElementById('actionsContainer');
  const items = container.querySelectorAll('.action-item');
  items.forEach((item, i) => {
    const textarea = item.querySelector('textarea.phase-action');
    if (textarea) {
      let text = textarea.value.trim();
      text = text.replace(/^\d+\.\s*/, '');
      textarea.value = `${i + 1}. ${text}`;
    }
  });
}

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

    updateActionNumbers();
  }
}

function getCurrentData() {
  const title = recipeTitleInput.value.trim();
  const persons = personsSelect.value; // prendo valore pers selezionato

  const ingredients = [];
  document.querySelectorAll('.ingredient-item').forEach(item => {
    const nameInput = item.querySelector('.ingredient-name');
    const qtyInput = item.querySelector('.ingredient-quantity');
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

    let actionText = actionTextInput ? actionTextInput.value.trim() : '';
    actionText = actionText.replace(/^\d+\.\s*/, '');

    const timeSelect = timeSelectInput ? timeSelectInput.value : '';
    const customTime = customTimeInput ? customTimeInput.value.trim() : '';

    const time = (timeSelect === 'Personalizzato') ? customTime : timeSelect;
    actions.push({ actionText, time });
  });

  return {
    title,
    persons, // aggiunto
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
    const qtyInput = item.querySelector('.ingredient-quantity');
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

    let actionText = actionTextInput ? actionTextInput.value.trim() : '';
    actionText = actionText.replace(/^\d+\.\s*/, '');

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

  const personsValue = personsSelect.value || '1';

  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');

  if (editIndex !== null && recipes[editIndex]) {
    recipes[editIndex] = {
      title,
      persons: personsValue, // salvo il valore pers
      image: currentImageBase64,
      ingredients,
      actions
    };
  } else {
    recipes.push({
      title,
      persons: personsValue,
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

if (deleteRecipeBtn) {
  deleteRecipeBtn.addEventListener('click', () => {
    const title = recipeTitleInput.value.trim() || 'Ricetta senza nome';
    if (confirm(`Confermi di voler eliminare la ricetta: "${title}"?`)) {
      const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      if (editIndex !== null && recipes[editIndex]) {
        recipes.splice(editIndex, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        alert('Ricetta eliminata!');
        window.location.href = 'index.html';
      } else {
        alert('Nessuna ricetta da eliminare.');
      }
    }
  });
}

if (editIndex !== null) {
  loadRecipe(editIndex);
} else {
  addIngredient();
  addAction();
}

saveInitialData();

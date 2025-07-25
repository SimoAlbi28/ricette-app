const recipeList = document.getElementById('recipeList');
const btnAdd = document.getElementById('btnAdd');

const defaultImage = '/img/basic.png';

// Funzione helper per formattare il tempo in modo corretto
function formatTimeText(timeStr) {
  if (!timeStr || timeStr.trim() === '') return '-- : --';

  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const min = parseInt(parts[0], 10);
      const sec = parseInt(parts[1], 10);
      if (!isNaN(min) && !isNaN(sec)) {
        if (sec > 0) {
          return `${min} min ${sec} sec`;
        } else {
          return `${min} min`;
        }
      }
    }
    return '-- : --';
  }

  if (/^\d+\s*min$/i.test(timeStr.trim())) {
    return timeStr.trim();
  }

  const numMatch = timeStr.match(/\d+/);
  if (numMatch) {
    return `${numMatch[0]} min`;
  }

  return '-- : --';
}

function loadRecipes() {
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  recipeList.innerHTML = '';

  if (recipes.length === 0) {
    recipeList.innerHTML = '<p class="empty-msg">Nessuna ricetta ancora, aggiungine una!</p>';
    return;
  }

  recipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    // -------------------- RIGA PRINCIPALE --------------------
    const mainRow = document.createElement('div');
    mainRow.className = 'main-row';
    Object.assign(mainRow.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '15px',
      padding: '10px 15px',
      borderBottom: '1px solid #ccc',
    });

    // Immagine
    const img = document.createElement('img');
    img.className = 'recipe-image';
    img.src = recipe.image || defaultImage;
    img.alt = 'Immagine ricetta';
    Object.assign(img.style, {
      width: '70px',
      height: '70px',
      objectFit: 'cover',
      borderRadius: '8px',
      flexShrink: '0',
    });

    // Container centro con titolo e persone
    const centerContainer = document.createElement('div');
    Object.assign(centerContainer.style, {
      flexGrow: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '4px',
      overflow: 'hidden',
    });

    const title = document.createElement('div');
    title.className = 'recipe-title';
    title.textContent = recipe.title.toUpperCase();
    Object.assign(title.style, {
      fontWeight: '700',
      fontSize: '1.1rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: '#004d40',
    });

    centerContainer.appendChild(title);

    if (recipe.persons && recipe.persons !== '-' && recipe.persons !== '0') {
      const personsInfo = document.createElement('div');
      personsInfo.className = 'recipe-persons';
      personsInfo.textContent = `Persone: ${recipe.persons}`;
      Object.assign(personsInfo.style, {
        fontWeight: '500',
        fontSize: '0.85rem',
        color: '#00796b',
        opacity: '0.8',
        whiteSpace: 'nowrap',
      });
      centerContainer.appendChild(personsInfo);
    }

    // Container bottoni a destra
    const btns = document.createElement('div');
    btns.className = 'btns-container';
    Object.assign(btns.style, {
      display: 'flex',
      gap: '8px',
      flexShrink: '0',
    });

    const openBtn = document.createElement('button');
    openBtn.className = 'btn-apri';
    openBtn.textContent = 'Apri';
    openBtn.title = 'Mostra dettagli ricetta';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-secondary';
    editBtn.textContent = 'Modifica';
    editBtn.title = 'Modifica ricetta';
    editBtn.addEventListener('click', () => {
      window.location.href = `add.html?edit=${index}`;
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-danger';
    delBtn.textContent = 'Elimina';
    delBtn.title = 'Elimina ricetta';
    delBtn.addEventListener('click', () => {
      if (confirm('Sei sicuro di voler eliminare questa ricetta?')) {
        deleteRecipe(index);
      }
    });

    btns.appendChild(openBtn);
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    // Metto tutto nella riga principale
    mainRow.appendChild(img);
    mainRow.appendChild(centerContainer);
    mainRow.appendChild(btns);

    card.appendChild(mainRow);

    // (segue tutto il resto come prima...)
    // ... Dettagli, ingredienti, azioni ecc

    // Resto codice identico...
  });
}

function deleteRecipe(index) {
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  recipes.splice(index, 1);
  localStorage.setItem('recipes', JSON.stringify(recipes));
  loadRecipes();
}

// Drag & Drop azioni con effetto placeholder e aggiornamento numeri + salvataggio
function enableDragDrop(container, recipeIndex) {
  let dragged = null;
  const placeholder = document.createElement('div');
  placeholder.className = 'action-placeholder';
  Object.assign(placeholder.style, {
    height: '40px',
    border: '2px dashed #008079',
    margin: '5px 0',
    borderRadius: '5px'
  });

  container.querySelectorAll('.action-box').forEach(actionBox => {
    actionBox.draggable = true;

    actionBox.addEventListener('dragstart', (e) => {
      dragged = actionBox;
      actionBox.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    actionBox.addEventListener('dragend', () => {
      if (dragged) dragged.style.opacity = '1';
      dragged = null;
      placeholder.remove();
    });

    actionBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (actionBox === dragged) return;

      const rect = actionBox.getBoundingClientRect();
      const offset = e.clientY - rect.top;

      if (offset > rect.height / 2) {
        if (actionBox.nextSibling !== placeholder) {
          actionBox.after(placeholder);
        }
      } else {
        if (actionBox.previousSibling !== placeholder) {
          actionBox.before(placeholder);
        }
      }
    });

    actionBox.addEventListener('dragleave', (e) => {
      const related = e.relatedTarget;
      if (!related || !container.contains(related) || related !== placeholder) {
        placeholder.remove();
      }
    });

    actionBox.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragged && placeholder.parentNode === container) {
        container.insertBefore(dragged, placeholder);
        placeholder.remove();
        updateActionNumbers(container);
        saveDraggedOrder(container, recipeIndex);
      }
    });
  });
}

function updateActionNumbers(container) {
  const actions = container.querySelectorAll('.action-text');
  actions.forEach((actionText, i) => {
    const parts = actionText.textContent.split('. ');
    if (parts.length > 1) {
      actionText.textContent = `${i + 1}. ${parts.slice(1).join('. ')}`;
    }
  });
}

function saveDraggedOrder(container, recipeIndex) {
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  if (!recipes[recipeIndex]) return;

  const newOrder = [];
  container.querySelectorAll('.action-box').forEach(box => {
    const textEl = box.querySelector('.action-text');
    const timeSpan = box.querySelector('.action-time');
    const text = textEl ? textEl.textContent.replace(/^\d+\.\s*/, '') : '';
    const timeText = timeSpan ? timeSpan.textContent : '';

    let time = '';
    if (timeText && timeText !== '-- : --') {
      time = timeText;
    }

    newOrder.push({ actionText: text, time: time });
  });

  recipes[recipeIndex].actions = newOrder;
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

btnAdd.addEventListener('click', () => {
  window.location.href = 'add.html';
});

window.addEventListener('load', loadRecipes);

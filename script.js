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

    const img = document.createElement('img');
    img.className = 'recipe-image';
    img.src = recipe.image || defaultImage;
    img.alt = 'Immagine ricetta';

    const title = document.createElement('div');
    title.className = 'recipe-title';
    title.textContent = recipe.title.toUpperCase();

    const btns = document.createElement('div');
    btns.className = 'btns-container';

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

    mainRow.appendChild(img);
    mainRow.appendChild(title);
    mainRow.appendChild(btns);

    card.appendChild(mainRow);

    // -------------------- DETTAGLI --------------------
    const details = document.createElement('div');
    details.className = 'recipe-details';
    details.style.display = 'none';

    // -------------------- INGREDIENTI --------------------
    const ingrSectionTitle = document.createElement('h3');
    ingrSectionTitle.textContent = '🧂 Ingredienti 🧂';
    Object.assign(ingrSectionTitle.style, {
      color: '#008079',
      border: '2px solid black',
      marginTop: '20px',
      marginBottom: '10px',
      backgroundColor: '#a8fadf',
      padding: '8px',
      borderRadius: '8px'
    });

    details.appendChild(ingrSectionTitle);

    const ingrContainer = document.createElement('div');
    ingrContainer.className = 'ingredients-container';
    ingrContainer.style.backgroundColor = '#ffffff';

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => {
        const ingrBox = document.createElement('div');
        ingrBox.className = 'ingredient-box';
        Object.assign(ingrBox.style, {
          backgroundColor: '#d0f5f0',
          border: '2px solid black',
          borderRadius: '5px',
          padding: '8px',
          margin: '5px 0',
          color: '#008079'
        });

        const quant = ing.qty || ing.quantity || '';
        const unit = ing.unit || '';
        ingrBox.textContent = `${ing.name} --> ${quant} ${unit}`.trim();

        ingrContainer.appendChild(ingrBox);
      });
    } else {
      const noIngr = document.createElement('p');
      noIngr.textContent = 'Nessun ingrediente inserito';
      ingrContainer.appendChild(noIngr);
    }

    details.appendChild(ingrContainer);

    // LINEA DI SEPARAZIONE
    const separator = document.createElement('hr');
    Object.assign(separator.style, {
      borderTop: '2px solid #000',
      margin: '25px 0'
    });
    details.appendChild(separator);

    // -------------------- AZIONI --------------------
    const actionsSectionTitle = document.createElement('h3');
    actionsSectionTitle.textContent = '⚙️ Azioni ⚙️';
    Object.assign(actionsSectionTitle.style, {
      color: '#008079',
      border: '2px solid black',
      marginTop: '0',
      marginBottom: '10px',
      backgroundColor: '#a8faf6',
      padding: '8px',
      borderRadius: '8px'
    });

    details.appendChild(actionsSectionTitle);

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';
    actionsContainer.style.backgroundColor = '#fcfcfc';

    if (recipe.actions && recipe.actions.length > 0) {
      recipe.actions.forEach((step, i) => {
        const actionBox = document.createElement('div');
        actionBox.className = 'action-box';
        actionBox.style.marginBottom = '8px';

        const actionText = document.createElement('p');
        actionText.className = 'action-text';
        const desc = (typeof step === 'object' && step !== null)
          ? step.actionText || step.description || JSON.stringify(step)
          : step;

        actionText.textContent = `${i + 1}. ${desc}`;
        actionBox.appendChild(actionText);

        // Gestione timer formattato
        const timeText = formatTimeText(step.time);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'action-time';
        timeSpan.textContent = timeText;
        actionBox.appendChild(timeSpan);

        actionsContainer.appendChild(actionBox);
      });
    } else {
      const noActions = document.createElement('p');
      noActions.textContent = 'Nessuna azione inserita';
      actionsContainer.appendChild(noActions);
    }

    details.appendChild(actionsContainer);

    // Abilita drag&drop per le azioni
    enableDragDrop(actionsContainer, index);

    // -------------------- CHIUDI --------------------
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-danger';
    closeBtn.textContent = 'Chiudi';
    Object.assign(closeBtn.style, {
      marginTop: '20px',
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: '8px 30px',
      fontWeight: '600'
    });

    closeBtn.addEventListener('click', () => {
      details.style.display = 'none';
      openBtn.style.display = 'inline-block';
    });

    details.appendChild(closeBtn);

    // Eventi
    openBtn.addEventListener('click', () => {
      details.style.display = 'flex';
      details.style.flexDirection = 'column';
      openBtn.style.display = 'none';
    });

    card.appendChild(details);
    recipeList.appendChild(card);
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
      // Trasforma "x min y sec" in formato testo da salvare, se vuoi potresti fare parsing più preciso qui
      // Ma per ora lo salvo così com'è
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

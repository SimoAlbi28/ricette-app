const recipeList = document.getElementById('recipeList');
const btnAdd = document.getElementById('btnAdd');

const defaultImage = '/img/basic.png';

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

    // Riga principale con immagine, titolo e bottoni
    const mainRow = document.createElement('div');
    mainRow.className = 'main-row';

    // Immagine
    const img = document.createElement('img');
    img.className = 'recipe-image';
    img.src = recipe.image || defaultImage;
    img.alt = 'Immagine ricetta';

    // Titolo
    const title = document.createElement('div');
    title.className = 'recipe-title';
    title.textContent = recipe.title.toUpperCase();

    // Container bottoni
    const btns = document.createElement('div');
    btns.className = 'btns-container';

    // Bottone APRI verde
    const openBtn = document.createElement('button');
    openBtn.className = 'btn-apri';
    openBtn.textContent = 'Apri';
    openBtn.title = 'Mostra dettagli ricetta';

    // Bottone MODIFICA
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-secondary';
    editBtn.textContent = 'Modifica';
    editBtn.title = 'Modifica ricetta';
    editBtn.addEventListener('click', () => {
      window.location.href = `add.html?edit=${index}`;
    });

    // Bottone ELIMINA
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

    // DETTAGLI nascosti
    const details = document.createElement('div');
    details.className = 'recipe-details';

    // SEZIONE INGREDIENTI
    const ingrSectionTitle = document.createElement('h3');
    ingrSectionTitle.textContent = '🧂 Ingredienti';
    ingrSectionTitle.style.color = '#06ccc2';
    ingrSectionTitle.style.marginBottom = '10px';
    details.appendChild(ingrSectionTitle);

    const ingrContainer = document.createElement('div');
    ingrContainer.className = 'ingredients-container';

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => {
        const ingrBox = document.createElement('div');
        ingrBox.className = 'ingredient-box';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'ingredient-name';

        const quantUnitDiv = document.createElement('div');
        quantUnitDiv.className = 'ingredient-quant-unit';

        if (typeof ing === 'object' && ing !== null) {
          nameDiv.textContent = ing.name || '';
          let quant = ing.quantity || '';
          let unit = ing.unit || '';
          quantUnitDiv.textContent = (quant && unit) ? `${quant} ${unit}` : quant || unit || '';
        } else {
          nameDiv.textContent = ing;
          quantUnitDiv.textContent = '';
        }

        ingrBox.appendChild(nameDiv);
        if (quantUnitDiv.textContent) ingrBox.appendChild(quantUnitDiv);
        ingrContainer.appendChild(ingrBox);
      });
    } else {
      const noIngr = document.createElement('p');
      noIngr.textContent = 'Nessun ingrediente inserito';
      ingrContainer.appendChild(noIngr);
    }

    details.appendChild(ingrContainer);

    // SEZIONE AZIONI
    const actionsSectionTitle = document.createElement('h3');
    actionsSectionTitle.textContent = '⚙️ Azioni';
    actionsSectionTitle.style.color = '#06ccc2';
    actionsSectionTitle.style.marginTop = '20px';
    actionsSectionTitle.style.marginBottom = '10px';
    details.appendChild(actionsSectionTitle);

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';

    if (recipe.steps && recipe.steps.length > 0) {
      recipe.steps.forEach(step => {
        const actionBox = document.createElement('div');
        actionBox.className = 'action-box';

        const actionText = document.createElement('p');
        actionText.className = 'action-text';

        if (typeof step === 'object' && step !== null) {
          actionText.textContent = step.description || JSON.stringify(step);
        } else {
          actionText.textContent = step;
        }

        actionBox.appendChild(actionText);

        if (step.time) {
          const timeSpan = document.createElement('span');
          timeSpan.className = 'action-time';
          timeSpan.textContent = step.time;
          actionBox.appendChild(timeSpan);
        }

        actionsContainer.appendChild(actionBox);
      });
    } else {
      const noActions = document.createElement('p');
      noActions.textContent = 'Nessuna azione inserita';
      actionsContainer.appendChild(noActions);
    }

    details.appendChild(actionsContainer);

    // Bottone CHIUDI centrato sotto tutto
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-danger';
    closeBtn.textContent = 'Chiudi';
    closeBtn.title = 'Chiudi dettagli';
    closeBtn.style.marginTop = '20px';
    closeBtn.style.display = 'block';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.marginRight = 'auto';
    closeBtn.style.width = 'auto';
    closeBtn.style.padding = '8px 30px';
    closeBtn.style.fontWeight = '600';

    details.appendChild(closeBtn);

    // Eventi Apri/Chiudi
    openBtn.addEventListener('click', () => {
      details.style.display = 'flex';
      details.style.flexDirection = 'column';
      openBtn.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
      details.style.display = 'none';
      openBtn.style.display = 'inline-block';
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

btnAdd.addEventListener('click', () => {
  window.location.href = 'add.html';
});

window.addEventListener('load', loadRecipes);

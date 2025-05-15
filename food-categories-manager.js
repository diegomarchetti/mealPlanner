/**
 * Meal Planner App - Food Categories Manager
 * Gestione delle categorie alimentari e degli alimenti
 */

import { FOOD_CATEGORIES } from './constants.js';

/**
 * Classe per la gestione delle categorie alimentari
 */
export class FoodCategoriesManager {
    /**
     * Costruttore
     * @param {Object} app - Riferimento all'istanza principale dell'app
     */
    constructor(app) {
        this.app = app;
        this.currentCategory = 'proteins';
    }

    /**
     * Cambia la categoria alimentare visualizzata
     * @param {string} category - Chiave della categoria
     */
    switchFoodCategory(category) {
        try {
            this.currentCategory = category;
            
            // Aggiorna UI
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.category === category);
            });
            
            // Render degli alimenti della categoria
            this.renderFoodItems();
        } catch (error) {
            console.error('Errore nel cambio categoria:', error);
        }
    }

    /**
     * Render degli alimenti della categoria corrente
     */
    renderFoodItems() {
        try {
            const foodItemsContainer = document.getElementById('food-items');
            if (!foodItemsContainer) {
                console.error('Container alimenti non trovato');
                return;
            }
            
            foodItemsContainer.innerHTML = '';
            
            let foodList = [];
            
            // Per la categoria "Altro" mostriamo solo gli alimenti personalizzati per quella categoria specifica
            if (this.currentCategory === 'other') {
                const customFoods = this.app.storageManager.getData('customFoods') || {};
                if (customFoods['other'] && customFoods['other'].length > 0) {
                    foodList = [...customFoods['other']];
                }
            } else {
                // Per le altre categorie mostriamo sia alimenti predefiniti che personalizzati
                if (FOOD_CATEGORIES[this.currentCategory] && FOOD_CATEGORIES[this.currentCategory].foods) {
                    foodList = [...FOOD_CATEGORIES[this.currentCategory].foods];
                }
                
                // Aggiungi alimenti personalizzati per questa categoria
                const customFoods = this.app.storageManager.getData('customFoods') || {};
                if (customFoods[this.currentCategory] && customFoods[this.currentCategory].length > 0) {
                    foodList = [...foodList, ...customFoods[this.currentCategory]];
                }
            }
            
            // Ordina alfabeticamente
            foodList.sort((a, b) => a.localeCompare(b, 'it'));
            
            // Crea elementi per ogni alimento
            foodList.forEach(food => {
                const foodEl = document.createElement('div');
                foodEl.className = 'food-choice';
                foodEl.dataset.food = food;
                
                // Verifica se l'alimento è già selezionato
                if (this.app.selectedFoods && this.app.selectedFoods.includes(food)) {
                    foodEl.classList.add('selected');
                }
                
                // Crea un contenitore per il testo e il bottone di eliminazione
                const contentContainer = document.createElement('div');
                contentContainer.className = 'food-choice-content';
                
                // Contenitore per il testo
                const textContainer = document.createElement('span');
                textContainer.className = 'food-choice-text';
                textContainer.textContent = food;
                contentContainer.appendChild(textContainer);
                
                // Aggiungi bottone di eliminazione
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-food-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.title = 'Elimina alimento';
                
                // Gestione click sul bottone di eliminazione
                deleteBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    this.deleteFood(food);
                });
                
                contentContainer.appendChild(deleteBtn);
                foodEl.appendChild(contentContainer);
                
                // Gestione click sull'alimento (per selezionarlo)
                foodEl.addEventListener('click', () => {
                    this.toggleFoodSelection(food, foodEl);
                });
                
                foodItemsContainer.appendChild(foodEl);
            });
            
            // Se non ci sono alimenti
            if (foodList.length === 0) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'empty-category';
                emptyEl.textContent = 'Nessun alimento in questa categoria. Aggiungine uno nuovo!';
                foodItemsContainer.appendChild(emptyEl);
            }
        } catch (error) {
            console.error('Errore nel rendering degli alimenti:', error);
        }
    }

    /**
     * Elimina un alimento
     * @param {string} food - Nome dell'alimento da eliminare
     */
    deleteFood(food) {
        try {
            // Conferma prima di eliminare
            if (!confirm(`Sei sicuro di voler eliminare "${food}"?`)) {
                return;
            }
            
            // Verifica se è un alimento predefinito
            let isDefaultFood = false;
            for (const categoryKey in FOOD_CATEGORIES) {
                if (FOOD_CATEGORIES[categoryKey].foods && FOOD_CATEGORIES[categoryKey].foods.includes(food)) {
                    isDefaultFood = true;
                    break;
                }
            }
            
            if (isDefaultFood) {
                alert('Non puoi eliminare un alimento predefinito.');
                return;
            }
            
            // Elimina dai cibi personalizzati
            const customFoods = this.app.storageManager.getData('customFoods') || {};
            let foodRemoved = false;
            
            // Cerca in tutte le categorie (non solo quella corrente)
            for (const categoryKey in customFoods) {
                if (customFoods[categoryKey] && customFoods[categoryKey].includes(food)) {
                    customFoods[categoryKey] = customFoods[categoryKey].filter(f => f !== food);
                    foodRemoved = true;
                }
            }
            
            if (foodRemoved) {
                // Salva i dati aggiornati
                this.app.storageManager.setData('customFoods', customFoods);
                
                // Aggiorna la UI
                this.renderFoodItems();
                
                // Rimuovi dalla selezione corrente se presente
                if (this.app.selectedFoods && this.app.selectedFoods.includes(food)) {
                    this.app.selectedFoods = this.app.selectedFoods.filter(f => f !== food);
                }
                
                // Feedback
                const event = new CustomEvent('showToast', {
                    detail: { message: `Alimento "${food}" eliminato con successo` }
                });
                document.dispatchEvent(event);
            } else {
                // Feedback
                const event = new CustomEvent('showToast', {
                    detail: { message: `Alimento "${food}" non trovato tra quelli personalizzati` }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Errore nell\'eliminazione dell\'alimento:', error);
        }
    }

    /**
     * Toggle della selezione di un alimento
     * @param {string} food - Nome dell'alimento
     * @param {HTMLElement} foodEl - Elemento DOM dell'alimento
     */
    toggleFoodSelection(food, foodEl) {
        try {
            // Se selectedFoods non esiste, crealo
            if (!this.app.selectedFoods) {
                this.app.selectedFoods = [];
            }
            
            // Toggle selezione
            if (this.app.selectedFoods.includes(food)) {
                this.app.selectedFoods = this.app.selectedFoods.filter(f => f !== food);
                foodEl.classList.remove('selected');
            } else {
                this.app.selectedFoods.push(food);
                foodEl.classList.add('selected');
            }
        } catch (error) {
            console.error('Errore nella selezione dell\'alimento:', error);
        }
    }

    /**
     * Aggiunge un alimento personalizzato
     */
    addCustomFood() {
        try {
            const customFoodInput = document.getElementById('customFoodInput');
            if (!customFoodInput) {
                console.error('Input alimento personalizzato non trovato');
                return;
            }
            
            const foodName = customFoodInput.value.trim();
            
            if (!foodName) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Inserisci un nome per l\'alimento' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Verifica se l'alimento esiste già nelle categorie predefinite
            let alreadyExists = false;
            for (const categoryKey in FOOD_CATEGORIES) {
                if (FOOD_CATEGORIES[categoryKey].foods && 
                    FOOD_CATEGORIES[categoryKey].foods.some(f => f.toLowerCase() === foodName.toLowerCase())) {
                    alreadyExists = true;
                    break;
                }
            }
            
            // Verifica anche tra gli alimenti personalizzati
            const customFoods = this.app.storageManager.getData('customFoods') || {};
            for (const categoryKey in customFoods) {
                if (customFoods[categoryKey] && 
                    customFoods[categoryKey].some(f => f.toLowerCase() === foodName.toLowerCase())) {
                    alreadyExists = true;
                    break;
                }
            }
            
            if (alreadyExists) {
                const event = new CustomEvent('showToast', {
                    detail: { message: `L'alimento "${foodName}" esiste già` }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Salva l'alimento nella categoria corrente
            if (!customFoods[this.currentCategory]) {
                customFoods[this.currentCategory] = [];
            }
            
            customFoods[this.currentCategory].push(foodName);
            
            // Salva i dati aggiornati
            this.app.storageManager.setData('customFoods', customFoods);
            
            // Resetta l'input
            customFoodInput.value = '';
            
            // Aggiorna la UI
            this.renderFoodItems();
            
            // Feedback
            const event = new CustomEvent('showToast', {
                detail: { message: `Alimento "${foodName}" aggiunto con successo` }
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error('Errore nell\'aggiunta dell\'alimento personalizzato:', error);
        }
    }

    /**
     * Ottiene la lista di tutte le categorie alimentari
     * @returns {Array} Lista delle categorie
     */
    getAllCategories() {
        return Object.keys(FOOD_CATEGORIES);
    }

    /**
     * Ottiene il nome e l'icona di una categoria
     * @param {string} categoryKey - Chiave della categoria
     * @returns {Object} Oggetto con nome e icona della categoria
     */
    getCategoryInfo(categoryKey) {
        const category = FOOD_CATEGORIES[categoryKey];
        if (category) {
            return {
                name: category.name,
                icon: category.icon
            };
        }
        return {
            name: 'Categoria sconosciuta',
            icon: '❓'
        };
    }
}

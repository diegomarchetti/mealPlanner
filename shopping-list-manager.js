/**
 * Meal Planner App - Shopping List Manager
 * Gestione della lista della spesa
 */

import { FOOD_CATEGORIES, getFoodCategoryName, getFoodCategoryIcon } from './constants.js';

/**
 * Classe per la gestione della lista della spesa
 */
export class ShoppingListManager {
    /**
     * Costruttore
     * @param {Object} app - Riferimento all'istanza principale dell'app
     */
    constructor(app) {
        this.app = app;
        this.shoppingWeekKey = null;
    }

    /**
     * Apre il modal di selezione della settimana
     */
    openWeekSelectionModal() {
        try {
            const modal = document.getElementById('select-week-modal');
            if (!modal) {
                console.error('Modal selezione settimana non trovato');
                return;
            }

            modal.style.display = 'block';
            
            // Prepara la lista delle settimane disponibili
            const shoppingWeekSelect = document.getElementById('shoppingWeekSelect');
            if (!shoppingWeekSelect) {
                console.error('Select settimana non trovato');
                return;
            }
            
            shoppingWeekSelect.innerHTML = '';
            
            // Aggiungi l'opzione per la settimana corrente
            const currentWeekOption = document.createElement('option');
            currentWeekOption.value = this.app.weeklyMenuManager.currentWeekKey;
            
            if (this.app.weeklyMenuManager.weekStartDate && this.app.weeklyMenuManager.weekEndDate) {
                const startDateFormatted = this.app.weeklyMenuManager.formatDate(this.app.weeklyMenuManager.weekStartDate);
                const endDateFormatted = this.app.weeklyMenuManager.formatDate(this.app.weeklyMenuManager.weekEndDate);
                currentWeekOption.textContent = `${this.app.weeklyMenuManager.currentWeekKey} (${startDateFormatted} - ${endDateFormatted}) - Settimana corrente`;
            } else {
                currentWeekOption.textContent = `${this.app.weeklyMenuManager.currentWeekKey} - Settimana corrente`;
            }
            
            shoppingWeekSelect.appendChild(currentWeekOption);
            
            // Ottieni tutte le settimane salvate
            const weeklyMenus = this.app.storageManager.getData('weeklyMenus') || {};
            const weeks = Object.keys(weeklyMenus)
                .filter(week => week !== this.app.weeklyMenuManager.currentWeekKey)
                .sort()
                .reverse();
            
            // Aggiungi le altre settimane
            if (weeks.length > 0) {
                weeks.forEach(week => {
                    try {
                        // Calcola le date della settimana per una visualizzazione più user-friendly
                        let weekDatesInfo = '';
                        
                        // Estrai anno e numero settimana (es. "2025-W20" -> anno=2025, weekNum=20)
                        const yearWeekMatch = week.match(/(\d{4})-W(\d{2})/);
                        if (yearWeekMatch) {
                            const year = parseInt(yearWeekMatch[1]);
                            const weekNum = parseInt(yearWeekMatch[2]);
                            
                            // Calcola il primo giorno della settimana (algoritmo approssimativo)
                            const approximateDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
                            
                            // Ottieni le date effettive della settimana
                            const weekDates = this.app.weeklyMenuManager.getWeekDates(approximateDate);
                            
                            // Formatta le date
                            const startFormatted = this.app.weeklyMenuManager.formatDate(weekDates.start);
                            const endFormatted = this.app.weeklyMenuManager.formatDate(weekDates.end);
                            
                            weekDatesInfo = ` (${startFormatted} - ${endFormatted})`;
                        }
                        
                        const option = document.createElement('option');
                        option.value = week;
                        option.textContent = `${week}${weekDatesInfo}`;
                        shoppingWeekSelect.appendChild(option);
                    } catch (err) {
                        console.error(`Errore nella visualizzazione della settimana ${week}:`, err);
                        const option = document.createElement('option');
                        option.value = week;
                        option.textContent = week;
                        shoppingWeekSelect.appendChild(option);
                    }
                });
            }
            
            // Aggiungi event listener per il bottone di conferma
            const confirmBtn = document.getElementById('confirmWeekSelectionBtn');
            if (confirmBtn) {
                // Rimuovi eventuali listener esistenti
                const newBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
                
                // Aggiungi il nuovo listener
                newBtn.addEventListener('click', () => {
                    this.generateShoppingListForWeek();
                });
            }
        } catch (error) {
            console.error('Errore nell\'apertura del modal di selezione settimana:', error);
            
            // Feedback di errore
            const event = new CustomEvent('showToast', {
                detail: { message: 'Errore nell\'apertura del selettore settimana' }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Genera la lista della spesa per la settimana selezionata
     */
    generateShoppingListForWeek() {
        try {
            const shoppingWeekSelect = document.getElementById('shoppingWeekSelect');
            if (!shoppingWeekSelect) {
                console.error('Select settimana non trovato');
                return;
            }
            
            this.shoppingWeekKey = shoppingWeekSelect.value;
            
            if (!this.shoppingWeekKey) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Seleziona una settimana valida' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Chiudi il modal
            if (typeof this.app.closeAllModals === 'function') {
                this.app.closeAllModals();
            } else {
                const modal = document.getElementById('select-week-modal');
                if (modal) modal.style.display = 'none';
            }
            
            // Genera la lista della spesa
            this.generateShoppingList();
            
        } catch (error) {
            console.error('Errore nella generazione della lista della spesa per la settimana:', error);
        }
    }

    /**
     * Genera la lista della spesa dai menu
     */
    generateShoppingList() {
        try {
            // Se non è stata selezionata una settimana, usa quella corrente
            if (!this.shoppingWeekKey) {
                this.openWeekSelectionModal();
                return;
            }
            
            // Ottieni i dati del menu della settimana
            const weekData = this.app.storageManager.getData(`weeklyMenus.${this.shoppingWeekKey}`) || {};
            
            // Lista temporanea per contare gli alimenti
            const tempList = {};
            
            // Inizializza le categorie
            for (const categoryKey in FOOD_CATEGORIES) {
                tempList[categoryKey] = {};
            }
            
            // Analizza tutti i pasti della settimana
            for (const dayKey in weekData) {
                const day = weekData[dayKey];
                for (const mealKey in day) {
                    const foods = day[mealKey];
                    
                    if (Array.isArray(foods)) {
                        foods.forEach(food => {
                            // Trova la categoria dell'alimento
                            let foodCategory = 'other'; // Default
                            
                            // Cerca nelle categorie predefinite
                            for (const categoryKey in FOOD_CATEGORIES) {
                                if (FOOD_CATEGORIES[categoryKey].foods && 
                                    FOOD_CATEGORIES[categoryKey].foods.includes(food)) {
                                    foodCategory = categoryKey;
                                    break;
                                }
                            }
                            
                            // Cerca anche negli alimenti personalizzati
                            const customFoods = this.app.storageManager.getData('customFoods') || {};
                            for (const categoryKey in customFoods) {
                                if (customFoods[categoryKey] && 
                                    customFoods[categoryKey].includes(food)) {
                                    foodCategory = categoryKey;
                                    break;
                                }
                            }
                            
                            // Incrementa il conteggio per questo alimento
                            if (!tempList[foodCategory][food]) {
                                tempList[foodCategory][food] = {
                                    quantity: 1,
                                    completed: false
                                };
                            } else {
                                tempList[foodCategory][food].quantity++;
                            }
                        });
                    }
                }
            }
            
            // Recupera la lista della spesa esistente
            const existingList = this.app.storageManager.getData('shoppingList') || {};
            
            // Merge con eventuali prodotti già presenti nella lista (mantiene i valori completati)
            for (const categoryKey in tempList) {
                for (const foodName in tempList[categoryKey]) {
                    if (existingList[categoryKey] && 
                        existingList[categoryKey][foodName]) {
                        // Conserva lo stato completed ma aggiorna la quantità
                        tempList[categoryKey][foodName].completed = existingList[categoryKey][foodName].completed;
                    }
                }
            }
            
            // Merge con eventuali prodotti aggiunti manualmente ma non inclusi nei menu
            for (const categoryKey in existingList) {
                for (const foodName in existingList[categoryKey]) {
                    if (!tempList[categoryKey]) {
                        tempList[categoryKey] = {};
                    }
                    if (!tempList[categoryKey][foodName]) {
                        tempList[categoryKey][foodName] = existingList[categoryKey][foodName];
                    }
                }
            }
            
            // Salva la lista aggiornata
            this.app.storageManager.setData('shoppingList', tempList);
            
            // Aggiorna la UI
            this.renderShoppingList();
            
            // Se non è la settimana corrente, mostra un messaggio informativo
            if (this.shoppingWeekKey !== this.app.weeklyMenuManager.currentWeekKey) {
                const event = new CustomEvent('showToast', {
                    detail: { 
                        message: `Lista generata per la settimana ${this.shoppingWeekKey}` 
                    }
                });
                document.dispatchEvent(event);
            } else {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Lista della spesa generata' }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Errore nella generazione della lista della spesa:', error);
            
            // Feedback di errore
            const event = new CustomEvent('showToast', {
                detail: { message: 'Errore nella generazione della lista della spesa' }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Render della lista della spesa
     */
    renderShoppingList() {
        try {
            const shoppingListContainer = document.getElementById('shopping-list');
            if (!shoppingListContainer) {
                console.error('Container lista della spesa non trovato');
                return;
            }
            
            shoppingListContainer.innerHTML = '';
            
            // Ottieni la lista della spesa
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            // Crea elementi per ogni categoria
            for (const categoryKey in FOOD_CATEGORIES) {
                const category = FOOD_CATEGORIES[categoryKey];
                const items = shoppingList[categoryKey] || {};
                
                // Salta categorie vuote
                if (Object.keys(items).length === 0) continue;
                
                // Conta gli elementi completati
                const totalItems = Object.keys(items).length;
                const completedItems = Object.values(items).filter(item => item.completed).length;
                
                // Crea l'elemento categoria
                const categoryEl = document.createElement('div');
                categoryEl.className = 'shopping-category';
                
                // Header categoria con toggle
                const headerEl = document.createElement('div');
                headerEl.className = 'category-header';
                headerEl.innerHTML = `
                    <div>
                        <span>${category.icon} ${category.name}</span>
                        <span class="category-counter">(${completedItems}/${totalItems})</span>
                    </div>
                    <button class="toggle-category">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                `;
                
                // Toggle apertura/chiusura categoria
                headerEl.querySelector('.toggle-category').addEventListener('click', (e) => {
                    e.target.closest('.shopping-category').classList.toggle('collapsed');
                    const icon = e.target.querySelector('i') || e.target;
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-right');
                });
                
                categoryEl.appendChild(headerEl);
                
                // Contenitore per gli item
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'category-items';
                
                // Crea elementi per ogni prodotto
                Object.keys(items).sort().forEach(foodName => {
                    const item = items[foodName];
                    
                    const itemEl = document.createElement('div');
                    itemEl.className = `shopping-item${item.completed ? ' completed' : ''}`;
                    
                    // Checkbox completamento
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = item.completed;
                    checkbox.addEventListener('change', () => {
                        this.toggleItemCompletion(categoryKey, foodName);
                    });
                    
                    // Label con nome prodotto
                    const label = document.createElement('label');
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(foodName));
                    
                    // Input quantità
                    const quantityInput = document.createElement('input');
                    quantityInput.type = 'number';
                    quantityInput.value = item.quantity;
                    quantityInput.min = 1;
                    quantityInput.addEventListener('change', (e) => {
                        this.updateItemQuantity(categoryKey, foodName, parseInt(e.target.value));
                    });
                    
                    // Bottone eliminazione
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-item-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.addEventListener('click', () => {
                        this.removeShoppingItem(categoryKey, foodName);
                    });
                    
                    // Aggiungi elementi
                    itemEl.appendChild(label);
                    itemEl.appendChild(quantityInput);
                    itemEl.appendChild(deleteBtn);
                    
                    itemsContainer.appendChild(itemEl);
                });
                
                categoryEl.appendChild(itemsContainer);
                shoppingListContainer.appendChild(categoryEl);
            }
            
            // Se non ci sono prodotti
            if (shoppingListContainer.children.length === 0) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'empty-list';
                emptyEl.innerHTML = `
                    <p>La lista della spesa è vuota</p>
                    <button id="emptyListGenerateBtn" class="btn">
                        <i class="fas fa-sync-alt"></i> Genera dalla settimana corrente
                    </button>
                `;
                
                // Aggiungi event listener al bottone
                shoppingListContainer.appendChild(emptyEl);
                document.getElementById('emptyListGenerateBtn').addEventListener('click', () => {
                    this.openWeekSelectionModal();
                });
            }
        } catch (error) {
            console.error('Errore nel rendering della lista della spesa:', error);
        }
    }

    /**
     * Apre il modal per aggiungere un prodotto personalizzato
     */
    openAddItemModal() {
        try {
            const modal = document.getElementById('add-item-modal');
            if (!modal) {
                console.error('Modal aggiunta prodotto non trovato');
                return;
            }
            
            modal.style.display = 'block';
            
            // Resetta i campi
            const itemNameInput = document.getElementById('itemNameInput');
            const itemQuantityInput = document.getElementById('itemQuantityInput');
            const itemCategorySelect = document.getElementById('itemCategorySelect');
            
            if (itemNameInput) itemNameInput.value = '';
            if (itemQuantityInput) itemQuantityInput.value = '1';
            if (itemCategorySelect) itemCategorySelect.selectedIndex = 0;
        } catch (error) {
            console.error('Errore nell\'apertura del modal di aggiunta prodotto:', error);
        }
    }

    /**
     * Aggiunge un prodotto personalizzato alla lista della spesa
     */
    addCustomItem() {
        try {
            const itemNameInput = document.getElementById('itemNameInput');
            const itemQuantityInput = document.getElementById('itemQuantityInput');
            const itemCategorySelect = document.getElementById('itemCategorySelect');
            
            if (!itemNameInput || !itemQuantityInput || !itemCategorySelect) {
                console.error('Campi del form non trovati');
                return;
            }
            
            const itemName = itemNameInput.value.trim();
            const itemQuantity = parseInt(itemQuantityInput.value) || 1;
            const itemCategory = itemCategorySelect.value;
            
            if (!itemName) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Inserisci un nome per il prodotto' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Ottieni la lista della spesa esistente
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            // Inizializza la categoria se non esiste
            if (!shoppingList[itemCategory]) {
                shoppingList[itemCategory] = {};
            }
            
            // Aggiungi o aggiorna il prodotto
            if (shoppingList[itemCategory][itemName]) {
                // Se esiste già, chiedi conferma per aggiornarlo
                if (confirm(`Il prodotto "${itemName}" esiste già. Aggiornare la quantità?`)) {
                    shoppingList[itemCategory][itemName].quantity = itemQuantity;
                } else {
                    return;
                }
            } else {
                // Altrimenti aggiungi nuovo prodotto
                shoppingList[itemCategory][itemName] = {
                    quantity: itemQuantity,
                    completed: false
                };
            }
            
            // Salva la lista aggiornata
            this.app.storageManager.setData('shoppingList', shoppingList);
            
            // Chiudi il modal
            if (typeof this.app.closeAllModals === 'function') {
                this.app.closeAllModals();
            } else {
                const modal = document.getElementById('add-item-modal');
                if (modal) modal.style.display = 'none';
            }
            
            // Aggiorna la UI
            this.renderShoppingList();
            
            // Feedback
            const event = new CustomEvent('showToast', {
                detail: { message: `Prodotto "${itemName}" aggiunto` }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Errore nell\'aggiunta del prodotto personalizzato:', error);
        }
    }

    /**
     * Aggiorna la quantità di un prodotto
     * @param {string} categoryKey - Chiave della categoria
     * @param {string} itemName - Nome del prodotto
     * @param {number} quantity - Nuova quantità
     */
    updateItemQuantity(categoryKey, itemName, quantity) {
        try {
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            if (shoppingList[categoryKey] && shoppingList[categoryKey][itemName]) {
                // Assicurati che la quantità sia almeno 1
                const newQuantity = Math.max(1, quantity);
                
                // Aggiorna la quantità
                shoppingList[categoryKey][itemName].quantity = newQuantity;
                
                // Salva la lista aggiornata
                this.app.storageManager.setData('shoppingList', shoppingList);
            }
        } catch (error) {
            console.error('Errore nell\'aggiornamento della quantità:', error);
        }
    }

    /**
     * Toggle dello stato di completamento di un prodotto
     * @param {string} categoryKey - Chiave della categoria
     * @param {string} itemName - Nome del prodotto
     */
    toggleItemCompletion(categoryKey, itemName) {
        try {
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            if (shoppingList[categoryKey] && shoppingList[categoryKey][itemName]) {
                // Toggle stato completamento
                shoppingList[categoryKey][itemName].completed = !shoppingList[categoryKey][itemName].completed;
                
                // Salva la lista aggiornata
                this.app.storageManager.setData('shoppingList', shoppingList);
                
                // Aggiorna UI
                this.renderShoppingList();
            }
        } catch (error) {
            console.error('Errore nel cambio stato completamento:', error);
        }
    }

    /**
     * Rimuove un prodotto dalla lista della spesa
     * @param {string} categoryKey - Chiave della categoria
     * @param {string} itemName - Nome del prodotto
     */
    removeShoppingItem(categoryKey, itemName) {
        try {
            // Conferma prima di eliminare
            if (!confirm(`Sei sicuro di voler rimuovere "${itemName}" dalla lista della spesa?`)) {
                return;
            }
            
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            if (shoppingList[categoryKey] && shoppingList[categoryKey][itemName]) {
                // Rimuovi il prodotto
                delete shoppingList[categoryKey][itemName];
                
                // Salva la lista aggiornata
                this.app.storageManager.setData('shoppingList', shoppingList);
                
                // Aggiorna UI
                this.renderShoppingList();
                
                // Feedback
                const event = new CustomEvent('showToast', {
                    detail: { message: `Prodotto "${itemName}" rimosso` }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Errore nella rimozione del prodotto:', error);
        }
    }

    /**
     * Resetta tutti gli stati di completamento nella lista
     */
    resetCompletionStatus() {
        try {
            const shoppingList = this.app.storageManager.getData('shoppingList') || {};
            
            if (confirm('Sei sicuro di voler reimpostare lo stato di completamento di tutti i prodotti?')) {
                // Reimposta tutti gli stati a false
                for (const categoryKey in shoppingList) {
                    for (const itemName in shoppingList[categoryKey]) {
                        shoppingList[categoryKey][itemName].completed = false;
                    }
                }
                
                // Salva la lista aggiornata
                this.app.storageManager.setData('shoppingList', shoppingList);
                
                // Aggiorna UI
                this.renderShoppingList();
                
                // Feedback
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Stati di completamento reimpostati' }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Errore nel reset degli stati di completamento:', error);
        }
    }
}

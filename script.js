/**
 * Meal Planner App
 * Applicazione per la pianificazione settimanale dei pasti e la gestione della lista della spesa
 */

// Importa i moduli
import { APP_VERSION } from './constants.js';
import { StorageManager } from './storage-manager.js';
import { WeeklyMenuManager } from './weekly-menu-manager.js';
import { FoodCategoriesManager } from './food-categories-manager.js';
import { ShoppingListManager } from './shopping-list-manager.js';
import { UIManager } from './ui-manager.js';

/**
 * Classe principale dell'applicazione
 */
class MealPlannerApp {
    /**
     * Costruttore
     */
    constructor() {
        // Versione dell'app
        this.appVersion = APP_VERSION;
        
        // Stato applicazione
        this.currentTab = 'menu';  // 'menu' o 'shopping'
        this.currentView = 'week'; // 'week' o 'day'
        this.selectedDay = 0;      // 0 = Lunedì, 6 = Domenica
        this.selectedMeal = null;  // Pasto corrente selezionato
        this.selectedFoods = [];   // Alimenti selezionati nel selettore
        
        // Inizializza gestori
        this.storageManager = new StorageManager();
        this.uiManager = new UIManager(this);
        this.weeklyMenuManager = new WeeklyMenuManager(this);
        this.foodCategoriesManager = new FoodCategoriesManager(this);
        this.shoppingListManager = new ShoppingListManager(this);
        
        // Carica i dati iniziali
        this.storageManager.loadInitialData();
        
        // Inizializza la settimana corrente
        this.weeklyMenuManager.setCurrentWeek();
        
        // Inizializza la UI
        this.initApp();
    }

    /**
     * Inizializza l'applicazione
     */
    initApp() {
        try {
            // Configura i tab di navigazione principale
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;
                    this.switchTab(tabId);
                });
            });
            
            // Configura i bottoni per il cambio vista menu
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    this.switchView(view);
                });
            });
            
            // Configura la navigazione settimanale
            document.getElementById('prevWeekBtn').addEventListener('click', () => {
                this.weeklyMenuManager.navigateWeek(-1);
            });
            
            document.getElementById('nextWeekBtn').addEventListener('click', () => {
                this.weeklyMenuManager.navigateWeek(1);
            });
            
            document.getElementById('cloneWeekBtn').addEventListener('click', () => {
                this.weeklyMenuManager.openCloneWeekModal();
            });
            
            document.getElementById('confirmCloneBtn').addEventListener('click', () => {
                this.weeklyMenuManager.cloneWeek();
            });
            
            // Configura i tab del giorno nella vista giornaliera
            document.querySelectorAll('.day-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const day = parseInt(tab.dataset.day);
                    this.switchDay(day);
                });
            });
            
            // Configura le celle dei pasti nella vista settimanale
            document.querySelectorAll('.meal-cell').forEach(cell => {
                cell.addEventListener('click', () => {
                    const day = parseInt(cell.dataset.day);
                    const meal = cell.dataset.meal;
                    this.openFoodSelector(day, meal);
                });
            });
            
            // Configura i bottoni per aggiungere alimenti nella vista giornaliera
            document.querySelectorAll('.add-food-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const meal = btn.dataset.meal;
                    this.openFoodSelector(this.selectedDay, meal);
                });
            });
            
            // Configura il selettore di categorie alimentari
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const category = tab.dataset.category;
                    this.foodCategoriesManager.switchFoodCategory(category);
                });
            });
            
            // Configura l'aggiunta di alimenti personalizzati
            document.getElementById('addCustomFoodBtn').addEventListener('click', () => {
                this.foodCategoriesManager.addCustomFood();
            });
            
            // Premi invio per aggiungere alimento personalizzato
            document.getElementById('customFoodInput').addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.foodCategoriesManager.addCustomFood();
                }
            });
            
            // Conferma selezione alimenti
            document.getElementById('confirmFoodSelection').addEventListener('click', () => {
                this.confirmFoodSelection();
            });
            
            // Lista della spesa
            document.getElementById('generateListBtn').addEventListener('click', () => {
                this.shoppingListManager.openWeekSelectionModal();
            });
            
            document.getElementById('addCustomItemBtn').addEventListener('click', () => {
                this.shoppingListManager.openAddItemModal();
            });
            
            document.getElementById('confirmAddItemBtn').addEventListener('click', () => {
                this.shoppingListManager.addCustomItem();
            });
            
            // Import/Export
            document.getElementById('copyExportBtn').addEventListener('click', () => {
                this.storageManager.copyExportData();
            });
            
            document.getElementById('downloadExportBtn').addEventListener('click', () => {
                this.storageManager.downloadExportData();
            });
            
            document.getElementById('selectFileBtn').addEventListener('click', () => {
                document.getElementById('importFile').click();
            });
            
            document.getElementById('importFile').addEventListener('change', (e) => {
                this.storageManager.handleFileSelect(e);
            });
            
            document.getElementById('importDataBtn').addEventListener('click', () => {
                this.storageManager.importData();
            });
            
            // Tab Import/Export
            document.querySelectorAll('.import-export-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.import-export-tab').forEach(t => {
                        t.classList.toggle('active', t === tab);
                    });
                    
                    const tabId = tab.dataset.tab;
                    document.querySelectorAll('.tab-panel').forEach(panel => {
                        panel.classList.toggle('active', panel.id === `${tabId}-content`);
                    });
                });
            });
            
            // Bottone FAB
            document.getElementById('fab').addEventListener('click', () => {
                if (this.currentTab === 'menu') {
                    if (this.currentView === 'week') {
                        // In vista settimanale apre il selettore per Lunedì pranzo
                        this.openFoodSelector(0, 'pranzo');
                    } else {
                        // In vista giornaliera apre il selettore per il pasto pranzo
                        this.openFoodSelector(this.selectedDay, 'pranzo');
                    }
                } else {
                    // Nella scheda lista spesa aggiunge un nuovo articolo
                    this.shoppingListManager.openAddItemModal();
                }
            });
            
            // Chiusura modali
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeAllModals();
                });
            });
            
            // Chiusura modal al click fuori
            window.addEventListener('click', (e) => {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            });
            
            // Chiusura modal con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
            
            // Aggiorna la UI
            this.render();
            
            // Aggiorna lo stile CSS per i bottoni di eliminazione
            this.uiManager.updateFoodChoiceStyles();
            
        } catch (error) {
            console.error('Errore nell\'inizializzazione dell\'app:', error);
        }
    }

    /**
     * Cambia il tab attivo
     * @param {string} tabId - ID del tab da attivare
     */
    switchTab(tabId) {
        try {
            if (this.currentTab === tabId) return;
            
            this.currentTab = tabId;
            
            // Aggiorna UI tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabId);
            });
            
            // Aggiorna sezioni
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.toggle('active', section.id === `${tabId}-section`);
            });
            
            // Se passato alla tab della lista della spesa, renderizza
            if (tabId === 'shopping') {
                this.shoppingListManager.renderShoppingList();
            }
        } catch (error) {
            console.error('Errore nel cambio tab:', error);
        }
    }

    /**
     * Cambia la vista nel tab menu
     * @param {string} view - Vista da attivare ('week' o 'day')
     */
    switchView(view) {
        try {
            if (this.currentView === view) return;
            
            this.currentView = view;
            
            // Aggiorna UI bottoni vista
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            
            // Aggiorna viste
            document.querySelectorAll('.meal-view').forEach(viewEl => {
                viewEl.classList.toggle('active', viewEl.id === `${view}-view`);
            });
            
            // Se passato a vista giorno, aggiorna
            if (view === 'day') {
                // Se è la prima volta, imposta il giorno selezionato a Lunedì
                if (this.selectedDay === null) {
                    this.selectedDay = 0;
                }
                
                // Aggiorna l'UI
                this.weeklyMenuManager.renderDailyMenu();
                
                // Attiva il tab del giorno corretto
                document.querySelectorAll('.day-tab').forEach((tab, index) => {
                    tab.classList.toggle('active', parseInt(tab.dataset.day) === this.selectedDay);
                });
            }
        } catch (error) {
            console.error('Errore nel cambio vista:', error);
        }
    }

    /**
     * Cambia il giorno selezionato nella vista giornaliera
     * @param {number} day - Indice del giorno (0 = Lunedì, 6 = Domenica)
     */
    switchDay(day) {
        try {
            if (this.selectedDay === day) return;
            
            this.selectedDay = day;
            
            // Aggiorna UI
            this.weeklyMenuManager.renderDailyMenu();
        } catch (error) {
            console.error('Errore nel cambio giorno:', error);
        }
    }

    /**
     * Apre il selettore di alimenti
     * @param {number} day - Indice del giorno
     * @param {string} meal - Tipo di pasto
     */
    openFoodSelector(day, meal) {
        try {
            this.selectedDay = day;
            this.selectedMeal = meal;
            
            // Resetta la selezione
            this.selectedFoods = [];
            
            // Ottieni alimenti già selezionati per questo pasto
            const weekData = this.storageManager.getData(`weeklyMenus.${this.weeklyMenuManager.currentWeekKey}`) || {};
            if (weekData[day] && weekData[day][meal] && Array.isArray(weekData[day][meal])) {
                this.selectedFoods = [...weekData[day][meal]];
            }
            
            // Reset input alimento personalizzato
            const customFoodInput = document.getElementById('customFoodInput');
            if (customFoodInput) {
                customFoodInput.value = '';
            }
            
            // Imposta la categoria default
            this.foodCategoriesManager.switchFoodCategory('proteins');
            
            // Mostra il modal
            const modal = document.getElementById('food-selector-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Errore nell\'apertura del selettore alimenti:', error);
        }
    }

    /**
     * Conferma la selezione degli alimenti nel modal
     */
    confirmFoodSelection() {
        try {
            // Salva gli alimenti selezionati
            this.weeklyMenuManager.saveMealFoods(this.selectedDay, this.selectedMeal, this.selectedFoods);
            
            // Aggiorna UI
            this.weeklyMenuManager.renderWeeklyMenu();
            if (this.currentView === 'day') {
                this.weeklyMenuManager.renderDailyMenu();
            }
            
            // Chiudi il modal
            this.closeAllModals();
            
            // Feedback
            const event = new CustomEvent('showToast', {
                detail: { message: 'Alimenti salvati' }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Errore nella conferma della selezione alimenti:', error);
        }
    }

    /**
     * Apre il modal di import/export
     */
    openImportExportModal() {
        try {
            const modal = document.getElementById('import-export-modal');
            if (!modal) {
                console.error('Modal import/export non trovato');
                return;
            }
            
            // Mostra i dati per l'export
            const exportDataEl = document.getElementById('exportData');
            if (exportDataEl) {
                exportDataEl.value = this.storageManager.getExportData();
            }
            
            // Reset del campo import
            const importDataEl = document.getElementById('importData');
            if (importDataEl) {
                importDataEl.value = '';
            }
            
            // Reset del file input
            const importFileEl = document.getElementById('importFile');
            if (importFileEl) {
                importFileEl.value = '';
            }
            
            // Attiva il tab di export di default
            document.querySelectorAll('.import-export-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === 'export');
            });
            
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === 'export-content');
            });
            
            // Mostra il modal
            modal.style.display = 'block';
        } catch (error) {
            console.error('Errore nell\'apertura del modal import/export:', error);
        }
    }

    /**
     * Chiude tutti i modals
     */
    closeAllModals() {
        try {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        } catch (error) {
            console.error('Errore nella chiusura dei modali:', error);
        }
    }

    /**
     * Aggiorna la UI
     */
    render() {
        try {
            // Aggiorna il menu settimanale
            this.weeklyMenuManager.renderWeeklyMenu();
            
            if (this.currentView === 'day') {
                // Aggiorna la vista giornaliera se attiva
                this.weeklyMenuManager.renderDailyMenu();
            }
            
            if (this.currentTab === 'shopping') {
                // Aggiorna la lista della spesa se attiva
                this.shoppingListManager.renderShoppingList();
            }
        } catch (error) {
            console.error('Errore nel rendering dell\'app:', error);
        }
    }
}

// Attendi che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza l'app
    window.app = new MealPlannerApp();
});

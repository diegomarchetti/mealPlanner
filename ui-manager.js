/**
 * Meal Planner App - UI Manager
 * Gestione dell'interfaccia utente
 */

/**
 * Classe per la gestione dell'interfaccia utente
 */
export class UIManager {
    /**
     * Costruttore
     * @param {Object} app - Riferimento all'istanza principale dell'app
     */
    constructor(app) {
        this.app = app;
        this.setupEventListeners();
    }

    /**
     * Configura gli event listeners per la UI
     */
    setupEventListeners() {
        try {
            // Funzione di utilità per aggiungere event listener con controllo dell'elemento
            const addSafeEventListener = (selector, event, handler) => {
                const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
                if (element) {
                    element.addEventListener(event, handler);
                } else {
                    console.warn(`Elemento non trovato: ${selector}`);
                }
            };
            
            // Sidebar
            addSafeEventListener('#menuBtn', 'click', () => {
                this.openSidebar();
            });
            
            addSafeEventListener('#closeSidebarBtn', 'click', () => {
                this.closeSidebar();
            });
            
            addSafeEventListener('#overlay', 'click', () => {
                this.closeSidebar();
            });
            
            // Bottoni sidebar
            addSafeEventListener('#sidebarImportExportBtn', 'click', () => {
                this.closeSidebar();
                this.app.openImportExportModal();
            });
            
            addSafeEventListener('#sidebarHelpBtn', 'click', () => {
                this.closeSidebar();
                this.openHelpModal();
            });
            
            addSafeEventListener('#sidebarAboutBtn', 'click', () => {
                this.closeSidebar();
                this.openAboutModal();
            });
            
            // Eventi custom
            document.addEventListener('showToast', (e) => {
                if (e.detail && e.detail.message) {
                    this.showToast(e.detail.message, e.detail.duration);
                }
            });
            
        } catch (error) {
            console.error('Errore nell\'inizializzazione degli eventi UI:', error);
        }
    }

    /**
     * Mostra un toast con messaggio
     * @param {string} message - Messaggio da mostrare
     * @param {number} duration - Durata in millisecondi (default: 3000ms)
     */
    showToast(message, duration = 3000) {
        try {
            const toast = document.getElementById('toast');
            if (!toast) {
                console.error('Elemento toast non trovato');
                return;
            }
            
            // Interrompi eventuali animazioni in corso
            clearTimeout(this.toastTimeout);
            toast.classList.remove('show');
            
            // Aggiorna il messaggio e mostra il toast
            toast.textContent = message;
            
            // Trick per far ripartire l'animazione
            void toast.offsetWidth;
            toast.classList.add('show');
            
            // Imposta il timeout per nascondere il toast
            this.toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        } catch (error) {
            console.error('Errore nella visualizzazione del toast:', error);
        }
    }

    /**
     * Apre la sidebar
     */
    openSidebar() {
        try {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            
            if (sidebar && overlay) {
                sidebar.classList.add('open');
                overlay.classList.add('show');
            }
        } catch (error) {
            console.error('Errore nell\'apertura della sidebar:', error);
        }
    }

    /**
     * Chiude la sidebar
     */
    closeSidebar() {
        try {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            
            if (sidebar && overlay) {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            }
        } catch (error) {
            console.error('Errore nella chiusura della sidebar:', error);
        }
    }

    /**
     * Apre il modal di aiuto
     */
    openHelpModal() {
        try {
            const modal = document.getElementById('help-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Errore nell\'apertura del modal di aiuto:', error);
        }
    }

    /**
     * Apre il modal about
     */
    openAboutModal() {
        try {
            const modal = document.getElementById('about-modal');
            if (modal) {
                // Aggiorna la versione dell'app
                const versionEl = modal.querySelector('h3');
                if (versionEl && this.app.appVersion) {
                    versionEl.textContent = `Meal Planner v${this.app.appVersion}`;
                }
                
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Errore nell\'apertura del modal about:', error);
        }
    }

    /**
     * Aggiorna lo stile CSS degli elementi food-choice nel selettore alimenti
     * per aggiungere il bottone di eliminazione
     */
    updateFoodChoiceStyles() {
        try {
            // Controlla se esiste già lo stile
            const styleId = 'food-choice-styles';
            if (document.getElementById(styleId)) {
                return;
            }
            
            // Crea l'elemento style
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .food-choice {
                    position: relative;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .food-choice-content {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .food-choice-text {
                    flex: 1;
                    text-align: center;
                }
                
                .delete-food-btn {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.1);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .food-choice:hover .delete-food-btn {
                    opacity: 1;
                }
                
                .delete-food-btn:hover {
                    background-color: var(--error);
                    color: white;
                }
                
                .food-icon {
                    margin-right: 4px;
                }
                
                .empty-category {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 20px;
                    color: var(--text-secondary);
                }
                
                .empty-list {
                    text-align: center;
                    padding: 30px;
                    background-color: var(--card-background);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-light);
                }
                
                .empty-list p {
                    margin-bottom: 16px;
                    color: var(--text-secondary);
                }
                
                .category-counter {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                    margin-left: 8px;
                }
                
                .shopping-category.collapsed .category-items {
                    display: none;
                }
                
                .delete-item-btn {
                    color: var(--text-secondary);
                    transition: color 0.2s;
                }
                
                .delete-item-btn:hover {
                    color: var(--error);
                }
            `;
            
            // Aggiungi lo stile al document
            document.head.appendChild(style);
        } catch (error) {
            console.error('Errore nell\'aggiornamento degli stili CSS:', error);
        }
    }
}

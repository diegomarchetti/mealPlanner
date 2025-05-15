/**
 * Meal Planner App - Weekly Menu Manager
 * Gestione dei menu settimanali
 */

import { DAYS, DAY_COLORS, getFoodCategoryIcon } from './constants.js';

/**
 * Classe per la gestione dei menu settimanali
 */
export class WeeklyMenuManager {
    /**
     * Costruttore
     * @param {Object} app - Riferimento all'istanza principale dell'app
     */
    constructor(app) {
        this.app = app;
        this.currentWeekKey = '';
        this.weekOffset = 0;
        this.weekStartDate = null;
        this.weekEndDate = null;
    }

    /**
     * Imposta la settimana corrente
     * @param {Date} [referenceDate=null] - Data di riferimento opzionale, altrimenti usa il weekOffset
     */
    setCurrentWeek(referenceDate = null) {
        try {
            // Calcola la chiave della settimana corrente considerando l'offset o la data di riferimento
            let now;
            if (referenceDate) {
                now = new Date(referenceDate);
            } else {
                now = new Date();
                now.setDate(now.getDate() + (this.weekOffset * 7));
            }
            
            const year = now.getFullYear();
            const weekNumber = this.getWeekNumber(now);
            
            this.currentWeekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
            
            // Calcola le date di inizio e fine della settimana
            const weekDates = this.getWeekDates(now);
            this.weekStartDate = weekDates.start;
            this.weekEndDate = weekDates.end;
            
            this.updateWeekNumber();
        } catch (error) {
            console.error('Errore nell\'impostazione della settimana corrente:', error);
        }
    }

    /**
     * Calcola il numero della settimana (ISO)
     * @param {Date} date - Data di riferimento
     * @returns {number} Numero della settimana
     */
    getWeekNumber(date) {
        try {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        } catch (error) {
            console.error('Errore nel calcolo del numero della settimana:', error);
            return 1; // Default alla prima settimana in caso di errore
        }
    }

    /**
     * Aggiorna l'indicatore del numero settimana
     */
    updateWeekNumber() {
        try {
            const weekNumberEl = document.getElementById('weekNumber');
            if (!weekNumberEl) return;
            
            // Estrai il numero della settimana dalla chiave (es. "2025-W20" -> "20")
            const weekNum = this.currentWeekKey.split('W')[1];
            
            if (this.weekStartDate && this.weekEndDate) {
                // Formatta le date in italiano
                const startDateFormatted = this.formatDate(this.weekStartDate);
                const endDateFormatted = this.formatDate(this.weekEndDate);
                
                // Imposta il testo con il nuovo formato
                weekNumberEl.textContent = `Settimana: ${weekNum} - dal ${startDateFormatted} al ${endDateFormatted}`;
            } else {
                weekNumberEl.textContent = this.currentWeekKey;
            }
            
            // Aggiorna anche il titolo della settimana nel modal di clonazione
            const targetWeekEl = document.getElementById('targetWeek');
            if (targetWeekEl) {
                if (this.weekStartDate && this.weekEndDate) {
                    const startDateFormatted = this.formatDate(this.weekStartDate);
                    const endDateFormatted = this.formatDate(this.weekEndDate);
                    targetWeekEl.textContent = `${this.currentWeekKey} (${startDateFormatted} - ${endDateFormatted})`;
                } else {
                    targetWeekEl.textContent = this.currentWeekKey;
                }
            }
        } catch (error) {
            console.error('Errore nell\'aggiornamento del numero della settimana:', error);
        }
    }

    /**
     * Formatta la data in formato italiano (dd/mm/yyyy)
     * @param {Date} date - Data da formattare
     * @returns {string} Data formattata
     */
    formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    /**
     * Calcola le date di inizio e fine della settimana ISO
     * @param {Date} date - Data di riferimento
     * @returns {Object} Oggetto con date di inizio e fine settimana
     */
    getWeekDates(date) {
        try {
            // Calcola l'inizio della settimana (lunedì)
            const startDate = new Date(date);
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Corregge per domenica
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0); // Inizio giornata
            
            // Calcola la fine della settimana (domenica)
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999); // Fine giornata
            
            return { start: startDate, end: endDate };
        } catch (error) {
            console.error('Errore nel calcolo delle date della settimana:', error);
            return { start: new Date(), end: new Date() };
        }
    }

    /**
     * Naviga tra le settimane
     * @param {number} direction - Direzione della navigazione (-1 indietro, 1 avanti)
     */
    navigateWeek(direction) {
        try {
            this.weekOffset += direction;
            this.setCurrentWeek();
            this.renderWeeklyMenu();
        } catch (error) {
            console.error('Errore nella navigazione tra settimane:', error);
        }
    }

    /**
     * Apre il modal per clonare una settimana
     */
    openCloneWeekModal() {
        try {
            const modal = document.getElementById('clone-week-modal');
            if (!modal) {
                console.error('Modal di clonazione non trovato');
                return;
            }
            
            modal.style.display = 'block';
            
            // Prepara la lista delle settimane disponibili
            const sourceWeekSelect = document.getElementById('sourceWeekSelect');
            if (!sourceWeekSelect) {
                console.error('Select delle settimane da clonare non trovato');
                return;
            }
            
            sourceWeekSelect.innerHTML = '';
            
            // Ottieni tutte le settimane salvate
            const weeklyMenus = this.app.storageManager.getData('weeklyMenus') || {};
            const weeks = Object.keys(weeklyMenus).sort().reverse();
            
            // Filtra la settimana corrente
            const otherWeeks = weeks.filter(week => week !== this.currentWeekKey);
            
            if (otherWeeks.length === 0) {
                sourceWeekSelect.innerHTML = '<option value="">Nessuna settimana disponibile</option>';
            } else {
                otherWeeks.forEach(week => {
                    try {
                        // Calcola le date della settimana per una visualizzazione più user-friendly
                        let weekDatesInfo = '';
                        
                        // Estrai anno e numero settimana (es. "2025-W20" -> anno=2025, weekNum=20)
                        const yearWeekMatch = week.match(/(\d{4})-W(\d{2})/);
                        if (yearWeekMatch) {
                            const year = parseInt(yearWeekMatch[1]);
                            const weekNum = parseInt(yearWeekMatch[2]);
                            
                            // Crea una data che rappresenta il primo giorno dell'anno
                            const firstDayOfYear = new Date(year, 0, 1);
                            
                            // Calcola il primo giorno della settimana (algoritmo approssimativo)
                            const approximateDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
                            
                            // Ottieni le date effettive della settimana
                            const weekDates = this.getWeekDates(approximateDate);
                            
                            // Formatta le date
                            const startFormatted = this.formatDate(weekDates.start);
                            const endFormatted = this.formatDate(weekDates.end);
                            
                            weekDatesInfo = ` (${startFormatted} - ${endFormatted})`;
                        }
                        
                        const option = document.createElement('option');
                        option.value = week;
                        option.textContent = `${week}${weekDatesInfo}`;
                        sourceWeekSelect.appendChild(option);
                    } catch (err) {
                        console.error(`Errore nella visualizzazione della settimana ${week}:`, err);
                        const option = document.createElement('option');
                        option.value = week;
                        option.textContent = week;
                        sourceWeekSelect.appendChild(option);
                    }
                });
            }
            
            // Mostra la settimana di destinazione
            const targetWeekEl = document.getElementById('targetWeek');
            if (targetWeekEl) {
                if (this.weekStartDate && this.weekEndDate) {
                    const startDateFormatted = this.formatDate(this.weekStartDate);
                    const endDateFormatted = this.formatDate(this.weekEndDate);
                    targetWeekEl.textContent = `${this.currentWeekKey} (${startDateFormatted} - ${endDateFormatted})`;
                } else {
                    targetWeekEl.textContent = this.currentWeekKey;
                }
            }
        } catch (error) {
            console.error('Errore nell\'apertura del modal di clonazione:', error);
            
            // Mostra un messaggio di errore all'utente
            const event = new CustomEvent('showToast', {
                detail: { message: 'Errore nell\'apertura del modal di clonazione' }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Clona una settimana
     */
    cloneWeek() {
        try {
            const sourceWeekSelect = document.getElementById('sourceWeekSelect');
            if (!sourceWeekSelect) {
                console.error('Select delle settimane da clonare non trovato');
                return;
            }
            
            const sourceWeek = sourceWeekSelect.value;
            
            if (!sourceWeek) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Seleziona una settimana valida' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Ottieni i dati della settimana di origine
            const weeklyMenus = this.app.storageManager.getData('weeklyMenus') || {};
            const sourceData = weeklyMenus[sourceWeek];
            
            if (!sourceData) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Dati della settimana di origine non trovati' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Clona i dati nella settimana corrente
            weeklyMenus[this.currentWeekKey] = JSON.parse(JSON.stringify(sourceData));
            
            // Salva i dati
            this.app.storageManager.setData('weeklyMenus', weeklyMenus);
            
            // Aggiorna UI
            this.renderWeeklyMenu();
            if (this.app.currentView === 'day') {
                this.renderDailyMenu();
            }
            
            // Chiudi il modal
            if (typeof this.app.closeAllModals === 'function') {
                this.app.closeAllModals();
            } else {
                const modal = document.getElementById('clone-week-modal');
                if (modal) modal.style.display = 'none';
            }
            
            // Feedback
            const event = new CustomEvent('showToast', {
                detail: { message: `Settimana ${sourceWeek} clonata con successo!` }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Errore nella clonazione della settimana:', error);
            
            // Feedback di errore
            const event = new CustomEvent('showToast', {
                detail: { message: 'Errore nella clonazione della settimana' }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Render del menu settimanale
     */
    renderWeeklyMenu() {
        try {
            const weekData = this.app.storageManager.getData(`weeklyMenus.${this.currentWeekKey}`) || {};
            
            // Aggiorna tutte le celle dei pasti
            document.querySelectorAll('.meal-cell').forEach(cell => {
                const day = parseInt(cell.dataset.day);
                const meal = cell.dataset.meal;
                
                // Svuota la cella
                cell.innerHTML = '';
                
                // Verifica se ci sono alimenti
                if (weekData[day] && weekData[day][meal] && weekData[day][meal].length > 0) {
                    // Crea elementi per ogni alimento
                    weekData[day][meal].forEach(food => {
                        const foodEl = document.createElement('div');
                        foodEl.className = 'food-item';
                        
                        // Aggiungi icona della categoria
                        const foodIcon = document.createElement('span');
                        foodIcon.className = 'food-icon';
                        foodIcon.textContent = `${getFoodCategoryIcon(food)} `;
                        foodEl.appendChild(foodIcon);
                        
                        const foodText = document.createElement('span');
                        foodText.textContent = food;
                        foodEl.appendChild(foodText);
                        
                        cell.appendChild(foodEl);
                    });
                } else {
                    // Cella vuota con prompt
                    cell.innerHTML = '<div class="empty-cell">+ Aggiungi</div>';
                }
            });
        } catch (error) {
            console.error('Errore nel rendering del menu settimanale:', error);
        }
    }

    /**
     * Render del menu giornaliero
     */
    renderDailyMenu() {
        try {
            const weekData = this.app.storageManager.getData(`weeklyMenus.${this.currentWeekKey}`) || {};
            const dayData = weekData[this.app.selectedDay] || {};
            
            // Aggiorna la visualizzazione del giorno selezionato
            document.querySelectorAll('.day-tab').forEach((tab, index) => {
                tab.classList.toggle('active', parseInt(tab.dataset.day) === this.app.selectedDay);
            });
            
            // Aggiorna i contenitori dei pasti
            const meals = ['colazione', 'pranzo', 'spuntino', 'cena'];
            meals.forEach(meal => {
                const containerEl = document.getElementById(`day-${meal}`);
                if (!containerEl) return;
                
                containerEl.innerHTML = '';
                
                if (dayData[meal] && dayData[meal].length > 0) {
                    // Crea elementi per ogni alimento
                    dayData[meal].forEach(food => {
                        const foodEl = document.createElement('div');
                        foodEl.className = 'food-item';
                        
                        // Aggiungi icona della categoria
                        const foodIcon = document.createElement('span');
                        foodIcon.className = 'food-icon';
                        foodIcon.textContent = `${getFoodCategoryIcon(food)} `;
                        foodEl.appendChild(foodIcon);
                        
                        const foodText = document.createElement('span');
                        foodText.textContent = food;
                        foodEl.appendChild(foodText);
                        
                        // Aggiungi bottone per rimuovere l'alimento
                        const removeBtn = document.createElement('button');
                        removeBtn.innerHTML = '&times;';
                        removeBtn.addEventListener('click', e => {
                            e.stopPropagation();
                            this.removeFoodFromMeal(this.app.selectedDay, meal, food);
                        });
                        foodEl.appendChild(removeBtn);
                        
                        containerEl.appendChild(foodEl);
                    });
                } else {
                    containerEl.innerHTML = '<div class="empty-meal">Nessun alimento selezionato</div>';
                }
            });
        } catch (error) {
            console.error('Errore nel rendering del menu giornaliero:', error);
        }
    }

    /**
     * Rimuove un alimento da un pasto
     * @param {number} day - Giorno (indice)
     * @param {string} meal - Tipo di pasto
     * @param {string} food - Nome dell'alimento da rimuovere
     */
    removeFoodFromMeal(day, meal, food) {
        try {
            const weekData = this.app.storageManager.getData(`weeklyMenus.${this.currentWeekKey}`) || {};
            
            if (weekData[day] && weekData[day][meal]) {
                // Filtra l'alimento da rimuovere
                weekData[day][meal] = weekData[day][meal].filter(f => f !== food);
                
                // Salva i dati aggiornati
                this.app.storageManager.setData(`weeklyMenus.${this.currentWeekKey}`, weekData);
                
                // Aggiorna UI
                this.renderDailyMenu();
                this.renderWeeklyMenu();
                
                // Feedback
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Alimento rimosso' }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('Errore nella rimozione dell\'alimento:', error);
        }
    }

    /**
     * Salva gli alimenti per un pasto
     * @param {number} day - Giorno (indice)
     * @param {string} meal - Tipo di pasto
     * @param {Array} foods - Array di alimenti
     */
    saveMealFoods(day, meal, foods) {
        try {
            const weekData = this.app.storageManager.getData(`weeklyMenus.${this.currentWeekKey}`) || {};
            
            // Inizializza gli oggetti se non esistono
            if (!weekData[day]) weekData[day] = {};
            
            // Salva gli alimenti
            weekData[day][meal] = [...foods];
            
            // Salva nel localStorage
            this.app.storageManager.setData(`weeklyMenus.${this.currentWeekKey}`, weekData);
        } catch (error) {
            console.error('Errore nel salvataggio degli alimenti:', error);
        }
    }
    
    /**
     * Recupera le settimane disponibili con menu
     * @returns {Array} Array di oggetti settimana con chiave e date
     */
    getAvailableWeeks() {
        try {
            const weeklyMenus = this.app.storageManager.getData('weeklyMenus') || {};
            const weeks = Object.keys(weeklyMenus).sort();
            
            return weeks.map(weekKey => {
                try {
                    // Estrai anno e numero settimana
                    const yearWeekMatch = weekKey.match(/(\d{4})-W(\d{2})/);
                    if (yearWeekMatch) {
                        const year = parseInt(yearWeekMatch[1]);
                        const weekNum = parseInt(yearWeekMatch[2]);
                        
                        // Calcola una data approssimativa per questa settimana
                        const approximateDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
                        
                        // Ottieni le date effettive della settimana
                        const weekDates = this.getWeekDates(approximateDate);
                        
                        return {
                            key: weekKey,
                            startDate: weekDates.start,
                            endDate: weekDates.end,
                            startDateFormatted: this.formatDate(weekDates.start),
                            endDateFormatted: this.formatDate(weekDates.end),
                            displayName: `${weekKey} (${this.formatDate(weekDates.start)} - ${this.formatDate(weekDates.end)})`
                        };
                    } else {
                        return {
                            key: weekKey,
                            displayName: weekKey
                        };
                    }
                } catch (err) {
                    console.error(`Errore nell'elaborazione della settimana ${weekKey}:`, err);
                    return {
                        key: weekKey,
                        displayName: weekKey
                    };
                }
            });
        } catch (error) {
            console.error('Errore nel recupero delle settimane disponibili:', error);
            return [];
        }
    }
}

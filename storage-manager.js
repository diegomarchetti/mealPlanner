/**
 * Meal Planner App - Storage Manager
 * Gestione dello storage e delle operazioni di import/export
 */

import { STORAGE_PREFIX, APP_VERSION } from './constants.js';

/**
 * Classe per la gestione dello storage e delle operazioni di import/export
 */
export class StorageManager {
    constructor() {
        this.prefix = STORAGE_PREFIX;
    }

    /**
     * Carica i dati iniziali e crea dati di esempio se necessario
     */
    loadInitialData() {
        try {
            // Controlla se ci sono già dati salvati
            const hasData = localStorage.getItem(`${this.prefix}initialized`);
            
            if (!hasData) {
                console.log('Inizializzazione dati di esempio...');
                this.initializeExampleData();
                localStorage.setItem(`${this.prefix}initialized`, 'true');
                localStorage.setItem(`${this.prefix}version`, APP_VERSION);
            } else {
                console.log('Dati già presenti, caricamento...');
                // Verifica versione per eventuali migrazioni dati
                const version = localStorage.getItem(`${this.prefix}version`) || '1.0.0';
                if (version !== APP_VERSION) {
                    console.log(`Aggiornamento dati da versione ${version} a ${APP_VERSION}`);
                    this.migrateData(version, APP_VERSION);
                    localStorage.setItem(`${this.prefix}version`, APP_VERSION);
                }
            }
        } catch (error) {
            console.error('Errore nel caricamento dei dati iniziali:', error);
        }
    }

    /**
     * Inizializza dati di esempio
     */
    initializeExampleData() {
        try {
            // Ottieni la settimana corrente
            const now = new Date();
            const year = now.getFullYear();
            
            // Funzione per ottenere il numero della settimana ISO
            const getWeekNumber = (d) => {
                const date = new Date(d.getTime());
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                const week1 = new Date(date.getFullYear(), 0, 4);
                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
            };
            
            const weekNum = getWeekNumber(now);
            const weekKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;
            
            // Menu settimanale di esempio
            const weeklyMenuExample = {
                [weekKey]: {
                    // Lunedì
                    0: {
                        pranzo: ['Riso basmati', 'Petto di pollo', 'Zucchine'],
                        spuntino: ['Skyr', 'Frutti di bosco', 'Mandorle'],
                        cena: ['Petto di pollo', 'Quinoa', 'Zucchine']
                    },
                    // Martedì
                    1: {
                        pranzo: ['Pasta integrale', 'Hamburger magri', 'Insalata mista'],
                        spuntino: ['Barrette proteiche', 'Mele'],
                        cena: ['Filetto di merluzzo', 'Patate dolci', 'Spinaci']
                    },
                    // Mercoledì
                    2: {
                        pranzo: ['Farro', 'Tonno al naturale', 'Pomodori'],
                        spuntino: ['Yogurt greco naturale', 'Pere', 'Noci'],
                        cena: ['Uova', 'Pane integrale', 'Insalata mista']
                    }
                    // Altri giorni verranno aggiunti dinamicamente dall'utente
                }
            };
            
            // Alimenti personalizzati di esempio
            const customFoodsExample = {
                proteins: ['Salmone affumicato'],
                vegetables: ['Carciofi'],
                fruits: ['Kaki']
            };
            
            // Lista della spesa di esempio
            const shoppingListExample = {
                proteins: {
                    'Petto di pollo': { quantity: 3, completed: false },
                    'Tonno al naturale': { quantity: 2, completed: false }
                },
                cereals: {
                    'Riso basmati': { quantity: 1, completed: false },
                    'Quinoa': { quantity: 1, completed: false },
                    'Pasta integrale': { quantity: 1, completed: false }
                },
                vegetables: {
                    'Zucchine': { quantity: 2, completed: false },
                    'Insalata mista': { quantity: 1, completed: false },
                    'Spinaci': { quantity: 1, completed: false }
                }
            };
            
            // Salva i dati di esempio
            this.setData('weeklyMenus', weeklyMenuExample);
            this.setData('customFoods', customFoodsExample);
            this.setData('shoppingList', shoppingListExample);
            
        } catch (error) {
            console.error('Errore nell\'inizializzazione dei dati di esempio:', error);
        }
    }

    /**
     * Migra i dati tra versioni dell'applicazione
     * @param {string} fromVersion - Versione di origine
     * @param {string} toVersion - Versione di destinazione
     */
    migrateData(fromVersion, toVersion) {
        console.log(`Migrazione dati da ${fromVersion} a ${toVersion}`);
        
        // Implementa qui eventuali migrazioni specifiche tra versioni
        if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
            // Esempio: migrazione da 1.0.0 a 1.1.0
            console.log('Migrazione da 1.0.0 a 1.1.0');
            
            // Qui andrebbe codice specifico per la migrazione
        }
    }

    /**
     * Ottiene un valore dallo storage
     * @param {string} key - Chiave del dato da recuperare, può contenere notazione a punti per oggetti nidificati
     * @returns {*} Il valore recuperato o undefined se non esiste
     */
    getData(key) {
        try {
            // Supporto per chiavi annidate con notazione a punti (es. 'weeklyMenus.2025-W20')
            const parts = key.split('.');
            const mainKey = parts[0];
            
            // Recupera il dato principale
            const data = localStorage.getItem(`${this.prefix}${mainKey}`);
            if (!data) return undefined;
            
            const parsedData = JSON.parse(data);
            
            // Se la chiave non ha parti annidate, restituisci direttamente il dato
            if (parts.length === 1) return parsedData;
            
            // Altrimenti naviga nell'oggetto per recuperare il dato annidato
            let result = parsedData;
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (result === undefined || result === null) return undefined;
                result = result[part];
            }
            
            return result;
        } catch (error) {
            console.error(`Errore nel recupero dati per la chiave ${key}:`, error);
            return undefined;
        }
    }

    /**
     * Salva un valore nello storage
     * @param {string} key - Chiave del dato da salvare, può contenere notazione a punti per oggetti nidificati
     * @param {*} value - Il valore da salvare
     */
    setData(key, value) {
        try {
            // Supporto per chiavi annidate con notazione a punti (es. 'weeklyMenus.2025-W20')
            const parts = key.split('.');
            const mainKey = parts[0];
            
            // Se la chiave non ha parti annidate, salva direttamente il dato
            if (parts.length === 1) {
                localStorage.setItem(`${this.prefix}${mainKey}`, JSON.stringify(value));
                return;
            }
            
            // Altrimenti recupera l'oggetto principale, modifica e salva
            const data = this.getData(mainKey) || {};
            
            // Naviga nell'oggetto per trovare il punto giusto da modificare
            let current = data;
            for (let i = 1; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) current[part] = {};
                current = current[part];
            }
            
            // Imposta il valore
            current[parts[parts.length - 1]] = value;
            
            // Salva l'oggetto principale aggiornato
            localStorage.setItem(`${this.prefix}${mainKey}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Errore nel salvataggio dati per la chiave ${key}:`, error);
        }
    }

    /**
     * Rimuove un dato dallo storage
     * @param {string} key - Chiave del dato da rimuovere
     */
    removeData(key) {
        try {
            localStorage.removeItem(`${this.prefix}${key}`);
        } catch (error) {
            console.error(`Errore nella rimozione dati per la chiave ${key}:`, error);
        }
    }

    /**
     * Cancella tutti i dati dell'applicazione
     */
    clearAllData() {
        try {
            // Recupera e rimuove solo le chiavi dell'applicazione (con il prefisso)
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log('Tutti i dati cancellati');
        } catch (error) {
            console.error('Errore nella cancellazione di tutti i dati:', error);
        }
    }

    /**
     * Ottiene i dati per l'export
     * @returns {string} Dati JSON formattati
     */
    getExportData() {
        try {
            // Recupera tutte le chiavi dell'applicazione
            const exportData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    const shortKey = key.substring(this.prefix.length);
                    try {
                        exportData[shortKey] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        exportData[shortKey] = localStorage.getItem(key);
                    }
                }
            }
            
            return JSON.stringify(exportData, null, 2); // Formattato per leggibilità
        } catch (error) {
            console.error('Errore nella generazione dei dati di export:', error);
            return '';
        }
    }

    /**
     * Copia i dati di export negli appunti
     */
    copyExportData() {
        try {
            const exportData = this.getExportData();
            navigator.clipboard.writeText(exportData)
                .then(() => {
                    const event = new CustomEvent('showToast', {
                        detail: { message: 'Dati copiati negli appunti!' }
                    });
                    document.dispatchEvent(event);
                })
                .catch(err => {
                    console.error('Impossibile copiare negli appunti:', err);
                    const event = new CustomEvent('showToast', {
                        detail: { message: 'Errore nella copia dei dati' }
                    });
                    document.dispatchEvent(event);
                });
        } catch (error) {
            console.error('Errore nella copia dei dati:', error);
        }
    }

    /**
     * Scarica i dati di export come file
     */
    downloadExportData() {
        try {
            const exportData = this.getExportData();
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `meal-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
            
            const event = new CustomEvent('showToast', {
                detail: { message: 'File scaricato!' }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Errore nel download dei dati:', error);
        }
    }

    /**
     * Gestisce la selezione del file di import
     * @param {Event} event - Evento di selezione file
     */
    handleFileSelect(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importTextarea = document.getElementById('importData');
                    if (importTextarea) {
                        importTextarea.value = e.target.result;
                    }
                } catch (err) {
                    console.error('Errore nella lettura del file:', err);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Errore nella selezione del file:', error);
        }
    }

    /**
     * Importa i dati dal textarea
     */
    importData() {
        try {
            const importTextarea = document.getElementById('importData');
            if (!importTextarea || !importTextarea.value.trim()) {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Nessun dato da importare' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            const importedData = JSON.parse(importTextarea.value);
            
            // Verifica la validità dei dati
            if (!importedData || typeof importedData !== 'object') {
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Formato dati non valido' }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Conferma prima di sovrascrivere
            if (confirm('Questa operazione sovrascriverà i dati esistenti. Continuare?')) {
                // Rimuovi dati esistenti
                this.clearAllData();
                
                // Importa i nuovi dati
                for (const key in importedData) {
                    localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(importedData[key]));
                }
                
                const event = new CustomEvent('showToast', {
                    detail: { message: 'Dati importati con successo! La pagina verrà ricaricata.' }
                });
                document.dispatchEvent(event);
                
                // Ricarica la pagina dopo un breve delay
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('Errore nell\'importazione dei dati:', error);
            const event = new CustomEvent('showToast', {
                detail: { message: 'Errore nell\'importazione dei dati' }
            });
            document.dispatchEvent(event);
        }
    }
}

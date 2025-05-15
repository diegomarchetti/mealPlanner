/**
 * Meal Planner App - Constants
 * Costanti e configurazioni dell'applicazione
 */

// Costanti generali
export const STORAGE_PREFIX = 'mealplanner_';
export const MEALS = ['colazione', 'pranzo', 'spuntino', 'cena'];
export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const DAY_COLORS = ['🟩', '🟦', '🟥', '🟨', '🟪', '🟧', '⬛'];

// Categorie alimentari con i relativi alimenti predefiniti
export const FOOD_CATEGORIES = {
    proteins: {
        icon: '🥩',
        name: 'Proteine',
        foods: [
            'Petto di pollo', 'Tacchino a fette', 'Uova', 'Filetto di salmone', 
            'Filetto di merluzzo', 'Filetto di orata', 'Tonno al naturale', 
            'Hamburger magri', 'Tofu', 'Seitan', 'Legumi cotti'
        ]
    },
    dairy: {
        icon: '🥛',
        name: 'Latticini',
        foods: [
            'Skyr', 'Yogurt greco naturale', 'Ricotta magra', 'Latte scremato', 
            'Parmigiano Reggiano', 'Fiocchi di latte', 'Mozzarella light', 
            'Formaggio spalmabile light'
        ]
    },
    supplements: {
        icon: '🧪',
        name: 'Integratori',
        foods: [
            'Barrette proteiche', 'Proteine in polvere', 'Aminoacidi', 
            'Creatina', 'Multivitaminico', 'Omega-3'
        ]
    },
    nuts: {
        icon: '🥜',
        name: 'Frutta secca',
        foods: [
            'Mandorle', 'Noci', 'Nocciole', 'Anacardi', 'Pistacchi non salati', 
            'Semi di chia', 'Semi di lino', 'Semi di zucca', 'Semi di girasole', 
            'Burro di arachidi naturale', 'Cioccolato fondente 70%'
        ]
    },
    fruits: {
        icon: '🍌',
        name: 'Frutta fresca',
        foods: [
            'Mele', 'Banane', 'Kiwi', 'Arance', 'Mandarini', 'Frutti di bosco', 
            'Pere', 'Ananas', 'Mango', 'Uva', 'Melone', 'Anguria', 'Pesche', 'Albicocche'
        ]
    },
    vegetables: {
        icon: '🥗',
        name: 'Verdure',
        foods: [
            'Zucchine', 'Broccoli', 'Spinaci', 'Carote', 'Peperoni', 'Cetrioli', 
            'Pomodori', 'Melanzane', 'Cavolfiore', 'Verza', 'Insalata mista', 'Rucola', 
            'Radicchio', 'Finocchi', 'Asparagi', 'Zucca', 'Verdure grigliate miste', 'Patate dolci'
        ]
    },
    cereals: {
        icon: '🍞',
        name: 'Cereali e pane',
        foods: [
            'Riso basmati', 'Riso integrale', 'Quinoa', 'Couscous', 'Bulgur', 'Farro', 
            'Orzo', 'Avena', 'Pane integrale', 'Pane di segale', 'Fette biscottate integrali', 
            'Pasta integrale', 'Gallette di mais o riso'
        ]
    },
    other: {
        icon: '🛒',
        name: 'Altro',
        foods: []
    }
};

// Versione dell'applicazione
export const APP_VERSION = '1.1.0';

// Funzione per ottenere l'icona della categoria in base al nome dell'alimento
export function getFoodCategoryIcon(foodName) {
    // Cerca in tutte le categorie predefinite
    for (const categoryKey in FOOD_CATEGORIES) {
        if (FOOD_CATEGORIES[categoryKey].foods.includes(foodName)) {
            return FOOD_CATEGORIES[categoryKey].icon;
        }
    }
    
    // Se non trovato nelle liste predefinite, cerca nei cibi personalizzati
    const customFoods = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}customFoods`)) || {};
    for (const categoryKey in customFoods) {
        if (customFoods[categoryKey] && customFoods[categoryKey].includes(foodName)) {
            return FOOD_CATEGORIES[categoryKey]?.icon || '🛒';
        }
    }
    
    // Se non trovato da nessuna parte, usa l'icona di default
    return '🍽️';
}

// Funzione per ottenere il nome della categoria in base al nome dell'alimento
export function getFoodCategoryName(foodName) {
    // Cerca in tutte le categorie predefinite
    for (const categoryKey in FOOD_CATEGORIES) {
        if (FOOD_CATEGORIES[categoryKey].foods.includes(foodName)) {
            return FOOD_CATEGORIES[categoryKey].name;
        }
    }
    
    // Se non trovato nelle liste predefinite, cerca nei cibi personalizzati
    const customFoods = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}customFoods`)) || {};
    for (const categoryKey in customFoods) {
        if (customFoods[categoryKey] && customFoods[categoryKey].includes(foodName)) {
            return FOOD_CATEGORIES[categoryKey]?.name || 'Altro';
        }
    }
    
    // Se non trovato da nessuna parte, usa il nome di default
    return 'Non categorizzato';
}

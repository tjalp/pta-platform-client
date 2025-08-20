import { reactive } from 'vue';
import { THEME_CONFIG, STORAGE_KEYS } from '@/constants/index.js';

export default {
    install: (app) => {
        // Get theme preference from localStorage or system preference
        const getInitialTheme = () => {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME);
            if (stored !== null) {
                return stored === THEME_CONFIG.VALUES.DARK;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        };

        const prefersDarkScheme = getInitialTheme();
        const _appState = reactive({ 
            theme: 'Aura', 
            darkTheme: prefersDarkScheme 
        });
        
        const root = document.getElementsByTagName('html')[0];

        // Apply initial theme
        if (prefersDarkScheme) {
            root.classList.add(THEME_CONFIG.DARK_CLASS);
        } else {
            root.classList.remove(THEME_CONFIG.DARK_CLASS);
        }

        app.config.globalProperties.$appState = _appState;
    }
};
        
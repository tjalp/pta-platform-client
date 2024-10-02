import { reactive } from 'vue';

export default {
    install: (app) => {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const _appState = reactive({ theme: 'Aura', darkTheme: prefersDarkScheme });
        const root = document.getElementsByTagName('html')[0];

        if (prefersDarkScheme) {
            root.classList.add('p-dark');
        } else {
            root.classList.remove('p-dark');
        }

        app.config.globalProperties.$appState = _appState;
    }
};
        
import { reactive } from 'vue';

export default {
    install: (app) => {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const _appState = reactive({ theme: 'Aura', darkTheme: prefersDarkScheme });

        app.config.globalProperties.$appState = _appState;
    }
};
        
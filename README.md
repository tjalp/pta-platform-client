# PTA Platform (Client)

In deze repository vind je de client (website) van het PTA Platform, een platform voor het beheren van PTA's (Programma's van Toetsing en Afsluiting) voor middelbare scholen in Nederland.
Voor de server van het PTA Platform, zie de [pta-platform-server](../) repository en de bijbehorende [README.md](../README.md).

## Bouwen & Uitvoeren

De client is gebouwd met PNPM, [Vue 3](https://vuejs.org/guide/introduction.html) en [Vite](https://vite.dev/guide/). Zie hun documentatie voor meer informatie over het bouwen en uitvoeren van de client.
In een notendop:
- Installeer de dependencies met `pnpm install`.
- Start de development server met `pnpm dev`.
- Bouw de client voor productie met `pnpm build`.

Voor configuratie, zie de [Vite Configuration Reference](https://vitejs.dev/config/).

Er wordt aangeraden de client te draaien op een edge server, zoals [Cloudflare Pages](https://pages.cloudflare.com/), [Vercel](https://vercel.com/) of [Netlify](https://www.netlify.com/). Deze platforms bieden gratis hosting voor statische websites en hebben goede integraties met GitHub.

De volgende omgevingsvariabelen zijn beschikbaar:
- `VITE_API_HOST`: De URL van de API van het PTA Platform—de server dus. Deze is verplicht.
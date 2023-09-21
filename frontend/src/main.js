import "@fortawesome/fontawesome-pro/css/all.css";
import "vuetify/styles";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labsComponents from "vuetify/labs/components";

import { aliases, fa } from "vuetify/iconsets/fa";

import App from "./App.vue";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import router from "./router";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#0059a9",
          secondary: "#5CBBF6",
        },
      },
      light: {
        colors: {
          primary: "#0059a9",
          secondary: "#5CBBF6",
        },
      },
    },
  },
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  icons: {
    defaultSet: "fa",
    aliases,
    sets: {
      fa,
    },
  },
});

createApp(App).use(vuetify).use(router).mount("#app");

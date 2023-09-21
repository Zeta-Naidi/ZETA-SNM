/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

import { createVuetify } from 'vuetify'

// Composables


// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#186700',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  components: {
    ...components,
    ...labsComponents,
  },
})

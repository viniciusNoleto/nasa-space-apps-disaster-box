
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  ssr: false,

  // Styles
  css: [
    '~/assets/css/style.css',
  ],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    'nuxt-icon',
    'nuxt-lodash',
  ],

  lodash: {
    prefix: '_',
    prefixSkip: false,
    upperAfterPrefix: false,
  },
});

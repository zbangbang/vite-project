import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import cesium from 'vite-plugin-cesium'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsxPlugin(), cesium(), UnoCSS()],
  server: {
    port: 5900
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'src/components'),
      'styles': resolve(__dirname, 'src/styles'),
      'plugins': resolve(__dirname, 'src/plugins'),
      'views': resolve(__dirname, 'src/views'),
      'layouts': resolve(__dirname, 'src/layouts'),
      'utils': resolve(__dirname, 'src/utils'),
      'apis': resolve(__dirname, 'src/apis'),
      'hooks': resolve(__dirname, 'src/hooks')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variable.scss";'
      }
    }
  }
})

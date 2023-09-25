import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    host:'192.168.66.16',
    port: 5173,
    proxy:{
      '/api' :{
        target: 'http://localhost:3000/',
        changeOrigin: true,
      }
    }
  },
  base: '/dessert-shop/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "./src/style.scss";`
  //     }
  //   }
  // },
})
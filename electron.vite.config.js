

import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@fortawesome/react-fontawesome': '@fortawesome/react-fontawesome',
        path: require.resolve('path-browserify')  
      }
    },
    publicDir: 'src/assets',
    plugins: [react()],
    server: {
      port: 5050, 
      strictPort: true
    }
    // server: {
    //   proxy: {
    //     '/index.php': {
    //       target: 'https://backend.expressbild.org',
    //       changeOrigin: true,
    //       secure: false,
    //       rewrite: (path) => path.replace(/^\/index.php/, '/index.php')
    //     }
    //   }
    // }
  }
})

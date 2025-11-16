import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    plugins: [vue()],
    root: path.resolve(__dirname),
    build: {
        outDir: path.resolve(__dirname, '../public'),
        emptyOutDir: true
    },
    server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
            '/api': `http://localhost:${process.env.PORT || 8080}`
        }
    }
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.png', 'screenshots/*.png'],
            manifest: {
                name: 'ParkingSmart — простая парковка во дворе',
                short_name: 'ParkingSmart',
                description: 'Находите контакты водителей, которые могут блокировать выезд',
                theme_color: '#007AFF',
                background_color: '#F2F2F7',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        host: true,
        port: 8080,
        strictPort: true
    }
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['src/__test__/setup.ts'],
        include: ['src/__test__/**/*.test.tsx'],
    },
});

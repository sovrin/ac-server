import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'lcov'],
        },
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts'],
        typecheck: {
            enabled: true,
            include: ['src/**/*.test.ts'],
        },
    },
});

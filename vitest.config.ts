import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            reporter: ['text', 'html', 'lcov'],
            provider: 'istanbul',
        },
        typecheck: {
            enabled: true,
            include: ['src/**/*.test.ts'],
        },
        include: ['src/**/*.test.ts'],
    },
});

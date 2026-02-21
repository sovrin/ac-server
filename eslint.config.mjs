import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default tsEslint.config({
    files: ['src/**/*.ts'],
    extends: [eslint.configs.recommended, ...tsEslint.configs.recommended],
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
    },
});

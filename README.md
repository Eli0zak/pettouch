# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/44c63ac2-ec26-4e95-a6b7-80532cc003c4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/44c63ac2-ec26-4e95-a6b7-80532cc003c4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/44c63ac2-ec26-4e95-a6b7-80532cc003c4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Translation Key Management

The application includes a comprehensive translation key management system to help maintain multilingual support. The following features are available:

### Debug Mode

A translation debugging tool is available in development mode that helps identify missing or problematic translation keys:

- Shows missing translation keys in real-time
- Highlights keys that are using fallback translations
- Allows exporting missing keys for easy addition to translation files

To enable debug mode:

1. Click the language icon in the bottom right corner of the application
2. Toggle the "Debug Mode" switch
3. Missing translations will be highlighted with brackets: [key]

### Translation Scripts

Several utility scripts are available to help manage translations:

- **Check Translations**: Identifies missing keys between language files
  ```
  npm run check-translations
  ```

- **Extract Translations**: Scans the codebase for translation keys
  ```
  npm run i18n:extract
  ```

- **Debug Mode**: Runs the application with translation debugging enabled
  ```
  npm run i18n:debug
  ```

### Development Workflow

When adding new features or components:

1. Use the `t('key')` function for all user-facing text
2. Run `npm run i18n:extract` to extract all keys
3. Add the new keys to all language files
4. Run `npm run check-translations` to verify all languages have the necessary keys
5. Use the TranslationDebugger component during development to identify missing translations

### Utilities

The `src/utils/i18nUtils.ts` file contains helper functions for working with translations:

- `mergeTranslationKeys`: Merges translation keys from different sources
- `sortTranslationKeys`: Sorts translation keys alphabetically
- `findMissingTranslationKeys`: Identifies keys missing from a translation file
- `findEmptyTranslations`: Finds keys with empty values
- `groupTranslationsByNamespace`: Groups keys by their namespace
- `flattenTranslations`: Flattens a nested translation object

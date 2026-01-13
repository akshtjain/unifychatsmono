// Extension Configuration
// This file is the single source of truth for environment settings
// DO NOT edit this directly for production - build.sh handles it automatically

const CONFIG = {
  DEV_MODE: true,
  get WEBSITE_URL() {
    return this.DEV_MODE ? 'http://localhost:3000' : 'https://unifychats.app';
  }
};

// For content scripts (they can't import modules)
if (typeof window !== 'undefined') {
  window.EXTENSION_CONFIG = CONFIG;
}

import { initTheme, getStoredTheme, setStoredTheme } from './modules/theme.js'
import { initNav } from './modules/nav.js'
import { initMobileMenu } from './modules/menu.js'
import { initLangToggle, restorePersistedLanguage } from './modules/lang.js'
import { initHeroSlider } from './modules/heroSlider.js'
import { initFooter } from './modules/footer.js'

// Registered once, before Alpine processes any x-data on the page — the
// header's desktop and mobile theme dropdowns are two separate x-data
// scopes, so a shared store (rather than each reading localStorage
// independently) is what keeps them showing the same active mode. The store
// itself survives every wire:navigate for free: Alpine never reboots across
// SPA transitions, only specific DOM elements outside @persist do.
document.addEventListener('alpine:init', () => {
  window.Alpine.store('theme', {
    current: getStoredTheme(),
    set(mode) {
      this.current = mode
      setStoredTheme(mode)
    },
  })
})

function mountApp() {
  initTheme()
  initNav()
  initMobileMenu()
  initLangToggle()
  restorePersistedLanguage()
  initHeroSlider()
  initFooter()
}

mountApp()


document.addEventListener('livewire:navigated', mountApp)

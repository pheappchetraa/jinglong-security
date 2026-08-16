import { initTheme } from './modules/theme.js'
import { initNav } from './modules/nav.js'
import { initMobileMenu } from './modules/menu.js'
import { initLangToggle } from './modules/lang.js'
import { initHeroSlider } from './modules/heroSlider.js'
import { initFooter } from './modules/footer.js'

function mountApp() {
  initTheme()
  initNav()
  initMobileMenu()
  initLangToggle()
  initHeroSlider()
  initFooter()
}

mountApp()


document.addEventListener('livewire:navigated', mountApp)

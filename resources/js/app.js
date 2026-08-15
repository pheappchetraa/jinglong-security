import { initTheme } from './theme.js'
import { initNav } from './nav.js'
import { initMobileMenu } from './menu.js'
import { initLangToggle } from './lang.js'
import { initHeroSlider } from './heroSlider.js'
import { initFooter } from './footer.js'

function mountApp() {
  initTheme()
  initNav()
  initMobileMenu()
  initLangToggle(mountApp)
  initHeroSlider()
  initFooter()
}

mountApp()

const TARGET_LANGUAGE = 'en'

let widgetReady = null
let originalHtml = null
let globalListenersAttached = false

function loadTranslateWidget() {
  if (widgetReady) return widgetReady

  widgetReady = new Promise((resolve) => {
    const container = document.createElement('div')
    container.id = 'google_translate_element'
    container.className = 'hidden'
    document.body.appendChild(container)

    window.initGoogleTranslate = () => {
      // eslint-disable-next-line no-undef
      new google.translate.TranslateElement(
        { pageLanguage: 'km', includedLanguages: TARGET_LANGUAGE, autoDisplay: false },
        'google_translate_element',
      )

      const waitForSelect = () => {
        const select = document.querySelector('.goog-te-combo')
        if (select) {
          resolve(select)
        } else {
          setTimeout(waitForSelect, 100)
        }
      }
      waitForSelect()
    }

    const script = document.createElement('script')
    script.src = 'https://translate.google.com/translate_a/element.js?cb=initGoogleTranslate'
    document.body.appendChild(script)
  })

  return widgetReady
}

// Restoring via Google's own combo (value "") is unreliable and can be slow,
// so we keep our own snapshot of the original Khmer markup and swap it back
// locally instead — instant, no network round trip.
function restoreOriginal(mountApp) {
  const app = document.getElementById('app')
  app.innerHTML = originalHtml
  document.documentElement.classList.remove('translated-ltr', 'translated-rtl')
  document.documentElement.removeAttribute('translate')
  mountApp()
}

function setMenuOpen(wrapper, isOpen) {
  const button = wrapper.querySelector('[data-lang-toggle]')
  const menu = wrapper.querySelector('[data-lang-menu]')
  menu.classList.toggle('opacity-0', !isOpen)
  menu.classList.toggle('scale-95', !isOpen)
  menu.classList.toggle('pointer-events-none', !isOpen)
  menu.classList.toggle('opacity-100', isOpen)
  menu.classList.toggle('scale-100', isOpen)
  button.setAttribute('aria-expanded', String(isOpen))
}

// Queries the live DOM rather than a captured NodeList so this keeps working
// after restoreOriginal() replaces #app's markup wholesale.
function closeAllLangDropdowns() {
  document.querySelectorAll('[data-lang-dropdown]').forEach((wrapper) => setMenuOpen(wrapper, false))
}

export function initLangToggle(mountApp) {
  const wrappers = document.querySelectorAll('[data-lang-dropdown]')
  if (wrappers.length === 0) return

  if (originalHtml === null) {
    originalHtml = document.getElementById('app').innerHTML
  }

  let isEnglish = false

  const updateUI = () => {
    document.querySelectorAll('[data-lang-label]').forEach((label) => {
      label.textContent = isEnglish ? 'EN' : 'ខ្មែរ'
    })
    document.querySelectorAll('[data-lang-check-en]').forEach((check) => check.classList.toggle('hidden', !isEnglish))
    document.querySelectorAll('[data-lang-check-km]').forEach((check) => check.classList.toggle('hidden', isEnglish))
  }

  wrappers.forEach((wrapper) => {
    const button = wrapper.querySelector('[data-lang-toggle]')

    button.addEventListener('click', (e) => {
      e.stopPropagation()
      const menu = wrapper.querySelector('[data-lang-menu]')
      const isOpen = menu.classList.contains('opacity-100')
      closeAllLangDropdowns()
      setMenuOpen(wrapper, !isOpen)
    })

    wrapper.querySelectorAll('[data-lang-option]').forEach((option) => {
      option.addEventListener('click', async () => {
        const wantsEnglish = option.getAttribute('data-lang-option') === 'en'
        closeAllLangDropdowns()

        if (wantsEnglish === isEnglish) return

        if (!wantsEnglish) {
          restoreOriginal(mountApp)
          return
        }

        button.disabled = true
        const select = await loadTranslateWidget()
        select.value = TARGET_LANGUAGE
        select.dispatchEvent(new Event('change'))
        isEnglish = true
        updateUI()
        button.disabled = false
      })
    })
  })

  if (!globalListenersAttached) {
    globalListenersAttached = true
    document.addEventListener('click', closeAllLangDropdowns)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllLangDropdowns()
    })
  }

  updateUI()
}
const TARGET_LANGUAGE = 'en'
const WIDGET_LOAD_TIMEOUT_MS = 8000

let widgetReady = null
let globalListenersAttached = false
let isEnglish = false

function loadTranslateWidget() {
  if (widgetReady) return widgetReady

  widgetReady = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Google Translate widget timed out')), WIDGET_LOAD_TIMEOUT_MS)

    const container = document.createElement('div')
    container.id = 'google_translate_element'
    container.className = 'hidden'
    document.body.appendChild(container)

    window.initGoogleTranslate = () => {
      try {
        // eslint-disable-next-line no-undef
        new google.translate.TranslateElement(
          { pageLanguage: 'km', includedLanguages: TARGET_LANGUAGE, autoDisplay: false },
          'google_translate_element',
        )
      } catch (err) {
        clearTimeout(timer)
        reject(err)
        return
      }

      const waitForSelect = () => {
        const select = document.querySelector('.goog-te-combo')
        if (select) {
          clearTimeout(timer)
          resolve(select)
        } else {
          setTimeout(waitForSelect, 100)
        }
      }
      waitForSelect()
    }

    const script = document.createElement('script')
    script.src = 'https://translate.google.com/translate_a/element.js?cb=initGoogleTranslate'
    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Google Translate script failed to load'))
    }
    document.body.appendChild(script)
  })

  widgetReady.catch(() => {
    // Let the next attempt retry from scratch instead of replaying a dead promise.
    widgetReady = null
  })

  return widgetReady
}

// Google Translate rewrites text nodes in place, which conflicts with
// Livewire's morph-based navigation (it walks the DOM expecting the shape it
// last rendered). Rather than fight that, we force a real full-page
// navigation while translated — Livewire boots fresh on the next page and
// the desync/crash never has a chance to happen.
function interceptNavigationWhileTranslated(e) {
  if (!isEnglish) return
  const destination = e.detail && e.detail.url
  if (!destination) return
  e.preventDefault()
  window.location.href = destination.href
}

// A full reload guarantees Livewire's component registry, the DOM, and
// Google's translate state all come back in sync — far safer than trying to
// manually splice the original markup back into a Livewire-managed root.
function restoreOriginal() {
  window.location.reload()
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
// even after Google Translate rewrites surrounding markup.
function closeAllLangDropdowns() {
  document.querySelectorAll('[data-lang-dropdown]').forEach((wrapper) => setMenuOpen(wrapper, false))
}

export function initLangToggle() {
  const wrappers = document.querySelectorAll('[data-lang-dropdown]')
  if (wrappers.length === 0) return

  // Header is persisted across wire:navigate, so its dropdown is already
  // wired up from the initial mount — re-running here would create a fresh
  // closure and stomp the real (persisted) state when updateUI() runs below.
  // Skip entirely once bound.
  const unboundWrappers = Array.from(wrappers).filter(
    (wrapper) => !wrapper.querySelector('[data-lang-toggle]').dataset.langBound,
  )
  if (unboundWrappers.length === 0) return

  const updateUI = () => {
    document.querySelectorAll('[data-lang-label]').forEach((label) => {
      label.textContent = isEnglish ? 'EN' : 'ខ្មែរ'
    })
    document.querySelectorAll('[data-lang-check-en]').forEach((check) => check.classList.toggle('hidden', !isEnglish))
    document.querySelectorAll('[data-lang-check-km]').forEach((check) => check.classList.toggle('hidden', isEnglish))
  }

  unboundWrappers.forEach((wrapper) => {
    const button = wrapper.querySelector('[data-lang-toggle]')
    button.dataset.langBound = 'true'

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
          restoreOriginal()
          return
        }

        button.disabled = true
        try {
          const select = await loadTranslateWidget()
          select.value = TARGET_LANGUAGE
          select.dispatchEvent(new Event('change'))
          isEnglish = true
          updateUI()
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Language switch failed, staying in Khmer.', err)
          isEnglish = false
          updateUI()
        } finally {
          button.disabled = false
        }
      })
    })
  })

  if (!globalListenersAttached) {
    globalListenersAttached = true
    document.addEventListener('click', closeAllLangDropdowns)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllLangDropdowns()
    })
    document.addEventListener('alpine:navigate', interceptNavigationWhileTranslated)
  }

  updateUI()
}

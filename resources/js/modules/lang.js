const TARGET_LANGUAGE = 'en'
const WIDGET_LOAD_TIMEOUT_MS = 8000
const LANG_STORAGE_KEY = 'lang'

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

      // MutationObserver reacts the instant Google's script inserts the
      // <select>, instead of a fixed-interval poll racking up forced
      // style/layout recalcs on slower mobile CPUs while it waits.
      const existing = container.querySelector('.goog-te-combo')
      if (existing) {
        clearTimeout(timer)
        resolve(existing)
      } else {
        const observer = new MutationObserver(() => {
          const select = container.querySelector('.goog-te-combo')
          if (select) {
            observer.disconnect()
            clearTimeout(timer)
            resolve(select)
          }
        })
        observer.observe(container, { childList: true, subtree: true })
      }
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

// Kicks off the script download + widget init ahead of any tap, so the
// actual switch later just flips the already-ready <select> instead of
// paying for network + init latency in the critical path. Safe to call
// repeatedly (loadTranslateWidget memoizes) and safe to ignore failures —
// a real switch attempt will retry and surface the error there.
export function preloadTranslateWidget() {
  loadTranslateWidget().catch(() => {})
}

// `overrideState`, when passed, paints ahead of the real `isEnglish` flag —
// used for the optimistic tap response below, so the label flips before the
// network/widget round trip finishes instead of after.
function updateUI(overrideState) {
  const state = overrideState ?? isEnglish
  document.querySelectorAll('[data-lang-label]').forEach((label) => {
    label.textContent = state ? 'EN' : 'ខ្មែរ'
  })
  document.querySelectorAll('[data-lang-check-en]').forEach((check) => check.classList.toggle('hidden', !state))
  document.querySelectorAll('[data-lang-check-km]').forEach((check) => check.classList.toggle('hidden', state))
}

// Shared by the dropdown click handler and the post-navigation auto-restore
// path below, so a stored English preference is re-applied the exact same
// way a manual click would apply it.
async function activateEnglish() {
  const select = await loadTranslateWidget()
  select.value = TARGET_LANGUAGE
  select.dispatchEvent(new Event('change'))
  isEnglish = true
  updateUI()
}

// Google Translate rewrites text nodes in place, which conflicts with
// Livewire's morph-based navigation (it walks the DOM expecting the shape it
// last rendered). Rather than fight that, we force a real full-page
// navigation while translated — Livewire boots fresh on the next page and
// the desync/crash never has a chance to happen. localStorage is what makes
// the choice survive that reload (see restorePersistedLanguage below).
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
  localStorage.setItem(LANG_STORAGE_KEY, 'km')
  window.location.reload()
}

// Runs on every real page load (including the reload triggered above) so an
// English preference survives navigation even though the DOM itself can't be
// carried across a full reload. Safe to call on every livewire:navigated too
// — it's a no-op once already translated, and translated pages never reach
// livewire:navigated anyway since interceptNavigationWhileTranslated forces
// a hard reload before Livewire's SPA swap can run.
export function restorePersistedLanguage() {
  if (isEnglish) return
  if (localStorage.getItem(LANG_STORAGE_KEY) !== 'en') return

  activateEnglish().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Could not restore English after navigation, staying in Khmer.', err)
    localStorage.setItem(LANG_STORAGE_KEY, 'km')
  })
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

    // `pointerdown` fires ~100-300ms before `click` on touch devices. On a
    // cold widget that head start is spent on script download/init instead
    // of sitting in the tap's critical path (preloadTranslateWidget below
    // usually beats this via idle time, but this is the safety net for a
    // tap that lands before idle time ever ran).
    button.addEventListener('pointerdown', () => preloadTranslateWidget(), { passive: true })

    wrapper.querySelectorAll('[data-lang-option]').forEach((option) => {
      option.addEventListener('click', async () => {
        const wantsEnglish = option.getAttribute('data-lang-option') === 'en'
        closeAllLangDropdowns()

        if (wantsEnglish === isEnglish) return

        if (!wantsEnglish) {
          restoreOriginal()
          return
        }

        // Paint the switched state immediately so the tap feels instant;
        // activateEnglish() below reconciles this to the real state once
        // the (likely already-warm) widget actually confirms the switch.
        updateUI(true)
        button.disabled = true
        try {
          await activateEnglish()
          localStorage.setItem(LANG_STORAGE_KEY, 'en')
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

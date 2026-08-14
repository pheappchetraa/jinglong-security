const TARGET_LANGUAGE = 'en'

let widgetReady = null
let originalHtml = null

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

export function initLangToggle(mountApp) {
  const buttons = document.querySelectorAll('[data-lang-toggle]')
  if (buttons.length === 0) return

  if (originalHtml === null) {
    originalHtml = document.getElementById('app').innerHTML
  }

  let isEnglish = false

  const setLabel = () => {
    document.querySelectorAll('[data-lang-toggle] [data-lang-label]').forEach((label) => {
      label.textContent = isEnglish ? 'ខ្មែរ' : 'EN'
    })
  }

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true

      if (isEnglish) {
        restoreOriginal(mountApp)
        isEnglish = false
      } else {
        const select = await loadTranslateWidget()
        select.value = TARGET_LANGUAGE
        select.dispatchEvent(new Event('change'))
        isEnglish = true
        setLabel()
      }

      button.disabled = false
    })
  })
}

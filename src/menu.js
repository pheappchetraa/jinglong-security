export function initMobileMenu() {
  const toggleButton = document.getElementById('menu-toggle')
  const menu = document.getElementById('mobile-menu')
  const openIcon = document.getElementById('menu-icon-open')
  const closeIcon = document.getElementById('menu-icon-close')
  const desktopBreakpoint = window.matchMedia('(min-width: 768px)')

  const setOpen = (isOpen) => {
    menu.classList.toggle('hidden', !isOpen)
    menu.classList.toggle('flex', isOpen)
    openIcon.classList.toggle('hidden', isOpen)
    closeIcon.classList.toggle('hidden', !isOpen)
    toggleButton.setAttribute('aria-expanded', String(isOpen))
  }

  toggleButton.addEventListener('click', () => {
    setOpen(menu.classList.contains('hidden'))
  })

  menu.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  desktopBreakpoint.addEventListener('change', (e) => {
    if (e.matches) setOpen(false)
  })
}

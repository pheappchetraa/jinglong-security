export function initTheme() {
  const toggleButtons = document.querySelectorAll('[data-theme-toggle]')
  const moonIcons = document.querySelectorAll('[data-theme-icon-moon]')
  const sunIcons = document.querySelectorAll('[data-theme-icon-sun]')

  const applyIcon = (theme) => {
    moonIcons.forEach((icon) => icon.classList.toggle('hidden', theme !== 'dark'))
    sunIcons.forEach((icon) => icon.classList.toggle('hidden', theme === 'dark'))
  }

  applyIcon(document.documentElement.classList.contains('dark') ? 'dark' : 'light')

  toggleButtons.forEach((button) => {
    if (button.dataset.themeBound) return
    button.dataset.themeBound = 'true'

    button.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark')
      applyIcon(isDark ? 'dark' : 'light')
    })
  })
}

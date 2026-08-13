export function initTheme() {
  const toggleButton = document.getElementById('theme-toggle')
  const moonIcon = document.getElementById('theme-icon-moon')
  const sunIcon = document.getElementById('theme-icon-sun')

  const applyIcon = (theme) => {
    moonIcon.classList.toggle('hidden', theme !== 'dark')
    sunIcon.classList.toggle('hidden', theme === 'dark')
  }

  applyIcon(document.documentElement.classList.contains('dark') ? 'dark' : 'light')

  toggleButton.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark')
    const theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    applyIcon(theme)
  })
}

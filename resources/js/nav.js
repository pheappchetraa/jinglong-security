export function initNav() {
  const links = document.querySelectorAll('[data-nav-link]')
  const activeClasses = ['text-green-800', 'dark:text-white']
  const inactiveClasses = ['text-gray-600', 'hover:text-green-800', 'dark:text-gray-300', 'dark:hover:text-white']

  links.forEach((link) => {
    const isExact = link.hasAttribute('data-nav-exact')
    const linkPath = new URL(link.href).pathname
    const isActive = isExact ? linkPath === window.location.pathname : window.location.pathname.startsWith(linkPath)

    if (isActive) {
      link.classList.add(...activeClasses)
    } else {
      link.classList.add(...inactiveClasses)
    }
  })
}

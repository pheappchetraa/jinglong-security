import { companyEmail, companyPhone, gmailLink, telegramLink } from './config.js'

export function initFooter() {
  const emailLink = document.getElementById('footer-email-link')
  const emailText = document.getElementById('footer-email-text')
  const phoneLink = document.getElementById('footer-phone-link')
  const phoneText = document.getElementById('footer-phone-text')

  emailLink.href = gmailLink
  emailText.textContent = companyEmail
  phoneLink.href = telegramLink
  phoneText.textContent = companyPhone

  document.getElementById('footer-year').textContent = new Date().getFullYear()

  const form = document.getElementById('contact-form')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(form).entries())
    console.log('Contact request:', formData)
    form.reset()
  })
}

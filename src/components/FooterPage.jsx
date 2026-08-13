import React, { useState } from 'react'
import logo from '../assets/SJL Logo-01.png'

const companyEmail = 'info@jinglongsecurity.com'
const companyPhone = '+855 12 345 678'
const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${companyEmail}`
const telegramLink = `https://t.me/${companyPhone.replace(/[^\d+]/g, '')}`

const FooterPage = () => {
  const [formData, setFormData] = useState({ email: '', phone: '', address: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact request:', formData)
    setFormData({ email: '', phone: '', address: '' })
  }

  return (
    <footer className="border-t border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-3">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="JingLong Security" className="h-16 w-16 object-contain" />
          <span className="text-lg font-bold text-blue-900 dark:text-white">
            JingLong Security
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            សេវាកម្មសន្តិសុខសម្រាប់សហគមន៍
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <h3 className="text-lg font-bold text-blue-900 dark:text-white">ទំនាក់ទំនង</h3>

          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>
              អីមែល៖{' '}
              <a
                href={gmailLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-900 dark:hover:text-white"
              >
                {companyEmail}
              </a>
            </li>
            <li>
              លេខទូរស័ព្ទ៖{' '}
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-900 dark:hover:text-white"
              >
                {companyPhone}
              </a>
            </li>
            <li>អាស័យដ្ឋាន៖ ភ្នំពេញ, កម្ពុជា</li>
          </ul>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="អីមែលរបស់អ្នក"
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="លេខទូរស័ព្ទរបស់អ្នក"
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="អាស័យដ្ឋានរបស់អ្នក"
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
            >
              ផ្ញើសំណើ
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 text-center md:items-end md:text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">Design By Romdoul</span>
        </div>
      </div>
    </footer>
  )
}

export default FooterPage

import './globals.css'

export const metadata = {
  title: 'Data Entry Portal',
  description: 'Private secure data entry portal for the team',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

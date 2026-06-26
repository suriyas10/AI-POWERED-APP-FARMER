import './globals.css'

export const metadata = {
  title: 'Student Daily Planner',
  description: 'AI-powered task planner for students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

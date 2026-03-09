import './globals.css'

export const metadata = {
  title: '40th Years of Pharmacy RSU - แบบสำรวจ',
  description: 'แบบสำรวจความคิดเห็นงานครบรอบ 40 ปี เภสัชศาสตร์ มหาวิทยาลัยรังสิต',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}

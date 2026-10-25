import './globals.css';
import SiteHeader from '@/components/SiteHeader';

export const metadata = {
  title: 'InquiryDesk',
  description: 'Record, track and resolve customer inquiries in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
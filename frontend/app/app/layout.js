import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
});

export const metadata = {
  title: 'InquiryDesk',
  description: 'Record, track and resolve customer inquiries in one place.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
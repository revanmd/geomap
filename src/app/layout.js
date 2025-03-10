import localFont from "next/font/local";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { MessageProvider } from "@/context/messageContext";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <MessageProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </MessageProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

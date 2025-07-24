import localFont from "next/font/local";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { MessageProvider } from "@/context/messageContext";
import "./globals.css";
import { LoadingProvider } from "@/context/loadingContext";
import { UserProvider } from "@/context/userContext";
import { GpsProvider } from "@/context/gpsContext";
import MaintenanceModal from "@/components/MaintenanceModal";
import PamfletModal from "@/components/PamfletModal";

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
  title: "Feedback Geospatial",
  description: "Developed by DDS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="HandheldFriendly" content="true" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <LoadingProvider>
            <MessageProvider>
              <GpsProvider>
                <AntdRegistry>
                  {/* <MaintenanceModal /> */}
                  <PamfletModal />
                  {children}

                </AntdRegistry>
              </GpsProvider>
            </MessageProvider>
          </LoadingProvider>
        </UserProvider>
      </body>
    </html>
  );
}

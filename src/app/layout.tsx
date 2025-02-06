import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <div className="w-full font-bold h-20 flex items-center justify-center text-2xl"> Inventory System </div>
        {children}
      </body>
    </html>
  );
}

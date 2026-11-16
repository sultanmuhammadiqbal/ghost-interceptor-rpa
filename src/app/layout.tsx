import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost Interceptor: Audit DOM & Ketersediaan Produk E-Commerce",
  description:
    "Alat audit halaman produk e-commerce berbasis ekstraksi HTML DOM, variasi ukuran WooCommerce, dan verifikasi stok nyata.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0D0D0D] text-[#F5F5F5] font-sans antialiased selection:bg-[#FF5C00] selection:text-[#0D0D0D]">
        {children}
      </body>
    </html>
  );
}

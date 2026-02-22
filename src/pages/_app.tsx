import "../../src/styles/globals.css";
import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...restPageProps } = pageProps;
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAuthPage = router.pathname.startsWith('/auth');

  return (
    <SessionProvider session={session}>
      <Head>
        <title>KICKSTREET | Heat For Your Feet</title>
        <link rel="icon" href="/KickStreetLogo.png" type="image/png" />
        <link rel="shortcut icon" href="/KickStreetLogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/KickStreetLogo.png" />
        {/* Force viewport to prevent zooming and horizontal bleed */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" 
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      
      <CartProvider>
        {/* 🔔 TOAST NOTIFICATION: Global Responsive Implementation */}
        <Toaster 
          position="top-center" 
          containerStyle={{
            top: 20,
            left: 16, // Reduced margin for 320px screens
            right: 16,
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 4000,
            className: 'kickstreet-toast', // Hook for custom CSS if needed
            style: {
              background: '#000',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '10px', // Mobile-first font size
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '14px 20px',
              width: '100%',
              maxWidth: '350px', // Prevents desktop bloat while staying fluid on mobile
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#ea580c', // KickStreet Orange
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: '#000', // Keep brutalist black
                borderLeft: '4px solid #dc2626', // Use border for error accent
              }
            }
          }}
        />
        
        {/* 📱 GLOBAL WRAPPER: Enforcing strict mobile-first constraints */}
        <main className="antialiased selection:bg-orange-600 selection:text-white min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
          <Component {...restPageProps} />
          {!isAdminPage && !isAuthPage && <Footer />}
        </main>
      </CartProvider>
    </SessionProvider>
  );
}

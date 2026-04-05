import NavBar from "@/components/navbar";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "Query Jobs",
  description: "The best place to find jobs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            {children}
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}

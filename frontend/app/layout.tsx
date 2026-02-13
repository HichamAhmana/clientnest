import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { ApolloProviderWrapper } from "../components/providers/apollo-provider";
// import { MainLayoutShell } from "../components/layout/main-layout-shell"; // COMMENTED OUT

export const metadata: Metadata = {
  title: "ClientNest",
  description: "Client & invoice management for freelancers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ApolloProviderWrapper>
          {children}  {/* NO MainLayoutShell for testing */}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
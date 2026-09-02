import type { Metadata } from "next";
import "./globals.css";
import { AppInitializer } from "@/components/AppInitializer";
import { GlobalModals } from "@/components/GlobalModals";
export const metadata: Metadata = {
  title: "Winter Arc — Build yourself. One day at a time.",
  description: "A social self-improvement and goal-tracking platform with RPG progression, streaks, badges, and friendly competition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="snow-bg antialiased">
        <AppInitializer>
          {children}
          <GlobalModals />
        </AppInitializer>
      </body>
    </html>
  );
}

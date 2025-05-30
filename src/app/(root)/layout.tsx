export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* This is where shared UI for your main application (e.g., navigation, sidebar) will go */}
      {children}
    </div>
  );
}
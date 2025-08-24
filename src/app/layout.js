import StyledComponentsRegistry from "@/app/lib/registry";
import config from "@/config";

export const metadata = {
    title: config.title,
    description: config.description,
    icons: "/icon.png",
};

export const viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
};

export default function RootLayout({children}) {
    return (
        <html lang="chs">
        <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        {children}
        </body>
        </html>
    );
}

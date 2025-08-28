import StyledComponentsRegistry from "@/app/lib/registry";
import config from "@/config";
import 'sanitize.css'
import './app.scss'
import './main.scss'
import {DialogContainer} from "@/app/utils/DialogContainer";
import Script from "next/script";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "@/app/theme";

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
        {/* Google Analytics */}
        <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-BQJX3Y50XY"
            strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BQJX3Y50XY');
          `}
        </Script>
        <StyledComponentsRegistry>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </StyledComponentsRegistry>
        <DialogContainer/>
        </body>
        </html>
    );
}

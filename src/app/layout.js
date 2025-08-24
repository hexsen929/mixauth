import StyledComponentsRegistry from "@/app/lib/registry";
import config from "@/config";
import {Toaster} from "react-hot-toast";
import 'sanitize.css'
import './app.scss'
import './main.scss'

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
        <StyledComponentsRegistry>
            {children}
        </StyledComponentsRegistry>
        <Toaster/>
        </body>
        </html>
    );
}

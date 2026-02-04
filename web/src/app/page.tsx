"use client";

import { HeroSection } from "@/components/blocks/hero-section";
import { Icons } from "@/components/ui/icons";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeroSection
                badge={{
                    text: "Topluluk Destekli Dil Öğrenme",
                    action: {
                        text: "Kayıt Ol",
                        href: "/auth/register",
                    },
                }}
                title="lanXpert ile Dil Engelini Aşın"
                description="Yapay zeka ve topluluk gücüyle dilleri öğrenin. Sorular sorun, cevaplayın ve puan kazanın."
                actions={[
                    {
                        text: "Hemen Başla",
                        href: "/questions",
                        variant: "default",
                    },
                    {
                        text: "GitHub",
                        href: "https://github.com/lanxpert",
                        variant: "glow",
                        icon: <Icons.gitHub className="h-5 w-5" />,
                    },
                ]}
                image={{
                    light: "https://www.launchuicomponents.com/app-light.png", // Stand-in image
                    dark: "https://www.launchuicomponents.com/app-dark.png",
                    alt: "lanXpert Arayüz",
                }}
            />
        </div>
    );
}

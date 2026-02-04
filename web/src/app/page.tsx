import { HeroSection } from "@/components/blocks/hero-section";
import { Icons } from "@/components/ui/icons";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeroSection
                badge={user ? {
                    text: `Hoş geldin, ${user.email}`,
                    action: {
                        text: "Profiline Git",
                        href: "/profile",
                    },
                } : {
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
                        text: user ? "Soruları Gör" : "Hemen Başla",
                        href: "/questions",
                        variant: "default",
                    },
                    {
                        text: "GitHub",
                        href: "https://github.com/kkelesyusuf23/lanXpert",
                        variant: "glow",
                        icon: <Icons.gitHub className="h-5 w-5" />,
                    },
                ]}
                image={{
                    light: "https://www.launchuicomponents.com/app-light.png",
                    dark: "https://www.launchuicomponents.com/app-dark.png",
                    alt: "lanXpert Arayüz",
                }}
            />
        </div>
    );
}

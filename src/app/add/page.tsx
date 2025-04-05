import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Footer from "../components/footer";
import Navigation from "../components/navigation";
import Wardrobe from "./wardrobe";
import { api } from "~/trpc/server";

export default async function WardrobePage() {
    const session = await auth();
    if(!session?.user) return redirect("/login");

    const user = await api.user.get({ id: session.user.id });
    if(!user) return redirect("/login");

    return (<main className="h-full flex flex-col">
        <Navigation user={session.user} />
        <div className="size-[72px]"></div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-72px)] bg-white.p bg-cover bg-center">
            <Wardrobe user={user} />
        </div>
        <Footer />
    </main>);
}

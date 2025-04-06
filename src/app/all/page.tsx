import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import AllOutfits from "./all";
import type { Outfit } from "~/server/db/schema";

export default async function WardrobePage() {
    const session = await auth();
    if(!session?.user) return redirect("/login");

    const user = await api.user.get({ id: session.user.id });
    if(!user) return redirect("/login");

    const outfits = await api.outfit.list({ userId: user.id });

    return <main className="h-full flex flex-col">
        <Navigation user={session.user} />
        <div className="size-[72px]"></div>
        <AllOutfits outfits={outfits as Outfit[]} />
        <Footer user={session.user} />
    </main>;
} 
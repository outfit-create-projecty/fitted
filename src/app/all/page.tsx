import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import AllOutfits from "./all";

export default async function WardrobePage() {
    const session = await auth();
    if(!session?.user) return redirect("/login");

    const user = await api.user.get({ id: session.user.id });
    if(!user) return redirect("/login");


    return <main className="h-full flex flex-col">
        <Navigation user={session.user} />
        <div className="size-[72px]"></div>
        <AllOutfits user={user} />
        <Footer user={session.user} />
    </main>;
} 
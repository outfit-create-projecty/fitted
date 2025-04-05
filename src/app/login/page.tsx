import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { LoginBox } from "./login";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default async function () {
    const session = await auth();

    if(session?.user) return redirect("/profile");

    return (<main className="h-full flex flex-col">
        <Navigation user={session?.user} />
        <div className="size-[72px]"></div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-72px)] bg-white.p bg-cover bg-center">
            <LoginBox />
        </div>
        <Footer />
    </main>);
}
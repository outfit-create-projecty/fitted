import NavigationBar from "@/components/navigation";
import { Code, Code2, Compass, Rocket, Wind } from "lucide-react";
import { auth } from "~/server/auth";
import { Button } from "./components/ui/button";
import Link from "next/link";
import Footer from "./components/footer";

export default async function Home() {
    const session = await auth();
    return (<main>
        <NavigationBar user={session?.user} />
        <div className="size-16"></div>
        <div>
            <div className="bg-purple-500 p-24 h-[85vh] flex flex-row gap-6 items-center text-m-white border-m-primary-light">
                <div className="flex-1 pr-24 flex flex-col gap-8 z-20">
                    <h1 className="t font-bold text-6xl">ProjectY</h1>   
                    <p className="font-normal text-md">Choose your style.</p>
                    <div className="flex flex-row justify-start gap-8">
                        <Link href="/about">
                            <Button className="bg-teal-500 text-m-black font-semibold w-48 hover:bg-m-shallow duration-300 shadow-2xl shadow-m-accent-ultradark">
                                About us
                           </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-blue-500 text-m-black font-semibold w-48 hover:bg-m-accent-ultralight duration-300 shadow-2xl shadow-m-accent-dark">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex-1 pl-24 flex justify-center items-center">
                    <div className="bg-violet-900 bg-cover bg-opacity-50 rounded-lg p-8 w-[440px] h-[380px] font-mono text-black shadow-2xl hover:shadow-m-primary-ultralight shadow-m-primary-shallow duration-300">
                        
                    </div>
                </div>
            </div>
        </div>
        
        <Footer user={session?.user} />
    </main>);
}
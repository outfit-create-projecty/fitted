import NavigationBar from "@/components/navigation";
import { auth } from "~/server/auth";
import { Button } from "./components/ui/button";
import Link from "next/link";
import Footer from "./components/footer";
import Typing from "./typing";
const prompts = ["Help! I have a meeting soon. What should I wear?", "Help! I have a date tonight. What should I wear?", "Help! I have a job interview tomorrow. What should I wear?"];

export default async function Home() {
    const session = await auth();

    return (<main>
        <NavigationBar user={session?.user} />
        <div className="size-16"></div>
        <div>
            <div className="bg-accent-light p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
                <div className="text-center flex-1 pr-24 flex flex-col gap-8 z-20 items-center">
                    <h1 className="font-extrabold text-9xl tracking-tighter text-black">ProjectY</h1>   
                    <p className="font-normal text-2xl text-black tracking-widest">Choose your style.</p>
                    <div className="flex flex-row justify-start gap-8">
                        <Link href="/about">
                            <Button className="bg-primary-dark text-xl text-white font-medium p-6 w-54 hover:bg-accent-dark duration-300">
                                About Us
                           </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-primary-ultradark text-white text-xl font-medium p-6 w-54 hover:bg-accent-dark duration-300">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="relative flex-1 flex flex-row justify-center items-center gap-8 w-full h-full m-8">
                    <div className="rounded-4xl bg-cover bg-center!z-10 w-100 h-70 absolute top-10 left-5 border-2 border-white" style={{ backgroundImage: 'url("collage1.jpg")', backgroundSize: 'cover' }}></div>
                    <div className="rounded-4xl bg-cover bg-center !z-20 w-100 h-70 absolute bottom-10 left-10 border-2 border-white" style={{ backgroundImage: 'url("collage2.jpg")', backgroundSize: 'cover' }}></div>
                    <div className="rounded-4xl bg-cover bg-center !z-30 w-80 h-130 absolute bottom-15 right-15 border-2 border-white" style={{ backgroundImage: 'url("collage3.jpg")', backgroundSize: 'cover' }}></div>
                    <Typing />
                </div>
            </div>
        </div>

        <div className="bg-green-100 p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
            <div className="text-center flex-1 pr-24 flex flex-col gap-8 z-20 items-center">
                <h1 className="font-extrabold text-7xl tracking-tighter text-black">Outfits are <span className="text-primary">hard</span></h1>   
                <p className="font-normal text-2xl text-black tracking-widest">We can do it for you.</p>
            </div>
        </div>
        
        <Footer user={session?.user} />
    </main>);
}
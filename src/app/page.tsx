import NavigationBar from "@/components/navigation";
import { auth } from "~/server/auth";
import { Button } from "./components/ui/button";
import Link from "next/link";
import Footer from "./components/footer";
import Typing from "./typing";
import { WashingMachine } from "lucide-react";
const prompts = ["Help! I have a meeting soon. What should I wear?", "Help! I have a date tonight. What should I wear?", "Help! I have a job interview tomorrow. What should I wear?"];

export default async function Home() {
    const session = await auth();

    return (<main>
        <NavigationBar user={session?.user} />
        <div className="size-16"></div>
        <div>
            <div className="bg-accent-light p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
                <div className="text-center flex-1 pr-24 flex flex-col gap-8 z-20 items-center">
                    <h1 className="font-extrabold text-9xl tracking-tighter text-black flex flex-row items-center"><WashingMachine className="size-24" /> Fit<span className="text-primary">ted</span></h1>   
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
                    <div className="rounded-4xl bg-cover bg-center !z-30 w-80 h-[50vh] absolute bottom-15 right-15 border-2 border-white" style={{ backgroundImage: 'url("collage3.jpg")', backgroundSize: 'cover' }}></div>
                    <Typing />
                </div>
            </div>
        </div>

        <div className="bg-green-100 p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
            <div className="text-center flex-1 pr-24 flex flex-col gap-8 z-20 items-center">
                <h1 className="font-extrabold text-7xl tracking-tighter text-black">Outfits are <span className="text-primary">hard</span></h1>   
                <p className="font-normal text-2xl text-black tracking-widest">Let us do it for you.</p>
            </div>
        </div>
        <div className="bg-primary-light p-24 h-[85vh] flex flex-col gap-18 justify-center text-primary-foreground border-m-primary-light">
            <div className="bg-primary-ultralight rounded-full mr-auto p-12 flex flex-col items-center">
                <h1 className="font-bold text-4xl tracking-tighter text-black">What should I wear for my formal dinner date tonight?</h1>
            </div>
            <div className="bg-primary-ultralight rounded-full ml-auto p-12 flex flex-col items-center">
                <h1 className="font-bold text-4xl tracking-tighter text-black">Going for a beach walk, but my laundry is in the dryer.</h1>
            </div>
            <div className="bg-primary-ultralight rounded-full mr-auto p-12 flex flex-col items-center">
                <h1 className="font-bold text-4xl tracking-tighter text-black">Presenting in front of the executive board tonight but it's raining!</h1>
            </div>
        </div>
        <div className="bg-primary-ultradark p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
            <div className="flex flex-1 flex-col gap-8">
                <h1 className="font-extrabold text-7xl tracking-tighter text-white">Experience a whole new way to dress.</h1>   
                <p className="font-normal text-2xl text-white tracking-widest">Choose your style.</p>
            </div>
            <div className="flex flex-1 flex-col gap-8 items-center justify-center">
                <Link href="/about">
                    <Button className="w-80 bg-accent-dark text-xl text-white font-medium p-6 hover:bg-primary-dark duration-300">
                        About Us
                    </Button>
                </Link>
                <Link href="/login">
                    <Button className="w-80 bg-accent-main text-xl text-white font-bold p-6 hover:bg-accent-dark duration-300">
                        Get Started
                    </Button>
                </Link>
            </div>
        </div>
        
        <Footer user={session?.user} />
    </main>);
}
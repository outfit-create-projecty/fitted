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
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-accent-dark/5 animate-side"
                            style={{
                                left: "-50px",
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 100 + 50}px`,
                                height: `${Math.random() * 100 + 50}px`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${Math.random() * 10 + 5}s`
                            }}
                        />
                    ))}
                </div>
                <style>{`
                    @keyframes side {
                        0% {
                            width: 0;
                        }
                        100% {
                            width: 100vw;
                            opacity: 0;
                        }
                    }
                    .animate-side {
                        animation: side linear infinite;
                    }
                `}</style>
                      
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
                            <Button className="bg-gradient-to-br from-violet-500 to-primary-ultralight text-white text-xl font-medium p-6 w-54 duration-300 hover:cursor-pointer hover:bg-gradient-to-br hover:from-primary-main hover:to-primary-main transition-colors">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="relative flex-1 flex flex-row justify-center items-center gap-8 w-full h-full m-8">
                    <div className="rounded-4xl bg-cover bg-center!z-10 w-100 h-70 absolute top-10 left-5 border-2 border-white hover:scale-[1.02] duration-300 transition-transform" style={{ backgroundImage: 'url("collage1.jpg")', backgroundSize: 'cover' }}></div>
                    <div className="rounded-4xl bg-cover bg-center !z-20 w-100 h-70 absolute bottom-10 left-10 border-2 border-white hover:scale-[1.02] duration-300 transition-transform" style={{ backgroundImage: 'url("collage2.jpg")', backgroundSize: 'cover' }}></div>
                    <div className="rounded-4xl bg-cover bg-center !z-30 w-80 h-[50vh] absolute bottom-15 right-15 border-2 border-white hover:scale-[1.02] duration-300 transition-transform" style={{ backgroundImage: 'url("collage3.jpg")', backgroundSize: 'cover' }}></div>
                    <Typing />
                </div>
            </div>
        </div>

        <div className="relative bg-green-100 p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
            <div className="text-center flex-1 pr-24 flex flex-col gap-8 z-20 items-center">
                <h1 className="font-extrabold text-7xl tracking-tighter text-black">Outfits are <span className="text-primary">hard</span></h1>   
                <p className="font-normal text-2xl text-black tracking-widest">Let us do it for you.</p>
            </div>
        </div>
        <div className="relative bg-primary-light p-24 h-[85vh] flex flex-col gap-18 justify-center text-primary-foreground border-m-primary-light overflow-hidden">
            <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-primary-ultralight opacity-20 animate-bubble"
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 10 + 5}s`
                        }}
                    />
                ))}
            </div>
            <div className="bg-primary-ultralight rounded-full mr-auto p-12 flex flex-col items-center relative z-10">
                <h1 className="font-bold text-4xl tracking-tighter text-black">What should I wear for my formal dinner date tonight?</h1>
            </div>
            <div className="bg-primary-ultralight rounded-full ml-auto p-12 flex flex-col items-center relative z-10">
                <h1 className="font-bold text-4xl tracking-tighter text-black">Going for a beach walk, but my laundry is in the dryer.</h1>
            </div>
            <div className="bg-primary-ultralight rounded-full mr-auto p-12 flex flex-col items-center relative z-10">
                <h1 className="font-bold text-4xl tracking-tighter text-black">Presenting in front of the executive board tonight but it's raining!</h1>
            </div>
            <style>{`
                @keyframes bubble {
                    0% {
                        transform: translateY(100vh) scale(0.2);
                        opacity: 0.2;
                    }
                    50% {
                        opacity: 0.2;
                    }
                    80% {
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(-100vh) scale(1);
                    }
                }
                .animate-bubble {
                    animation: bubble linear infinite;
                }
            `}</style>
        </div>
        <div className="bg-primary-ultradark relative p-24 h-[85vh] flex flex-row gap-6 items-center text-primary-foreground border-m-primary-light">
            <img src="/dress.png" alt="Dress Shirt" className="absolute top-15 left-55 w-[30vw] z-15" />
            <img src="/pants.webp" alt="Dress Pants" className="absolute top-15 left-10 w-[30vw] z-10" />
            <div className="flex flex-1 flex-col gap-8 z-20">
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
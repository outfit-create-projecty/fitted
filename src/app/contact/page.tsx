import NavigationBar from "@/components/navigation";
import { auth } from "~/server/auth";
import { Button } from "../components/ui/button";
import Link from "next/link";
import Footer from "../components/footer";
export default async function Contact() {
    const session = await auth();

    return (
        <main>
            <NavigationBar user={session?.user} />
            <div className="size-16"></div>
            <div className="bg-accent-light p-24 min-h-[85vh] flex flex-col gap-6 items-center text-primary-foreground border-m-primary-light">
                <div className="text-center flex-1 flex flex-col gap-8 z-20 items-center max-w-4xl">
                    <h1 className="font-extrabold text-7xl tracking-tighter text-black">Contact Us</h1>
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-4 items-start">
                            <div className="bg-white rounded-lg shadow-lg">
                                <a href="https://www.instagram.com/surya.g06/" target="_blank" rel="noopener noreferrer">
                                    <img src="./surya.png" alt="Image 1" className="w-32 h-32 rounded-lg" />
                                </a>
                                <p className="text-center text-black font-bold">Surya</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg">
                                <a href="https://www.instagram.com/hwalfo2/" target="_blank" rel="noopener noreferrer">
                                    <img src="./holden.png" alt="Image 2" className="w-32 h-32 rounded-lg" />
                                </a>
                                <p className="text-center text-black font-bold">Holden</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-lg shadow-lg">
                                <a href="https://www.instagram.com/emanuel.medina24/" target="_blank" rel="noopener noreferrer">
                                    <img src="./emanuel.png" alt="Image 3" className="w-32 h-32 rounded-lg" />
                                </a>
                                <p className="text-center text-black font-bold">Emanuel</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg">
                                <a href="https://www.instagram.com/_seanlange/" target="_blank" rel="noopener noreferrer">
                                    <img src="./sean.png" alt="Image 4" className="w-32 h-32 rounded-lg" />
                                </a>
                                <p className="text-center text-black font-bold">Sean</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="font-bold text-2xl text-black">Get in Touch</h2>
                        <ul className="list-disc list-inside mt-4 text-xl text-black">
                            <div className="flex flex-col items-center text-black text-xl ">
                                <div>Email: <a href="mailto:contact@fitted.com" className="text-gray-600">contact@fitted.com</a></div>
                                <div>Phone: <a href="tel:+1234567890" className="text-gray-600">+1 (234) 567-890</a></div>
                                <div>Address: 123 Fashion St, Style City, ST 12345</div>
                            </div>
                        </ul>
                    </div>
                    <div className="mt-8">
                        <Link href="/">
                            <Button className="bg-primary-dark text-xl text-white font-medium p-6 w-54 hover:bg-accent-dark duration-300">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer user={session?.user} />
        </main>
    );
} 
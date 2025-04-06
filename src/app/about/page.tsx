import NavigationBar from "@/components/navigation";
import { auth } from "~/server/auth";
import { Button } from "../components/ui/button";
import Link from "next/link";
import Footer from "../components/footer";

export default async function About() {
    const session = await auth();

    return (
        <main>
            <NavigationBar user={session?.user} />
            <div className="size-16"></div>
            <div className="bg-accent-light p-24 min-h-[85vh] flex flex-col gap-6 items-center text-primary-foreground border-m-primary-light">
                <div className="text-center flex-1 flex flex-col gap-8 z-20 items-center max-w-4xl">
                    <h1 className="font-extrabold text-7xl tracking-tighter text-black">About Us</h1>
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <p className="font-normal text-xl text-black leading-relaxed">
                            Fitted was established in 2025 to give users an easier way to style themselves. Our mission is to simplify the process of creating outfits by providing a digital wardrobe and outfit creation platform. We understand that choosing what to wear can be a daily challenge, and our goal is to make this process more enjoyable and efficient.
                        </p>
                        <p className="font-normal text-xl text-black leading-relaxed mt-6">
                            Our platform allows users to upload their clothing items, organize them by category, and create outfits for various occasions. Whether you&apos;re preparing for a job interview, a date, or just your daily activities, Fitted helps you make confident fashion choices.
                        </p>
                        <p className="font-normal text-xl text-black leading-relaxed mt-6">
                            We believe that everyone deserves to feel confident in what they wear, and our technology is designed to make that possible. By combining user preferences with our outfit creation algorithms, we provide personalized style recommendations that match your taste and the occasion.
                        </p>
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
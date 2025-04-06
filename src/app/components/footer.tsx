"use client";

import type { Session } from 'next-auth';
import Link from 'next/link';
import { Button } from './ui/button';
import { Book, Compass, LogOut, Paperclip, Phone, Shirt, WashingMachine } from 'lucide-react';

export default function Footer(props: { user?: Session['user'] }) {
    return <div className="p-16 flex flex-row items-center justify-center h-72 bg-black text-primary-foreground gap-6 !z-50">
        <div className='flex flex-col w-[calc(40vw-32px)] h-full'>
            <div className="flex flex-row items-center"><WashingMachine className="size-6" /><span className="text-primary-foreground text-3xl font-bold">Fit</span><span className="text-secondary text-3xl font-bold">ted</span></div>
            <p className="text-sm font-light pr-16 pt-4">Choose your style.</p>
            <p className="mt-auto text-sm font-extralight">Copyright © 2025 Fitted</p>
        </div>
        <div className='flex flex-col flex-1 h-full'>
            <h1 className="text-sm font-bold text-m-accent">Overview</h1>
            <Link href="/about"><Button variant="link" className="p-0 text-primary-foreground"><Paperclip />About</Button></Link>
            <Link href="/login"><Button variant="link" className="p-0 text-primary-foreground"><Book />Login</Button></Link>
            <Link href="/contact"><Button variant="link" className="p-0 text-primary-foreground"><Phone />Contact</Button></Link>
        </div>
        { props.user && (
            <div className='flex flex-col flex-1 h-full'>
                <h1 className="text-sm font-bold text-m-accent">Account</h1>
                <Link href="/wardrobe"><Button variant="link" className="p-0 text-primary-foreground"><Shirt />Wardrobe</Button></Link>
                <Link href="/all"><Button variant="link" className="p-0 text-primary-foreground"><WashingMachine />Outfits</Button></Link>
                <Link href="/logout"><Button variant="link" className="p-0 text-primary-foreground"><LogOut />Logout</Button></Link>
            </div>
        )}
    </div>;
}
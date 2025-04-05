"use client";

import type { Session } from 'next-auth';
import Link from 'next/link';
import { Button } from './ui/button';
import { Book, Compass, Paperclip, Phone } from 'lucide-react';

export default function Footer(props: { user?: Session['user'] }) {
    return <div className="p-16 flex flex-row items-center justify-center h-72 bg-m-black text-m-white gap-6 !z-50">
        <div className='flex flex-col w-[calc(40vw-32px)] h-full'>
            <div className="flex flex-row gap-2 items-center"><h1 className="text-xl font-bold">ProjectY</h1></div>
            <p className="text-sm font-light pr-16 pt-4">Choose your style.</p>
            <p className="mt-auto text-sm font-extralight">Copyright 2025 Project Y</p>
        </div>
        <div className='flex flex-col flex-1 h-full'>
            <h1 className="text-sm font-bold text-m-accent">Overview</h1>
            <Link href="/about"><Button variant="link" className="p-0 text-m-white"><Paperclip />About</Button></Link>
            <Link href="/docs"><Button variant="link" className="p-0 text-m-white"><Book />Documentation</Button></Link>
            <Link href="/explore"><Button variant="link" className="p-0 text-m-white"><Compass />Explore</Button></Link>
            <Link href="/contact"><Button variant="link" className="p-0 text-m-white"><Phone />Contact</Button></Link>
        </div>
    </div>;
}
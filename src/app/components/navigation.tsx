"use client";

import type { Session } from "next-auth";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navigation(props: { user ?: Session['user'] }) {
    const user = props.user;
    const router = useRouter();

    return (<nav className="fixed w-full !z-50 bg-white text-m-white shadow-md p-4 flex justify-between items-center border-b-2 border-m-primary-dark">
        <Button variant="ghost" onClick={() => router.push("/")}>
            <span className="text-xl font-bold">ProjectY</span>
        </Button>

        <div className="hidden md:flex gap-6 ml-auto mr-8">
            <Button variant="link" className="text-m-black">
                <Link href="/outfit">Create an Outfit</Link>
            </Button>
            <Button variant="link" className="text-m-black">
                <Link href="/wardrobe">View Wardrobe</Link>
            </Button>
            { user ? <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                    <Avatar className="size-8">
                        <AvatarImage src="default.png" />
                        <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 m-4">
                    <DropdownMenuLabel>Hello, {user.name}</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Link href="/add">Add to Wardrobe</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/wardrobe">View Wardrobe</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Button
                            variant="destructive"
                            onClick={async () => await signOut({ redirectTo: "/" })}
                        >Sign Out</Button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> : <Button>
                <Link href="/login" className="text-m-white">Login</Link>
            </Button> }
        </div>
    </nav>);
}
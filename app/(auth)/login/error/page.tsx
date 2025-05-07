"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function ErrorPage() {
    const router = useRouter();
    return (
        <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-start">
              <Image
                          src="/img/logo.png"
                          alt="naia logo"
                          width={150}
                          height={35}
                        />
            <h1 className="text-xl font-bold">RDMC <span className="font-light">Portal</span></h1>
            <Separator className="my-4 w-1/2 mx-auto" decorative />
            <h1 className="text-4xl font-bold">Wrong credentials</h1>
            <p className="mt-4 text-lg">Please check your credentials.</p>
            <Button  className="mt-4 bg-teal-900 hover:bg-teal-800" onClick={() => router.push("/login")}>
                Go back to login
            </Button>
        </div>
        </div>
    );
    }
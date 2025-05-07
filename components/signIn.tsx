"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  // FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  email: z.string().min(10, {
    message: "Email / Mobile must be at least 10 characters.",
  }),
  password: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
});

export default function CardWithForm() {
  const [isdisabled, setIsDisabled] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "tamer.osman@ratpdev.com",
      password: "1111",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await signIn("credentials", data);
    toast("Login attempt", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const sendToken = async (email: string) => {
    setIsDisabled(true)

    let isEmail = false;
    let isMobile = false;
    if (email.includes("@")) {
      isEmail = true;
    }
    if (email.length === 11 && !isNaN(Number(email))) {
      isMobile = true;
    }

    if (!isEmail && !isMobile) {
      toast.error("Please enter a valid email or mobile number");
      setIsDisabled(false);
      return;
    }

    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //   toast.error("Please enter a valid email address");
    //   setIsDisabled(false);
    //   return;
    // }


    // if (!/^\d{11}$/.test(email)) {
    //   toast.error("Please enter a valid mobile number");
    //   setIsDisabled(false);
    //   return;
    // }
    // if (email === "") {
    //   toast.error("Please enter your email or mobile number");
    //   return;
    // }
    try {
      const res = await fetch("/api/auth/send-token", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Record not found in the database");
      toast.success("Token sent successfully!");
    } catch(error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the token.";
      toast.error(errorMessage);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <Card className="w-sm md:w-md bg-white shadow-2xl ">
          <CardHeader className="flex flex-col md:flex-row justify-center items-center gap-10">
            <Image
              src="/img/logo.png"
              alt="naia logo"
              width={100}
              height={35}
            />

            <div className="flex-1 md:border-s border-s-slate-700/50 md:ps-8">
              <CardTitle className="text-center uppercase  md:text-start text-2xl font-black">
                Login Form
              </CardTitle>
              <CardDescription>RDMC Portal</CardDescription>
            </div>
          </CardHeader>

          {/* <CardHeader>
            <CardTitle>Login form</CardTitle>
            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader> */}
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Email / Mobile</FormLabel> */}
                      <FormControl>
                        <Input
                          placeholder="Business email or mobile number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel>Token</FormLabel> */}
                      {/* <FormLabel>{form.getValues("password")}</FormLabel> */}
                      <div className="w-full  grid grid-cols-1 lg:grid-cols-3 justify-center items-start gap-2">
                        <div className="col-span-2 ">
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup className="flex w-full justify-center items-center gap-2">
                                <InputOTPSlot
                                  className="border border-gray-400 rounded-sm"
                                  index={0}
                                />
                                <InputOTPSlot
                                  className="border border-gray-400 rounded-sm"
                                  index={1}
                                />
                                <InputOTPSlot
                                  className="border border-gray-400 rounded-sm"
                                  index={2}
                                />
                                <InputOTPSlot
                                  className="border border-gray-400 rounded-sm"
                                  index={3}
                                />  <InputOTPSlot
                                className="border border-gray-400 rounded-sm"
                                index={4}
                              />  <InputOTPSlot
                              className="border border-gray-400 rounded-sm"
                              index={5}
                            />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                        </div>
                        <div className="">
                          <Button
                            type="button"
                            onClick={() => sendToken(form.getValues("email"))}
                            disabled={isdisabled}
                            className="col-span-1 w-full bg-teal-700 hover:bg-teal-900"
                          >
                            Send token
                          </Button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

              <Button
                className="w-full flex items-center justify-center gap-2  bg-cyan-800 hover:bg-cyan-900"
                type="submit"
              >
                Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2  justify-center items-center">
            {/* <Button variant="outline">Cancel</Button>
            <Button type="submit">Login</Button> */}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

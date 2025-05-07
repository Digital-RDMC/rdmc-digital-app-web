"use client";

import {  useSession } from "next-auth/react";
import LoginForm from "@/components/signIn"
import { useRouter } from "next/navigation";
// import Image from "next/image";
export default function Test() {
  const { data: session, status } = useSession();

 const router = useRouter();

  // const logout = async () => {
  //   await signOut();
  // };

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if(session){
    router.push("/")
  }

  return (
    <div className="h-screen w-screen flex  justify-center items-center relative">
      {/* <h1>Test</h1> */}
{/* <Image src="/img/na.jpg" alt="Logo" width={2000} height={2000} className="mx-auto w-screen h-screen top-0 left-0 absolute z-0" /> */}
      {/* {session ? (
        <div>
          <p>Logged in as:</p>
          <p><strong>Name:</strong> {session.user?.name}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : ( */}
        <div className="mx-auto w-full max-w-7xl flex justify-center items-center relative z-10">
          <div className="mx-auto w-auto my-5">
          <LoginForm />
          </div>
          {/* <p>Not logged in</p>
          <button onClick={login}>Login</button> */}
        </div>
      {/* )} */}
    </div>
  );
}

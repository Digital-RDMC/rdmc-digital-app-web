
import prisma from "@/lib/prisma"



export default async function Upload() {

    const data = await prisma.organization.findMany()
    return (
        <div className="">
            


            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}
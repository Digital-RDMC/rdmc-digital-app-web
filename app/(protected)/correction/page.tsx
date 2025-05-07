import prisma from "@/lib/prisma";
export default async function Page() {

  const users = await prisma.user.findMany({
    where: {
      status: { statusName: "Active" },
      directManagerCode:  null ,
    },
    select: {
      id: true,
      idName: true,
      employeeCode: true,
      managerId: true,
      directManagerCode: true,
    },
  });

  // let users = [];
  // try {
  // const page = 1; // Change this to the desired page number (0-based index)
  // const pageSize = 2500; // Number of records per page

  // const userss = await prisma.user.findMany({
  //     where: {
  //      status: { statusName: "Active" },
  //      directManagerCode: { not: null },
  //     },
  //     select: {
  //      id: true,
  //      idName: true,
  //      employeeCode: true,
  //      managerId: true,
  //      directManagerCode: true,
  //     },
  //     skip: page * pageSize, // Offset calculation
  //     take: pageSize, // Limit the number of records
  //   });

  //   users = await Promise.all(userss.map(async (user) => {
  //     if (!user.directManagerCode) return user;
  //     const managerData = await prisma.user.findUnique({
  //       where: { employeeCode: user.directManagerCode,  status: { statusName: "Active" }, },
  //       select: { id: true },
  //     });
  //     const updateUser = await prisma.user.update({
  //       where: { id: user.id ,  status: { statusName: "Active" },},
  //       data: { managerId: managerData?.id },
  //     });
  //     return updateUser
  //   }))
    

      
  //     // .map(async (user) => {
  //     //   if (!user.directManagerCode) return user;
  //     //   const managerData = await prisma.user.findUnique({
  //     //     where: { employeeCode: user.directManagerCode },
  //     //     select: { employeeCode: true, id: true, idName: true },
  //     //   });
  //     //   return {
  //     //     ...user,
  //     //     managerData,
  //     //   };
  //     // })
    
    
  //   // .map(async (user) => {
  //   //   if (!user.directManagerCode) return user;
  //   //   const managerData = await prisma.user.findUnique({
  //   //     where: { employeeCode: user.directManagerCode },
  //   //     select: { employeeCode: true, id: true, idName: true },
  //   //   });
  //   //   return {
  //   //     ...user,
  //   //     managerData,
  //   //   };
  //   // });
  // } catch (e) {
  //   users = [e];
  // }

  return (
    <div>
      <h1>Correction</h1>
      <p>Correction page content goes here.</p>

      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}

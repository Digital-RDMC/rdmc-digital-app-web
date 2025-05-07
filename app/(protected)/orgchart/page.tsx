import OrgChart from './chart'
import prisma from '@/lib/prisma';
interface OrgChartPerson {
    id: string;
    parentId: string;
    name: string;
    title: string;
    email: string;
    backgroundColor: string;
    textColor: string;
    imageUrl: string;
  }

export default async function OrganizationChart() {

const wadii = await prisma.user.findFirst({
    where: {
       status: {statusName: "Active"},
       managedBy: null

    },
    select: {
        id: true,
        managerId: true,
        firstName: true,
        lastName: true,
        position: { select: {positionEn: true}  },
        email: true,
        grade: { select: {gradeOfficial: true} },
    },
    take: 50,
    orderBy: { grade: { gradeOfficial: "desc" } }
}) 

let newIds = { [wadii?.id || "1"]: "1" };

const d = await prisma.user.findMany({
    where: {
       status: {statusName: "Active"},
       managerId: { not: null },
       grade: { gradeOfficial: { gt: 3 } },

    },
    select: {
        id: true,
        managerId: true,
        firstName: true,
        lastName: true,
        position: { select: {positionEn: true}  },
        email: true,
        grade: { select: {gradeOfficial: true} },
    },
    take: 999,
    orderBy: { grade: { gradeOfficial: "desc" } }
}) 


const staff: OrgChartPerson[] = d.map((user, index) => {
    
    newIds = { ...newIds, [user.id]: (index + 2).toString() };
    return {
    id: (index +2).toString(),
    // parentId : newIds[user.managerId || "1"] || "1",
    parentId: user.managerId || "",
    // parentId: "1",
    name: `${user.firstName} ${user.lastName}`,
    title: user.position?.positionEn || "No Title",
    email: user.email,
    backgroundColor:  (user.grade?.gradeOfficial ?? 0) > 6 ? "bg-teal-600" : (user.grade?.gradeOfficial ?? 0) > 5 ? "bg-cyan-600" : (user.grade?.gradeOfficial ?? 0) > 4 ?  "bg-orange-600" : "bg-slate-600" ,
    textColor: "text-gray-200",
    imageUrl: "/img/na.jpg",
    }})
    .map((user) => {
        return {
            ...user,
            parentId: newIds[user.parentId || "1"] || "1",
        };
    });

    const orgData: OrgChartPerson[] = [{
        id:  "1",
        // id: wadii?.id || "",
        parentId: wadii?.managerId || "",
        name: `${wadii?.firstName} ${wadii?.lastName}`,
        title: wadii?.position?.positionEn || "No Title",
        email: wadii?.email || "",
        backgroundColor: "bg-teal-600",
        textColor: "text-gray-200",
        imageUrl: "/img/na.jpg",}, ...staff]



    // const orgData: OrgChartPerson[] = [
    //     {
    //       id: "1",
    //       parentId: "",
    //       name: "CEO",
    //       title: "Chief Executive Officer",
    //       email: "ceo@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "2",
    //       parentId: "1",
    //       name: "CTO",
    //       title: "Chief Technology Officer",
    //       email: "cto@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "3",
    //       parentId: "1",
    //       name: "CFO",
    //       title: "Chief Financial Officer",
    //       email: "cfo@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "4",
    //       parentId: "1",
    //       name: "COO",
    //       title: "Chief Operating Officer",
    //       email: "coo@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "5",
    //       parentId: "2",
    //       name: "Dev Manager",
    //       title: "Development Manager",
    //       email: "dev-manager@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "6",
    //       parentId: "2",
    //       name: "QA Manager",
    //       title: "QA Manager",
    //       email: "qa-manager@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "7",
    //       parentId: "5",
    //       name: "Senior Dev",
    //       title: "Senior Developer",
    //       email: "senior-dev@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "8",
    //       parentId: "5",
    //       name: "Junior Dev",
    //       title: "Junior Developer",
    //       email: "junior-dev@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "9",
    //       parentId: "6",
    //       name: "QA Engineer",
    //       title: "QA Engineer",
    //       email: "qa-engineer@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "10",
    //       parentId: "3",
    //       name: "Finance Manager",
    //       title: "Finance Manager",
    //       email: "finance-manager@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "11",
    //       parentId: "3",
    //       name: "Accountant",
    //       title: "Accountant",
    //       email: "accountant@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "12",
    //       parentId: "4",
    //       name: "HR Manager",
    //       title: "HR Manager",
    //       email: "hr-manager@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //     {
    //       id: "13",
    //       parentId: "4",
    //       name: "Admin",
    //       title: "Administrative Officer",
    //       email: "admin@company.com",
    //       backgroundColor: "bg-teal-600",
    //       textColor: "text-gray-200",
    //       imageUrl: "/img/na.jpg",
    //     },
    //   ];
    return (
     <div className="">
        {/* <pre>
            {JSON.stringify(orgData, null, 2)}
        </pre> */}
        {orgData &&  <OrgChart orgData={orgData} />}
        </div>  
    )
}
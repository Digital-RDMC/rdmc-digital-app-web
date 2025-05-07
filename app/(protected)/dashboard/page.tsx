
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/prisma";
import ChartPage from "@/components/chart";

import HiredLeft from "./hiredLeft";

let usersCount = 0;
const getDepartments = async () => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      departmentEn: true,
      _count: {
        select: { users: { where: { status: { statusName: "Active" } } } },
      },
    },
  });

  // Define chart colors
  const chartColors = [
    "var(--chart-11)",
    "var(--chart-12)",
    "var(--chart-13)",
    "var(--chart-14)",
    "var(--chart-15)",
    "var(--chart-16)",
    "var(--chart-17)",
    "var(--chart-18)",
    "var(--chart-19)",

    "var(--chart-20)",
    "var(--chart-21)",

    "var(--chart-22)",
    "var(--chart-23)",
    "var(--chart-24)",
  ];

  // Create proper chart config
  const chartConfig = {
    value: { label: "Employees" },
  } as Record<string, { label: string; color?: string }>;

  // Add departments to config
  departments.forEach((department, index) => {
    chartConfig[department.departmentEn] = {
      label: department.departmentEn,
      color: chartColors[index % chartColors.length],
    };
  });

  const departmentModified = departments.filter(
    (department) => department._count.users > 50
  );

  const processedDepartments = departments
    .map((department) => {
      const { _count, ...rest } = department;
      usersCount += _count.users;
      return { ...rest, userCount: _count.users };
    })
    .map((department) => ({
      ...department,
      percentage: Math.round((department.userCount / usersCount) * 1000) / 10,
    }));
  return (
    <div>
      <ChartPage
        chartData={departments.map((dep, index) => ({
          item: dep.departmentEn,
          value: dep._count.users,
          fill: chartColors[index % chartColors.length],
        }))}
        chartConfig={chartConfig}
      />
    
      <pre>{JSON.stringify(departments, null, 2)}</pre>
      <pre>{JSON.stringify(usersCount, null, 2)}</pre>
      <pre>{JSON.stringify(processedDepartments, null, 2)}</pre>
    </div>
  );
};

export default async function Page() {
  const hiring = await prisma.user.groupBy({
    by: ["actualStartDate"],
    _count: {
      actualStartDate: true,
    },
    having: {
      actualStartDate: {
        not: null,
      },
    },
    orderBy: {
      actualStartDate: "asc",
    },
  });

  const leaving = await prisma.user.groupBy({
    by: ["terminationDate"],
    _count: {
      terminationDate: true,
    },
    having: {
      terminationDate: {
        not: null,
      },
    },

    where: {
      contractType: {
        typeName: {
          not: {
            in: ["Intern", "Training"],
          },
        },
      },
      employeeCategory: {
        not: {
          in: ["Intern"],
        },
      },
    },
    orderBy: {
      terminationDate: "asc",
    },
  });

  const hiringLeavingData = Array.from(
    new Set([
      ...hiring
        .map((h) =>
          h.actualStartDate
            ? h.actualStartDate.toISOString().split("T")[0]
            : null
        )
        .filter((date) => date !== null),
      ...leaving
        .map((l) =>
          l.terminationDate
            ? l.terminationDate.toISOString().split("T")[0]
            : null
        )
        .filter((date) => date !== null),
    ])
  )
    .map((date) => ({
      date,
      hiring:
        hiring.find(
          (h) =>
            h.actualStartDate &&
            h.actualStartDate.toISOString().split("T")[0] === date
        )?._count.actualStartDate || 0,
      leaving:
        leaving.find(
          (l) =>
            l.terminationDate &&
            l.terminationDate.toISOString().split("T")[0] === date
        )?._count.terminationDate || 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const leaveReasonData = (
    await prisma.user.groupBy({
      by: ["terminationReason"],
      _count: {
        terminationReason: true,
      },
      having: {
        terminationReason: {
          not: null,
        },
      },

      where: {
        contractType: {
          typeName: {
            not: {
              in: ["Intern", "Training"],
            },
          },
        },
        employeeCategory: {
          not: {
            in: ["Intern"],
          },
        },
        // Filter termination reasons with more than 10 employees after grouping
      },
    })
  )
    .map((leave) => {
      const { terminationReason, _count, ...rest } = leave;
    //   if (_count.terminationReason > 10) {
        return {
          ...rest,
          reason: terminationReason,
          employees: _count.terminationReason,
        };
    //   }
    //   return undefined;
    })
    // .filter((leave) => leave !== undefined)
    .sort((a, b) => b.employees - a.employees);

  // const leaveReasonData = [
  //   { reason: "January", employees: 186 },
  //   { reason: "February", employees: 305 },
  //   { reason: "March", employees: 237 },
  //   { reason: "April", employees: 73 },
  //   { reason: "May", employees: 209 },
  //   { reason: "June", employees: 214 },
  // ]

  return (
    <div className="h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="mt-4 text-lg">Welcome to the dashboard!</p>
      {/* <pre>{JSON.stringify(leaveReason, null, 2)}</pre> */}

      <HiredLeft chartData={hiringLeavingData} leaveReasonData={leaveReasonData} />

      {await getDepartments()}
      {usersCount}
    </div>
  );
}

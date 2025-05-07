"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Bar,
  BarChart,
  LabelList,
  RadialBarChart,
  PolarRadiusAxis,
  RadialBar,
  Label,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

const chartConfig = {
  views: {
    label: "Page Views",
  },
  hiring: {
    label: "Hiring",
    color: "hsl(var(--chart-1))",
  },
  leaving: {
    label: "Leaving",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const chartConfig2 = {
  employees: {
    label: "Employees",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function Component({
  chartData,
  leaveReasonData,
}: {
  chartData: { date: string; hiring: number; leaving: number }[];
  leaveReasonData: { reason: string | null; employees: number }[];
}) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("hiring");

  const total = React.useMemo(
    () => ({
      hiring: chartData.reduce((acc, curr) => acc + curr.hiring, 0),
      leaving: chartData.reduce((acc, curr) => acc + curr.leaving, 0),
    }),
    [chartData]
  );

  const chartData4 = [{ month: "january", desktop: 1260, mobile: 570 }];
  const chartConfig4 = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;
  const totalVisitors = chartData4[0].desktop + chartData4[0].mobile;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Hiring - Leaving</CardTitle>
          <CardDescription>
            Showing line chart for hiring and leaving
          </CardDescription>
        </div>
        <div className="flex">
          {["hiring", "leaving"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            {activeChart === "hiring" ? (
              <Line
                type="monotone"
                dataKey="hiring"
                stroke={chartConfig.hiring.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="leaving"
                stroke={chartConfig.leaving.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ChartContainer>

        {activeChart !== "hiring" && (
          <div className="grid grid-cols-1 lg:grid-cols-2  items-start  gap-2 mt-5">
            <div className="col-span-2">
              <h2 className="font-medium leading-none text-grey-500 ">
                {" "}
                Leaving by reasons{" "}
              </h2>

              <Separator className="my-3" />
              <div className="w-full ">
                <ChartContainer config={chartConfig2}>
                  <BarChart
                    accessibilityLayer
                    data={leaveReasonData}
                    margin={{
                      left: 100,
                      top: 0,
                      bottom: 100,
                      right: 50,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="reason"
                      tickLine={false}
                      tickMargin={0}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 20)}
                      tick={({ x, y, payload }) => (
                        <text
                          x={x}
                          y={y + 10}
                          dy={0}
                          transform={`rotate(45, ${x}, ${y})`}
                          textAnchor="start"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {payload.value.slice(0, 20)}
                        </text>
                      )}
                      // tick={(props) => (
                      //   <text {...props} className="font-semibold">
                      //     {props.payload.value}
                      //   </text>
                      // )}
                      angle={60}
                    />
                    {/* <XAxis type="number" dataKey="employees" hide />
                    <YAxis
                      dataKey="reason"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={(props) => (
                        <text {...props} className="font-semibold">
                          {props.payload.value}
                        </text>
                      )}
                      fontWeight={200}
                      width={100} // Adjust width to ensure all labels fit
                    /> */}

                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideIndicator />}
                    />
                    <Bar
                      dataKey="employees"
                      fill="var(--color-employees)"
                      radius={2}
                      barSize={15}
                    >
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={11}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>

            <div className="">
              {
                <pre>
                  {JSON.stringify(
                    leaveReasonData.filter(
                      (value) =>
                        value.reason !== "Failure in training or assessment" &&
                        value.reason !== "Positive drug test result"
                    ),
                    null,
                    2
                  )}
                </pre>
              }
              <ChartContainer
                config={chartConfig4}
                className="mx-auto aspect-square w-full "
              >
                <RadialBarChart
                  data={chartData4}
                  endAngle={180}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalVisitors.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                Visitors
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="desktop"
                    stackId="a"
                    cornerRadius={5}
                    fill="var(--color-desktop)"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="mobile"
                    fill="var(--color-mobile)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

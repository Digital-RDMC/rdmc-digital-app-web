/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
// import styles from './orgchart.module.css';
import Script from "next/script";


// Define types for our organization chart data
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

// Define a type for d3 with OrgChart extension
interface D3WithOrgChart {
  OrgChart: new () => {
    container: (element: HTMLDivElement) => any;
    data: (data: OrgChartPerson[]) => any;
    nodeWidth: (callback: () => number) => any;
    nodeHeight: (callback: () => number) => any;
    childrenMargin: (callback: () => number) => any;
    compactMarginBetween: (callback: () => number) => any;
    compactMarginPair: (callback: () => number) => any;
    neighbourMargin: (callback: () => number) => any;
    siblingsMargin: (callback: () => number) => any;
    nodeContent: (callback: (d: { data: OrgChartPerson }) => string) => any;
    render: () => void;
    fit: () => void;
  };
}

// Sample organization data

   
export default function OrganizationChart({orgData}: {orgData: OrgChartPerson[]}) {

  const chartRef = useRef<HTMLDivElement>(null);

  // Use useState for tracking loaded scripts to trigger re-renders
  const [scriptsLoaded, setScriptsLoaded] = useState({
    d3: false,
    flextree: false,
    orgchart: false,
  });

 

  // Initialize chart once all scripts are loaded
  const initializeChart = () => {
    if (typeof window !== "undefined" && chartRef.current) {
      // Cast window.d3 to our custom type that includes OrgChart
      const d3 = (window as any).d3 as D3WithOrgChart;

      // Check if d3 and OrgChart are loaded
      if (d3 && d3.OrgChart) {
        try {
          // Create a new organization chart
          const chart = new d3.OrgChart()
            .container(chartRef.current)
            .data(orgData)
            .nodeWidth(() => 250)
            .nodeHeight(() => 100)
            .childrenMargin(() => 40)
            .compactMarginBetween(() => 40)
            .compactMarginPair(() => 80)
            .neighbourMargin(() => 40)
            .siblingsMargin(() => 40)
            .nodeContent((d: { data: OrgChartPerson }) => {
              return `
                                <div class="p-2 ${d.data.backgroundColor} rounded shadow-md border border-gray-200">
                                   
                                    <div class="text-lg ${d.data.textColor} font-semibold text-center">${d.data.name}</div>
                                    <div class="text-xs ${d.data.textColor} text-center">${d.data.title}</div>
                                    <div class="text-xs ${d.data.textColor} text-center mt-1">${d.data.email}</div>
                                </div>
                            `;
            });

          // Render the chart
          chart.render();

          // Set initial zoom level
          setTimeout(() => {
            chart.fit();
          }, 500);
        } catch (error) {
          console.error("Error initializing organization chart:", error);
        }
      } else {
        console.error("D3 or D3.OrgChart library is not loaded");
      }
    }
  };

  // Check if all scripts are loaded
  useEffect(() => {
  	if (Object.values(scriptsLoaded).every(val => val)) {
  		initializeChart();
  	}
  }, [scriptsLoaded]);



  return (
    <div className="p-4 h-full">
 
      {/* Load scripts directly with correct dependencies */}
      <Script
        src="/d3.v7.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, d3: true }))}
      />
      <Script
        src="/d3-flextree.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, flextree: true }))}
        onError={(e) => console.error("Error loading d3-flextree:", e)}
      />
      <Script
        src="/d3-org-chart@3.1.0.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, orgchart: true }))}
        onError={(e) => console.error("Error loading d3-org-chart:", e)}
      />

      {/* <h1 className="text-2xl font-bold mb-4">Organization Chart</h1> */}
      <Card className="p-0 bg-transparent h-full min-h-[50vh] max-h-[80vh] w-full">
        <div ref={chartRef}></div>
      </Card>
      {/* <div className="mt-4 text-sm text-gray-500">
				<p>
					You can zoom in/out using your mouse wheel and drag the chart to
					navigate.
				</p>
			</div> */}
    </div>
  );
}

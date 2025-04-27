import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Transaction = {
  date: string;
  amount: number;
};

// Accept transactions as a prop
interface D3GraphProps {
  transactions: Transaction[];
}

export default function D3Graph({ transactions }: D3GraphProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Only draw if we have transactions data
    if (!transactions || transactions.length === 0) {
      // Optionally clear the SVG or show a placeholder message
      d3.select(ref.current).selectAll("*").remove();
      d3.select(ref.current)
        .append("text")
        .attr("x", 250)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .text("Link account to see graph");
      return;
    }

    // Group by month string (YYYY-MM)
    const data: Transaction[] = transactions; // Use the prop directly
    const monthly = d3.rollups(
      data,
      v => d3.sum(v, d => d.amount),
      d => d.date.slice(0, 7) // "YYYY-MM"
    );

    // Convert month strings to Date objects for plotting
    const parseMonth = d3.timeParse("%Y-%m");
    const monthlyData = monthly
      .map(([month, sum]) => ({
        month: parseMonth(month)!,
        sum,
      }))
      .filter(d => d.month); // Remove any invalid dates

    // Sort by date
    monthlyData.sort((a, b) => a.month.getTime() - b.month.getTime());

    // Set up SVG
    const width = 500,
      height = 300,
      margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // X and Y scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(monthlyData, d => d.month) as [Date, Date])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([
        Math.min(0, d3.min(monthlyData, d => d.sum) ?? 0),
        d3.max(monthlyData, d => d.sum) ?? 0,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(monthlyData.length)
          .tickFormat(d3.timeFormat("%b %Y") as any)
      );

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Line
    svg
      .append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "#279AF1")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line<{ month: Date; sum: number }>()
          .x(d => x(d.month))
          .y(d => y(d.sum))
      );

    // Dots
    svg
      .selectAll("circle")
      .data(monthlyData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.sum))
      .attr("r", 4)
      .attr("fill", "#279AF1");
  }, [transactions]);

  return <svg ref={ref} width={500} height={300} />;
}


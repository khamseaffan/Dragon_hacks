import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MonthlyIncomeExpense } from '../../lib_dir/transactionUtils'; 

interface MonthlyBarChartProps {
  data: MonthlyIncomeExpense[];
  width?: number;
  height?: number;
}

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  width = 500,
  height = 300,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }; // Increased bottom margin for labels

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (!data || data.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("No monthly data available");
      return;
    }

    const keys = ['income', 'expense'];
    const subgroups = keys;

    const x0 = d3.scaleBand<string>()
      .domain(data.map(d => d.month.toISOString().slice(0, 7)))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.2);

    const x1 = d3.scaleBand<string>()
      .domain(subgroups)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.income, d.expense)) ?? 0]).nice()
      .rangeRound([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal<string>()
      .domain(subgroups)
      .range(['#61C9A8', '#E84855']); // Green income, Red expense

    const parseMonth = d3.timeParse("%Y-%m");
    const formatMonth = d3.timeFormat("%b %y"); // Short format

    const xAxis = d3.axisBottom(x0)
        .tickFormat((d: any) => formatMonth(parseMonth(d)!))
        .tickSizeOuter(0);

    const yAxis = d3.axisLeft(y).ticks(5, "s"); // Fewer ticks, use 's' format (e.g., 1k)

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)"); // Rotate labels if needed

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove()) // Remove y-axis line
      .call(g => g.selectAll(".tick line") // Style grid lines
        .clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1));

    const group = svg.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
        .attr("transform", d => `translate(${x0(d.month.toISOString().slice(0, 7))!},0)`);

    group.selectAll("rect")
      .data(d => keys.map(key => ({ key, value: d[key as keyof MonthlyIncomeExpense] as number })))
      .join(
        enter => enter.append("rect")
          .attr("x", d => x1(d.key)!)
          .attr("y", y(0))
          .attr("width", x1.bandwidth())
          .attr("height", 0)
          .attr("fill", d => color(d.key))
          .call(enter => enter.transition().duration(750)
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))),
        update => update // Add update transition if needed
          .call(update => update.transition().duration(750)
            .attr("x", d => x1(d.key)!)
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => y(0) - y(d.value))),
        exit => exit.call(exit => exit.transition().duration(750)
          .attr("height", 0)
          .attr("y", y(0))
          .remove())
      )
      .append("title")
      .text((d: any) => `${d.key}: ${d.value.toFixed(2)}`);

  }, [data, width, height, margin]);

  return <svg ref={ref} width={width} height={height} />;
};

export default MonthlyBarChart;
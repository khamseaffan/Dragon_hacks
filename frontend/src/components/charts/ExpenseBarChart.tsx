
import { CategoryTotal }  from '../../lib_dir/transactionUtils'; 

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ChartStyles.css'; // Create this for tooltip styles

interface ExpenseBarChartProps {
  data: CategoryTotal[];
  width?: number;
  height?: number;
  colorScheme?: readonly string[];
}

const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({
  data,
  width = 500,
  height = 300,
  colorScheme = d3.schemeBlues[9] // Example sequential scheme
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const margin = { top: 30, right: 30, bottom: 10, left: 130 }; // Wider left margin, top for axis

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Tooltip Setup
    let tooltip = d3.select(tooltipRef.current);
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none");
        tooltipRef.current = tooltip.node() as HTMLDivElement;
    }

    const processedData = data.filter(d => d.total > 0).sort((a, b) => a.total - b.total);

    if (processedData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("No expense data");
      return;
    }

    const y = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([margin.top, height - margin.bottom])
      .padding(0.15);

    const x = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.total) ?? 0]).nice()
      .range([margin.left, width - margin.right]);

    const color = d3.scaleOrdinal<string>(d3.schemeTableau10) // Use categorical for distinct categories
        .domain(processedData.map(d => d.category));

    const formatCurrency = d3.format("$,.2f");

    // X Axis (Top)
    svg.append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(x).ticks(width / 80, "s"))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line") // Style grid lines
        .clone()
        .attr("y2", height - margin.top - margin.bottom)
        .attr("stroke-opacity", 0.1));

    // Y Axis (Left)
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .call(g => g.selectAll(".tick text").call(wrap, margin.left - 10)); // Wrap long labels


    // --- Axis Labels ---
     svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", margin.top / 2) // Position above axis
        .text("Amount ($)");

    // --- Bars with Tooltips ---
    svg.append("g")
      .selectAll("rect")
      .data(processedData)
      .join(
        enter => enter.append("rect")
          .attr("fill", d => color(d.category))
          .attr("x", x(0))
          .attr("y", (d) => y(d.category)!)
          .attr("height", y.bandwidth())
          .attr("width", 0) // Start width at 0
          .call(enter => enter.transition().duration(750)
            .attr("width", d => Math.max(0, x(d.total) - x(0)))), // Ensure width >= 0
        update => update
          .call(update => update.transition().duration(750)
            .attr("y", (d) => y(d.category)!)
            .attr("width", d => Math.max(0, x(d.total) - x(0)))
            .attr("fill", d => color(d.category))),
        exit => exit.call(exit => exit.transition().duration(750)
          .attr("width", 0)
          .remove())
      )
      // --- Tooltip Events ---
      .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`
              <strong>${d.category}</strong><br/>
              Amount: ${formatCurrency(d.total)}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
      });

    // Cleanup tooltip on component unmount
    return () => {
        d3.select(tooltipRef.current).remove();
    };

  }, [data, width, height, margin, colorScheme]);

  // Helper function for wrapping long Y-axis labels
  function wrap(text: d3.Selection<d3.BaseType | SVGTextElement, unknown, SVGGElement, any>, width: number) {
      text.each(function() {
          const text = d3.select(this);
          const words = text.text().split(/\s+/).reverse();
          let word;
          let line: string[] = [];
          let lineNumber = 0;
          const lineHeight = 1.1; // ems
          const y = text.attr("y");
          const dy = parseFloat(text.attr("dy") || "0");
          let tspan = text.text(null).append("tspan").attr("x", -5).attr("y", y).attr("dy", dy + "em"); // x=-5 for padding
          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if ((tspan.node() as SVGTextElement).getComputedTextLength() > width && line.length > 1) {
                  line.pop(); // remove word that broke limit
                  tspan.text(line.join(" "));
                  line = [word]; // start new line
                  tspan = text.append("tspan").attr("x", -5).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
          }
      });
  }


  return <svg ref={ref} width={width} height={height} />;

}
export default ExpenseBarChart;

import { DailyActivity }  from '../../lib_dir/transactionUtils'; 
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ChartStyles.css'; // Create this for tooltip styles

interface CalendarHeatmapChartProps {
  dailyMap: Map<string, DailyActivity>;
  metric?: 'netAmount' | 'income' | 'expense';
  width?: number;
  height?: number;
  colorInterpolator?: (t: number) => string;
}

const CalendarHeatmapChart: React.FC<CalendarHeatmapChartProps> = ({
  dailyMap,
  metric = 'netAmount',
  width = 700,
  height = 150,
  colorInterpolator = d3.interpolateYlGnBu
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null); // Ref to manage the tooltip DOM element
  const margin = { top: 40, right: 20, bottom: 10, left: 40 }; // Increased top for month labels
  const cellSize = 15;
  const cellPadding = 2;
  const weekDayLabelWidth = 30; // Space for weekday labels

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Tooltip Setup
    // Ensure tooltipRef.current exists or create the tooltip div
    if (!tooltipRef.current) {
        tooltipRef.current = d3.select("body").append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .node(); // Get the actual DOM node and store it in the ref
    }
    // Now select the guaranteed-to-exist element referenced by tooltipRef.current
    const tooltip = d3.select(tooltipRef.current) as d3.Selection<HTMLDivElement, unknown, null, undefined>;

    if (!dailyMap || dailyMap.size === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("No daily data available");
      return;
    }

    // --- Data Prep ---
    const today = new Date();
    const endDate = d3.timeDay.offset(today, 1);
    const startDate = d3.timeMonth.offset(today, -4); // Show ~4 months history
    const allDates = d3.timeDays(startDate, endDate);

    const dataForPeriod = allDates.map(date => {
        const dateString = d3.timeFormat("%Y-%m-%d")(date);
        const activity = dailyMap.get(dateString);
        return { date: date, value: activity ? activity[metric] : 0 };
    });

    const values = dataForPeriod.map(d => d.value).filter(v => v !== 0); // Filter zeros for domain calculation

    const minValue = d3.min(values) ?? 0;
    const maxValue = d3.max(values) ?? 0;

    // --- Color Scale ---
    let currentInterpolator = colorInterpolator;
    let colorDomain = [minValue, maxValue];

    if (metric === 'netAmount' && minValue < 0 && maxValue > 0) {
        const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
        currentInterpolator = d3.interpolateRdYlBu;
        colorDomain = [-maxAbs, maxAbs];
    } else if (metric === 'expense' && maxValue > 0) {
         currentInterpolator = d3.interpolateReds;
         colorDomain = [0, maxValue];
    } else if (metric === 'income' && maxValue > 0) {
         currentInterpolator = d3.interpolateGreens;
         colorDomain = [0, maxValue];
    } else if (minValue === 0 && maxValue === 0) {
         colorDomain = [0, 1]; // Prevent crash if all values are zero
    }

    const color = d3.scaleSequential(currentInterpolator).domain(colorDomain);
    const emptyColor = "#efefef"; // Color for days with zero value

    // --- Layout Helpers ---
    const countDay = (d: Date) => d.getDay(); // 0 = Sun
    const formatDay = (d: number) => "SMTWTFS"[d];
    const timeWeek = d3.timeSunday; // Weeks start on Sunday
    const formatMonth = d3.timeFormat("%b");
    const formatDate = d3.timeFormat("%Y-%m-%d");
    const formatCurrency = d3.format("$,.2f");

    const months = d3.timeMonths(d3.timeMonth.floor(startDate), endDate);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // --- Weekday Labels ---
     g.selectAll(".weekday-label")
       .data(d3.range(7))
       .join("text")
         .attr("class", "weekday-label")
         .attr("x", -10)
         .attr("y", d => (countDay(new Date(2024, 0, d + 1)) + 0.5) * (cellSize + cellPadding))
         .attr("text-anchor", "end")
         .attr("dy", "0.31em")
         .style("font-size", "10px")
         .text(d => formatDay(d));

    // --- Month Groups and Cells ---
    const monthGroups = g.selectAll(".month-group")
        .data(months)
        .join("g")
          .attr("class", "month-group")
          // Calculate horizontal position based on weeks since start
          .attr("transform", d => {
              const firstDayOfMonth = d3.timeWeek.count(startDate, d);
              return `translate(${firstDayOfMonth * (cellSize + cellPadding)}, 0)`;
          });

    // Month Labels
    monthGroups.append("text")
        .attr("class", "month-label")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text(d => formatMonth(d));

    // Day Cells
    monthGroups.selectAll(".day-cell")
      .data(d => dataForPeriod.filter(item => item.date.getFullYear() === d.getFullYear() && item.date.getMonth() === d.getMonth()))
      .join("rect")
        .attr("class", "day-cell")
        .attr("width", cellSize)
        .attr("height", cellSize)
        // Position within the month group based on week number relative to month start
        .attr("x", d => timeWeek.count(d3.timeMonth.floor(d.date), d.date) * (cellSize + cellPadding))
        .attr("y", d => countDay(d.date) * (cellSize + cellPadding))
        .attr("fill", d => (d.value !== 0 ? color(d.value) : emptyColor))
      // --- Tooltip Events ---
      .on("mouseover", (event, d) => {
          if (d.value === 0) return; // Don't show tooltip for empty days
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`
              <strong>${formatDate(d.date)}</strong><br/>
              ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${formatCurrency(d.value)}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
      });

    // Cleanup tooltip on component unmount
    return () => {
        if (tooltipRef.current) {
            d3.select(tooltipRef.current).remove();
            tooltipRef.current = null; // Clear the ref
        }
    };

  }, [dailyMap, metric, width, height, margin, cellSize, cellPadding, colorInterpolator]); // tooltipRef should not be a dependency

  return <svg ref={ref} width={width} height={height} />;
};

export default CalendarHeatmapChart;
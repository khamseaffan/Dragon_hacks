import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CategoryTotal } from '../../lib_dir/transactionUtils'; 

interface CategoryDonutChartProps {
  data: CategoryTotal[];
  title?: string; // Optional title for center
  width?: number;
  height?: number;
  colorScheme?: readonly string[]; // Allow custom colors
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  title = "Category Breakdown",
  width = 300,
  height = 300,
  colorScheme = d3.schemeTableau10 // Default color scheme
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

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
        .text("No category data");
      return;
    }

    const radius = Math.min(width, height) / 2 - margin.top;
    const innerRadius = radius * 0.6;

    const color = d3.scaleOrdinal<string>(colorScheme)
      .domain(data.map(d => d.category));

    const pie = d3.pie<CategoryTotal>()
      .value(d => d.total)
      .sort((a,b) => d3.descending(a.total, b.total)); // Sort slices by value

    const arc = d3.arc<d3.PieArcDatum<CategoryTotal>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = pie(data);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    g.selectAll("path")
      .data(arcs)
      .join(
        enter => enter.append("path")
          .attr("fill", d => color(d.data.category))
          .attr("d", arc) // Initial static render for tooltip attachment
          .call(path => path.transition().duration(750)
              .attrTween("d", d_1 => {
                  const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d_1); // Interpolate angles
                  return t => {
                      const interpolated = i(t);
                      return arc(interpolated) || "";
                  };
              }))
              .append("title")
              .text(d => `${d.data.category}: ${d.data.total.toFixed(2)}`),
        update => update // Add update transition if needed
          .call(update => update.transition().duration(750)
              .attrTween("d", function(d) {
                  const currentArc = (this as any).__current__ || { startAngle: 0, endAngle: 0 };
                  const i = d3.interpolate(currentArc, d);
                  (this as any).__current__ = i(0); // Store initial state for next transition
                  return t => arc(i(t)) || "";
              }))
          .select("title") // Update tooltip
          .text(d => `${d.data.category}: ${d.data.total.toFixed(2)}`),
        exit => exit
          .call(path => path.transition().duration(750)
              .attrTween("d", d => {
                  const i = d3.interpolate(d, { ...d, startAngle: d.endAngle, endAngle: d.endAngle }); // Collapse slice
                  return t => arc(i(t)) || "";
              }).remove())
      );

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(title);

  }, [data, title, width, height, margin, colorScheme]);

  return <svg ref={ref} width={width} height={height} />;
};

export default CategoryDonutChart;
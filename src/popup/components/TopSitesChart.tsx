import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface SiteSummary {
  domain: string;
  avgCo2Grams: number;
}

export function getTopSites(sites: SiteSummary[], limit: number): SiteSummary[] {
  return [...sites]
    .sort((a, b) => b.avgCo2Grams - a.avgCo2Grams)
    .slice(0, limit);
}

interface TopSitesChartProps {
  sites: SiteSummary[];
}

const CHART_WIDTH = 340;
const BAR_HEIGHT = 24;
const LABEL_WIDTH = 120;
const VALUE_WIDTH = 50;
const BAR_AREA_WIDTH = CHART_WIDTH - LABEL_WIDTH - VALUE_WIDTH;

export default function TopSitesChart({ sites }: TopSitesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const topSites = getTopSites(sites, 10);
  const chartHeight = topSites.length * (BAR_HEIGHT + 4);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (topSites.length === 0) return;

    const maxCo2 = d3.max(topSites, (d) => d.avgCo2Grams) ?? 1;

    const xScale = d3
      .scaleLinear()
      .domain([0, maxCo2])
      .range([0, BAR_AREA_WIDTH]);

    const groups = svg
      .selectAll("g.site-row")
      .data(topSites)
      .join("g")
      .attr("class", "site-row")
      .attr("transform", (_, i) => `translate(0, ${i * (BAR_HEIGHT + 4)})`);

    // Domain labels
    groups
      .append("text")
      .attr("x", LABEL_WIDTH - 4)
      .attr("y", BAR_HEIGHT / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .attr("font-size", "11px")
      .text((d) => d.domain);

    // Bars
    groups
      .append("rect")
      .attr("class", "bar")
      .attr("x", LABEL_WIDTH)
      .attr("y", 2)
      .attr("width", (d) => xScale(d.avgCo2Grams))
      .attr("height", BAR_HEIGHT - 4)
      .attr("rx", 2)
      .attr("fill", "#27AE60");

    // Value labels
    groups
      .append("text")
      .attr("x", LABEL_WIDTH + BAR_AREA_WIDTH + 4)
      .attr("y", BAR_HEIGHT / 2)
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .text((d) => d.avgCo2Grams.toFixed(2));
  }, [topSites]);

  return (
    <div className="top-sites-chart">
      <svg ref={svgRef} width={CHART_WIDTH} height={chartHeight} />
    </div>
  );
}

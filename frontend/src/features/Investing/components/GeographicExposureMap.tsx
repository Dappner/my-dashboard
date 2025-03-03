import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import * as d3 from 'd3';

const GeographicExposureMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    setIsLoading(true);

    // Clear previous content
    svg.selectAll("*").remove();

    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = 400;

    // Create a group for the map
    const g = svg.append("g");

    // Set up the projection to match the one in the example
    const projection = d3.geoNaturalEarth1()
      .scale(width / 1.5 / Math.PI)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world GeoJSON data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((data: any) => {
        // Draw the map
        g.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .style("opacity", 0.8);

        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error loading GeoJSON:", error);
        setIsLoading(false);

        // Fallback if loading fails - display message
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .text("Unable to load map data. Please check your network connection.");
      });
  }, []);

  return (
    <Card className="w-full">
      <CardContent>
        <div className="relative bg-gray-50 rounded-md overflow-hidden" style={{ height: "500px" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicExposureMap;

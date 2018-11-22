import React, { Component } from "react";
import * as d3 from "d3";
import "./style.css";

class App extends Component {
  componentDidMount() {
    const svgNode = d3.select("svg");
    let margin = { top: 20, right: 20, bottom: 110, left: 40 },
      margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
      width = +svgNode.attr("width") - margin.left - margin.right,
      height = +svgNode.attr("height") - margin.top - margin.bottom,
      height2 = +svgNode.attr("height") - margin2.top - margin2.bottom;
    let parseDate = d3.timeParse("%b %Y");

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      let s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      focus.select(".area").attr("d", area);
      focus.select(".axis--x").call(xAxis);
      svgNode
        .select(".zoom")
        .call(
          zoom.transform,
          d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
        );
    };

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      let t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
      focus.select(".area").attr("d", area);
      focus.select(".axis--x").call(xAxis);
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    };

    const type = d => {
      d.date = parseDate(d.date);
      d.price = +d.price;
      return d;
    };

    let x = d3.scaleTime().range([0, width]),
      x2 = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      y2 = d3.scaleLinear().range([height2, 0]);

    let xAxis = d3.axisBottom(x),
      xAxis2 = d3.axisBottom(x2),
      yAxis = d3.axisLeft(y);

    let brush = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", brushed);

    let zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    let area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(d => {
        return x(d.date);
      })
      .y0(height)
      .y1(d => {
        return y(d.price);
      });

    let area2 = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x(d => {
        return x2(d.date);
      })
      .y0(height2)
      .y1(d => {
        return y2(d.price);
      });

    svgNode
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    let focus = svgNode
      .append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let context = svgNode
      .append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    d3.csv("sp500.csv", type).then(data => {
      x.domain(
        d3.extent(data, d => {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(data, d => {
          return d.price;
        })
      ]);
      x2.domain(x.domain());
      y2.domain(y.domain());

      focus
        .append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

      focus
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      focus
        .append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

      context
        .append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

      context
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

      context
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

      svgNode
        .append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
    });
  }

  render() {
    return (
      <div>
        <h1 style={{ margin: "0 300px" }}> D3 Brush with react</h1>
        <svg width={800} height={500} />
      </div>
    );
  }
}

export default App;

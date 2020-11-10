import React, { Component } from "react";
import "./Progress.css";
import * as d3ScaleChromatic from 'd3-scale-chromatic'

// function rgba2hex(orig) {
//     var a, isPercent,
//         rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
//         alpha = (rgb && rgb[4] || "").trim(),
//         hex = rgb ?
//             (rgb[1] | 1 << 8).toString(16).slice(1) +
//             (rgb[2] | 1 << 8).toString(16).slice(1) +
//             (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
//
//     if (alpha !== "") {
//         a = alpha;
//     } else {
//         a = 01;
//     }
//     // multiply before convert to HEX
//     a = ((a * 255) | 1 << 8).toString(16).slice(1)
//     hex = hex + a;
//
//     return hex;
// }

class Progress extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.props.progress/100)
        console.log(d3ScaleChromatic)
        console.log(d3ScaleChromatic.interpolateOranges(this.props.progress/100))
    }

    render() {
        return (
            <div className="ProgressBar">
                <div
                    className={"Progress"}
                    style={{ width: this.props.progress + "%" , backgroundColor: (d3ScaleChromatic.interpolateOranges(0.2 + this.props.progress/300))}}

                />
            </div>
        );
    }
}

export default Progress;

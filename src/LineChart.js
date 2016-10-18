/* @flow */
import React, { Component } from 'react';
import { Animated, ART, View } from 'react-native';
const { Surface, Shape, Path } = ART;
// import Morph from 'art/morph/path';
import * as C from './constants';
import Circle from './Circle';
const AnimatedShape = Animated.createAnimatedComponent(Shape);
import Grid from './Grid';

var makeDataPoint = (x : number, y : number, data : any, myDataPointColor : any) => {
    return { x, y, radius: data.dataPointRadius, fill: myDataPointColor, stroke: myDataPointColor };
};

var calculateDivisor = (minBound : number, maxBound : number) : number => {
    return (maxBound - minBound <= 0) ? 0.00001 : maxBound - minBound;
};

export default class LineChart extends Component<void, any, any> {

    constructor(props : any) {
        super(props);
        this.state = { opacity: new Animated.Value(0) };
    }

    componentWillUpdate() {
        Animated.timing(this.state.opacity, { duration: 0, toValue: 0 }).start();
    }

    componentDidUpdate() {
        Animated.timing(this.state.opacity, { duration: 500, toValue: 1 }).start();
    }

    _drawLine = (lineData, color) => {


        containerHeight = this.props.height;
        containerWidth = this.props.width;
        const data = lineData || [];

        let minBound = this.props.minVerticalBound;
        let maxBound = this.props.maxVerticalBound;



        // For all same values, create a range anyway
        if (minBound === maxBound) {
            minBound -= this.props.verticalGridStep;
            maxBound += this.props.verticalGridStep;
        }



        const divisor = calculateDivisor(minBound, maxBound);
        let scale = (containerHeight + 1) / divisor;

        const horizontalStep = containerWidth / data.length;
        var dataPoints = [];
        const firstDataPoint = data[0][1];

        //if(minBound == undefined || isNaN(minBound)) { minBound = 0; }
        minBound = (firstDataPoint * -1);
        //if(scale == undefined || isNaN(scale)) { scale = 18.2; }
        scale = (containerHeight / (maxBound - 1));

        if(containerHeight == undefined || isNaN(containerHeight)) { containerHeight = 181; }


        /*
        console.log("divisor: " + divisor);
        console.log("minBound: " + minBound);
        console.log("scale: " + scale);
        console.log("containerHeight: " + containerHeight);
        console.log("firstDataPoint: " + firstDataPoint);
        */


        //if(firstDataPoint == undefined) { firstDataPoint = 5 }

        var height = (containerHeight - (firstDataPoint * scale)) + 10;


        //console.log("(" + containerHeight + " - (" + firstDataPoint + " * " + scale + "))");

        //console.log("Source height is: " + height);


        if(height < 22) { //too low
            //console.log("CONDITION AA");
            height = 22;
        }

        if(height > 180) { //too high
           // console.log("CONDITION BB");
            height = 175;
        }



        //console.log("FIRST HEIGHT: " + height)
        //console.log("CONTAINER HEIGHT: " + containerHeight)

        const path = new Path().moveTo(15, height-10);
        const fillPath = new Path().moveTo(15, height).lineTo(0, height);

        dataPoints.push(makeDataPoint(15, height-10, this.props, color));

        data.slice(1).forEach(([_, dataPoint], i) => {



            let _height = (containerHeight - (dataPoint * scale));

            //console.log("Datapoint is: " + dataPoint + " height will be: " + _height);

            if (_height < 0) {
                //console.log("Setting height to 0");
                 _height = 0;
            }

            const x = horizontalStep * (i) + (horizontalStep+12);
            var y = Math.round(_height) + 12;

            //console.log("Y was: " + y);

            if(y < 0) { //too high
                //console.log("CONDITION A");
                y = 12;
            }

            if(y > 180) { //too low
                 //console.log("CONDITION B");
               y = 175;
            }

            //console.log("Y is now: " + y);

            path.lineTo(x, y);
            fillPath.lineTo(x, y);
            dataPoints.push(makeDataPoint(x, y, this.props, color));
        });
        fillPath.lineTo(dataPoints[dataPoints.length - 1].x, containerHeight);
        if (this.props.fillColor) {
            fillPath.moveTo(0, containerHeight);
        }
        if (path.path.some(isNaN)) return null;
        return (
            <View>
                <View style={{ position: 'absolute' }}>
                    <Surface width={containerWidth} height={containerHeight}>
                        <AnimatedShape d={path} stroke={color || C.BLUE} strokeWidth={this.props.lineWidth} />
                        <AnimatedShape d={fillPath} fill={this.props.fillColor} />
                    </Surface>
                </View>
                <View style={{ position: 'absolute' }}>
                    <Surface width={containerWidth} height={containerHeight} />
                </View>
                {(() => {
                    if (!this.props.showDataPoint) return null;

                    //console.log(dataPoints);
                    return (
                        <View style={{ position: 'absolute',}}>
                        <Surface width={containerWidth} height={containerHeight + 10}>
                            {dataPoints.map((d, i) => <Circle key={i} {...d} />)}
                        </Surface>
                        </View>
                    );
                })()}
            </View>
        );
    };

     _drawLines = () => {

            var lines = [];


						for(i = 0; i < this.props.data.length; i+=1) {
                lines.push(this._drawLine(this.props.data[i], this.props.dataColors[i]));
            }

            return lines;

    };

    render() : any {


        return (
            <View>
                <Grid {...this.props} />
                <Animated.View style={{ opacity: this.state.opacity, backgroundColor: 'transparent' }}>
                    {this._drawLines()}
                </Animated.View>
            </View>
        );
    }
}

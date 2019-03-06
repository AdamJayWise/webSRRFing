// -----------------------
console.log('webSRRF.js');
// -----------------------
var imSize = 45
var svgPixelsPerPoint = 10;
var w = imSize*svgPixelsPerPoint;
var h = imSize*svgPixelsPerPoint;


var params = { data: zeros(imSize,imSize), width: imSize, height: imSize, type : 'interactive' };
var startData = new Im(params);

// add random noise to starting data
startData.data = startData.data.map(addNoise)

var nSamples = 12; // how many samples around the ring
var ringRad = 1*svgPixelsPerPoint; //radius of ring to sample around in fake pixels



startData.sum( createBlob(width = startData.width, height = startData.height, 16, 18 , 10) )
//startData.sum( createBlob(width = startData.width, height = startData.height, 8, 8 , 4) )
//startData.sum( createBlob(width = startData.width, height = startData.height, 12, 8 , 4) )

// add an SVG canvas to the body

d3.select('body')
    .append('svg')
    .attr('id','screen1')
    .attr('width',w)    
    .attr('height',h)
    .append('defs')
    .append('marker')
    .attr('id','arrow')
    .attr('orient', 'auto')
    .attr('markerUnits',"strokeWidth")
    .attr('viewBox', "0 0 20 20")
    .attr('markerHeight', 12)
    .attr('markerWidth', 12)
    .attr('refX',0)
    .attr('refY',3)
    .append('path')
    .attr('d',"M9,0 L9,6 L0,3 Z")
    .attr('fill','orange')
    .attr('fill-opacity', .5)
    .attr('stroke','none')


startData.draw(d3.select('#screen1'))

var kx = new Im( {data : [-1,0,1,-1,0,1,-1,0,1], width : 3, height: 3} )
var ky = new Im( {data : [-1,-1,-1,0,0,0,1,1,1], width : 3, height: 3} )

startData.Gx = conv(startData, kx)
startData.Gy = conv(startData, ky)

//startData.Gx.draw(d3.select('body').append('svg').attr('height',h).attr('width',w).attr('id','screen2'))
//startData.Gy.draw(d3.select('body').append('svg').attr('height',h).attr('width',w).attr('id','screen3'))

startData.srrf = new Im({ data: zeros(imSize,imSize), width: imSize, height: imSize, type : 'srrf' })
startData.srrf.draw(d3.select('body').append('svg').attr('height',h).attr('width',w).attr('id','screen4'))

d3.select('#screen1').append('g').attr('transform','translate(5,20)').append('text').text('Source Image').attr('fill','white')
d3.select('#screen4').append('g').attr('transform','translate(5,20)').append('text').text('Mean Intensity-Weighted Radiality').attr('fill','white')

d3.select('body').on('keypress', function(){
    console.log(d3.event.key)
    if (d3.event.key == 'a'){
        
        var randX = (imSize-10)*Math.random() + 5
        var randY = (imSize-10)*Math.random() + 5

        startData.sum( createBlob(width = startData.width, height = startData.height, randX, randY , 5) )
        startData.Gx = conv(startData, kx)
        startData.Gy = conv(startData, ky)
        startData.update(d3.select('#screen1'))
    }

    if (d3.event.key == 'r'){
        for (var i = 0; i<imSize;i++){
            for (var j =0; j<imSize;j++){
                startData.srrf.set(i,j, startData.getRadiality(i,j)*startData.get(i,j))
            }
        }
        startData.srrf.update(d3.select('#screen4'))
    }

    if (d3.event.key == 'i'){
        for (var i = 0; i<imSize;i++){
            for (var j =0; j<imSize;j++){
                startData.srrf.set(i,j, startData.get(i,j)*startData.getRadiality(i,j))
            }
        }
        startData.srrf.update(d3.select('#screen4'))
    }

    if (d3.event.key == 'n'){
        startData.data = startData.data.map(addNoise);
        startData.update(d3.select('#screen1'))
    }
})




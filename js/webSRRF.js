console.log('webSRRF.js');


function Im (paramObj){
    // take a parameter object with at least height, width, and an array of data
    var self = this;
    
    if (!paramObj){
        self.data = [];
        self.width = 0;
        self.height = 0;
        self.type = none;
    }

    if(paramObj){
        Object.keys(paramObj).forEach( function(key){
            self[key] = paramObj[key];
        } )
    }

    self.length = self.width * self.height;

    self.get = function (i,j) {
        if (i >= self.width || j>= self.height ){
            return null;
        }
        return self.data[i*self.width + j];
    }

    self.set = function (i,j,val) {
        if (i >= self.width || j>= self.height ){
            return null;
        }
        self.data[i*self.width + j] = val;
        return self;
    }

    self.sum = function(otherIm){
        if (self.data.length !== otherIm.data.length){
            return 'Length Mismatch'
        }
        for (var i = 0; i < self.data.length; i++){
            self.data[i] += otherIm.data[i]
        }
    }

    self.draw = function(svgSelection){

        if (self.type == 'interactive'){
            self.overlayInit(svgSelection)
        }

        s = d3.scaleLinear().domain(d3.extent(self.data)).range([0,255])
        // draw it's own data to an svg canvas
        var w = svgSelection.attr('width');
        var h = svgSelection.attr('height');

         svgSelection.selectAll('rect')
        .data(self.data)
        .enter()
        .append('rect')
        .attr('width', w / self.width)
        .attr('height', h / self.height)
        .attr('x', (d,i)=> ( (i%self.width) *(w / self.width) ) )
        .attr('y', (d,i)=> Math.floor(i/self.width)*(h / self.height))
        .attr('fill', function(d,i) {
            var color = Math.round(s(d));
            return `rgb(${color},${color},${color})`
        })
    }

    self.overlayInit = function(svg){
        svg
            .on('mouseenter', mouseEnterFunc)
            .on('mouseleave', mouseLeaveFunc)
            .on('mousemove', mouseMoveFunc)


        function mouseEnterFunc(){
            var x = d3.event.x;
            var y = d3.event.y;
            var pixW = svg.attr('width')/self.width;
            var pixH = svg.attr('height')/self.height;

            svg
                .append('rect')
                .attr('id','cursor')
                .attr('x',x - pixW/2)
                .attr('y',y - pixH/2)
                .attr('width', pixW)
                .attr('height', pixH)
                .attr('stroke','nonef')
                .attr('fill','orange')
                .attr('fill-opacity',0.5)

            //draw a set of lines over a point, radiating from 0,0 with the endpoints being the ring samples
            getRingSamples(30,8).forEach(function(p){
                svg
                    .append('path')
                    .attr('d', `M ${x} ${y}
                                L ${x + p[0]} ${y + p[1]}`)
                    .attr('stroke','orange')
                    .attr('class','overlayLine')
                    .attr('stroke-width', 2)
                    .attr('marker-end','url(#arrow)')
})
            
        }

        function mouseMoveFunc(){

            var debug = 0

            var i = Math.floor( (d3.event.x-5) / (svg.attr('width')/self.width))
            var j = Math.floor( (d3.event.y-5) / (svg.attr('height')/self.height));

            var x =  i * (svg.attr('width') /self.width) ;
            var y =  j * (svg.attr('height') /self.height) ;

            var pixW = svg.attr('width')/self.width;
            var pixH = svg.attr('height')/self.height;

            svg
                .select('#cursor')
                .attr('x',x)
                .attr('y',y)
            svg
                .selectAll('.overlayLine')
                .data(getRingSamples(20,8))
                .attr('d', function(p){

                            var ii = Math.floor( (d3.event.x + p[0] -5 ) / pixW)
                            var ji = Math.floor( (d3.event.y + p[1] -5 ) / pixH);

                            var xOffset = 40*self.Gx.get(ii,ji) //* self.get(i,j)
                            var yOffset = 40*self.Gy.get(ii,ji) //* self.get(i,j)

                            if (debug){
                                console.log('p',p[0],' ',p[1])
                                console.log('i ',i,' j ',j)
                                console.log('ii ',ii,' ji ',ji)
                                console.log('xoffset ',xOffset,' yOffset ',yOffset)
                            }

                            return `M ${x + p[0] + pixW/2} ${y + p[1] + pixH/2}
                                    L ${x + p[0] + pixW/2 - xOffset} ${y + p[1] + pixH/2 - yOffset}`})
                .attr('stroke-opacity',0.5)
        
        }

        function mouseLeaveFunc(){
            svg
                .selectAll('#cursor')
                .remove();
            svg
                .selectAll('.overlayLine')
                .remove()
        }
            }

}

function getRingSamples(ringRad=1, nSamples=4){
    // generate an array of nSamples points equally spaced around (0,0) at radius ringRad
    output = []
    output.length = nSamples;
    var theta = 0;
    for (var i=0; i < nSamples; i++){
        theta = i*2*Math.PI/nSamples;
        output[i] = [ringRad*Math.cos(theta), ringRad*Math.sin(theta)]
    }
    return output
}

function zeros(width, height){
    output = [];
    output.length = width*height;
    output.fill(0);
    return output;
}

var imSize = 32
var params = { data: zeros(imSize,imSize), width: imSize, height: imSize, type : 'interactive' };
var startData = new Im(params);

// make a quick blob

function createBlob(width = 32, height = 32, x0 = 16, y0 = 16, k = 6){
    var output = new Im({data : [], height : height, width : width});
    for (var i = 0; i < width; i++){
        for (var j = 0; j < height; j++){
            val = Math.exp(- Math.sqrt( ((i-x0)/k)**2 + ((j-y0)/k)**2 ))
            output.set(i,j, val);
        }
    }
    return output
}

startData.data = createBlob(width = startData.width, height = startData.height, 16, 16, 4).data
startData.sum( createBlob(width = startData.width, height = startData.height, 8, 8 , 4) )

// add an SVG canvas to the body
var w = 16*20;
var h = 16*20;
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
    .attr('markerHeight', 15)
    .attr('markerWidth', 15)
    .attr('refX',0)
    .attr('refY',3)
    .append('path')
    .attr('d',"M0,0 L0,6 L9,3")
    .attr('fill','orange')
    .attr('fill-opacity', .5)
    .attr('stroke','none')


startData.draw(d3.select('#screen1'))

// make a general convolution function
function conv(src, kernel){
     k_offset = [(Math.floor(kernel.width/2)), (Math.floor(kernel.height/2))]
    var fail_counter = 0
     buffer = new Im( {data : zeros(src.height, src.width), height : src.height, width : src.width } );
    
    for (var i = kernel.width; i < (src.width-kernel.width); i++){
        for (var j = kernel.width; j < src.height-kernel.height; j++){
            var temp_sum = 0
            for (var p = 0; p < kernel.width; p++){
                for (var q =0; q < kernel.height; q++){
                    try{
                        temp_sum += ( src.get( i+p-k_offset[0] , j+q-k_offset[1]) * kernel.get(p,q) ) ;
                    }
                    catch{
                        fail_counter += 1
                        print('fail')
                        if (fail_counter > 600){
                            return 'FAIL';
                        }
                    }
                }
            }
            buffer.set(i,j,temp_sum)
                }
            }
    return buffer
}


function drawOverlay(){

}

var ky = new Im( {data : [-1,0,1,-1,0,1,-1,0,1], width : 3, height: 3} )
var kx = new Im( {data : [-1,-1,-1,0,0,0,1,1,1], width : 3, height: 3} )


startData.Gx = conv(startData, kx)
startData.Gy = conv(startData, ky)



console.log('ding')
startData.Gx.draw(d3.select('body').append('svg').attr('height',h).attr('width',w).attr('id','screen2'))
startData.Gy.draw(d3.select('body').append('svg').attr('height',h).attr('width',w).attr('id','screen3'))



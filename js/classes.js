// object to hold image data and misc parameters.  The main point of this is to 
// implement a .get(i,j) method which lets me use a 1D array to store a 2d image data

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

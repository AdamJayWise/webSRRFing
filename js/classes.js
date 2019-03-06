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
        return self.data[i + j * self.width];
    }

    self.set = function (i,j,val) {
        if (i >= self.width || j>= self.height ){
            return null;
        }
        self.data[i + j*self.width] = val;
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

    self.update = function(svgSelection){

        s = d3.scaleLinear().domain(d3.extent(self.data)).range([0,255])
        // draw it's own data to an svg canvas
        var w = svgSelection.attr('width');
        var h = svgSelection.attr('height');

         svgSelection.selectAll('rect')
        .data(self.data)
        .attr('width', w / self.width)
        .attr('height', h / self.height)
        .attr('x', (d,i)=> ( (i%self.width) *(w / self.width) ) )
        .attr('y', (d,i)=> Math.floor(i/self.width)*(h / self.height))
        .attr('fill', function(d,i) {
            var color = Math.round(s(d));
            return `rgb(${color},${color},${color})`
        })
    }


    self.getRadiality = function(i,j){

        var svg = d3.select('#screen1')

        var pixW = svg.attr('width')/self.width;
        var pixH = svg.attr('height')/self.height;

        // keep track of the x and y position of that pixel on the svg 
        var x =  i * pixW ;
        var y =  j * pixH ;

        var radiality = 0;

        getRingSamples(ringRad, nSamples).forEach( function(p,n){
            // calculate a set of nSamples points around a ring of radius ringRad
            // centered at the test point, then for each point check the gradient there
            // and calculate the radiality
            
            // to make this more readable, the point on the ring will be (xi,yi)
            var xi = p[0];
            var yi = p[1];

            // calculate ii and ji, the index of the ring point's gradient value in the Gx and Gy
            // matricies 
            var ii = i + Math.round(xi/pixW)
            var ji = j + Math.round(yi/pixH);

            // store the value of the local gradient vectors components at the ring point
            var Gxi = self.Gx.get(ii,ji);
            var Gyi = self.Gy.get(ii,ji);

            // keep a scale constant to set the length of the displayed gradient vectors
            var vectorScale = -60;

            // calculate theta, the angle between the vector ri (from the test point xi,yi
            // to the ring point) and Gi (the gradient vector at xi,yi)
            var magAB = Math.sqrt(xi**2+yi**2) * Math.sqrt(Gxi**2+Gyi**2)
            var AdotB = (xi*Gxi)+(yi*Gyi)
            var theta = Math.acos(  AdotB / magAB  ) - Math.PI

            // calculate the convergence as a function of theta
            var ci = Math.sign(Math.cos(theta))*(1-Math.abs(Math.sin(theta)))**2

            // add the convergence of this ring point to the ring's count of convergence
            radiality += ci;
        })

        return radiality / nSamples;
        
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
            getRingSamples(ringRad, nSamples).forEach(function(p){
                svg
                    .append('path')
                    .attr('d', `M ${x} ${y}
                                L ${x + p[0]} ${y + p[1]}`)
                    .attr('stroke','orange')
                    .attr('class','overlayLine')
                    .attr('stroke-width', 2)
                    .attr('marker-start','url(#arrow)')
                    .attr('fill','none')
})
            
        }

        function mouseMoveFunc(){

            var debug = 0
            var ciMean = 0;
            var mouse = d3.mouse(this);
            var pixW = svg.attr('width')/self.width;
            var pixH = svg.attr('height')/self.height;

            // find the index of the pixel over which the mouse hovers
            var i = Math.round( (mouse[0] - pixW/2 ) / (svg.attr('width')/self.width))
            var j = Math.round( (mouse[1] - pixH/2 ) / (svg.attr('height')/self.height));
            // keep track of the x and y position of that pixel on the svg 
            var x =  i * pixW ;
            var y =  j * pixH ;

            // draw the cursor pixel and the gradient vectors
            svg
                .select('#cursor')
                .attr('x',x)
                .attr('y',y)
            svg
                .selectAll('.overlayLine')
                .attr('stroke-opacity',0.5)        
                .data(getRingSamples(ringRad, nSamples))
                .attr('d', function(p,n){
                            // calculate a set of nSamples points around a ring of radius ringRad
                            // centered at the test point, then for each point check the gradient there
                            // and calculate the radiality
                            
                            // to make this more readable, the point on the ring will be (xi,yi)
                            var xi = p[0];
                            var yi = p[1];

                            // calculate ii and ji, the index of the ring point's gradient value in the Gx and Gy
                            // matricies 
                            var ii = i + Math.round(xi/pixW)
                            var ji = j + Math.round(yi/pixH);

                            // store the value of the local gradient vectors components at the ring point
                            var Gxi = self.Gx.get(ii,ji);
                            var Gyi = self.Gy.get(ii,ji);

                            // keep a scale constant to set the length of the displayed gradient vectors
                            var vectorScale = -60;

                            // calculate theta, the angle between the vector ri (from the test point xi,yi
                            // to the ring point) and Gi (the gradient vector at xi,yi)
                            var magAB = Math.sqrt(xi**2+yi**2) * Math.sqrt(Gxi**2+Gyi**2)
                            var AdotB = (xi*Gxi)+(yi*Gyi)
                            var theta = Math.acos(  AdotB / magAB  ) - Math.PI

                            // calculate the convergence as a function of theta
                            var ci = Math.sign(Math.cos(theta))*(1-Math.abs(Math.sin(theta)))**2

                            // add the convergence of this ring point to the ring's count of convergence
                            ciMean += ci;

                            // return a path for the vector to be displayed at this ring point
                            return `M ${x + p[0] + pixW/2} ${y + p[1] + pixH/2}
                                    L ${x + p[0] + pixW/2 + Gxi*vectorScale} ${y + p[1] + pixH/2 + Gyi*vectorScale}
                                    `})
                self.srrf.set(i,j,ciMean/nSamples * self.get(i,j))
                self.srrf.update(d3.select("#screen4"))
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

// I want to have a function that will calculate radiality at a point i,j


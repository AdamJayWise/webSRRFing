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

// normal random sample generator
function randnBM() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function addNoise(x){
    return x + 0.01*randnBM();
}
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
const showGraph = document.getElementById('show-graph');
const genGraph = document.getElementById('generate-graph');

// initialize graph options
const options = {
    edges : {
        color : 'green',
        font: {size: 18}
    },
    nodes:{
        fixed: false,
        font: '16px sans-serif black',
        scaling: {
            label: true
        },
        shape : 'icon',
        icon : {
            face : 'FontAwesome',
            code : '\ue065',
            size : 40,
            color : 'blue'
        },
        shadow: true
    }
}

// initialize network
const network = new vis.Network(showGraph);
network.setOptions(options);

function createData() {
    const cities = ['New Delhi', 'Alwar', 'Jaipur', 'Nainital', 'Mysore', 'Chennai', 'Shillong', 'Imphal', 'Goa'];
    const v = Math.floor(Math.random() * (cities.length - 3)) + 3;

    // creating vertices for the graph
    let vertices = [];
    for (let i = 0; i < v; i++)
        vertices.push({id: i, label: cities[i]});


    // creating edges for the graph
    let edges = [];
    let noOfEdges = Math.floor(Math.random() * v/2) + v;
    console.log("no of edges = ", noOfEdges);
    while (noOfEdges--) {
        let s = Math.floor(Math.random() * v), d = Math.floor(Math.random() * v);
        if (d === s) d--;
        if (d < 0) d = 2;
        edges.push({from : s, to: d, label : String(Math.floor(Math.random() * 135) + 30)});
    }

    // preparing data object for VisJs
    return {nodes : vertices, edges : edges};
}

genGraph.onclick = function () {
    // createData();
    network.setData(createData());
}

genGraph.click();


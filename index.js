const problemGraph = document.getElementById('problem-graph');
const solutionGraph = document.getElementById('solution-graph');
const solveGraph = document.getElementById('solve-graph');
const genGraph = document.getElementById('generate-graph');
const cities = ['New Delhi', 'Alwar', 'Jaipur', 'Nainital', 'Mysore', 'Chennai', 'Shillong', 'Imphal', 'Goa', 'Mumbai'];
let v, vertices = [], edges = [], src, dest;

let rand = function (val, add = 0) {
    return Math.floor(Math.random()*val + add);
}


// initialize graph options
const options = {
    edges : {
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
            code : '\uf015',
            size : 40,
            color : 'blue'
        },
        shadow: true
    }
}

// initialize network
const network1 = new vis.Network(problemGraph);
network1.setOptions(options);
const network2 = new vis.Network(solutionGraph);
network2.setOptions(options);

function createData() {
    v = rand(cities.length - 4, 5);

    // creating vertices for the graph
    vertices = [];
    for (let i = 0; i < v; i++)
        vertices.push({id: i, label: cities[i]});

    // Prepares vis.js style nodes for our data
    vertices = new vis.DataSet(vertices);

    // creating edges for the graph
    edges = [];
    for (let i = 1; i<v; i++)  // connecting each node once
        edges.push({type : 0, color: 'green', from : i, to: i-1, label : String(rand(135, 30))});

    let extraEdges = rand(2 * v/3, v/3), flight = 2;
    while (extraEdges--) {
        let s = rand(v), d = rand(v);
        if (s === d) continue;

        let type = (flight > 0) ? 1 : rand(2);  // type is 1 for air and 0 for road
        flight --;
        let color = type ? 'orange' : 'green'; // color is orange for air and green for road
        edges.push({type : type, color: color, from : s, to: d, label : String(rand(135, 30))});
    }

    src = rand(v/2);
    dest = rand(v/2, v/2);

    // preparing data object for VisJs
    return {nodes : vertices, edges : edges};
}

genGraph.onclick = function () {
    solutionGraph.style.display = "none";
    document.getElementById('total-time').style.display = "none";
    solveGraph.style.display = "block";

    network1.setData(createData());

    document.getElementById('from').innerText = cities[src];
    document.getElementById('to').innerText = cities[dest];
}
genGraph.click();


// starting to solve the problem
solveGraph.onclick = function () {
    let sol = solveData();

    solutionGraph.style.display = "inline";
    solveGraph.style.display = "none";

    document.getElementById('total-time').style.display = "block";
    document.getElementById('time').innerHTML = sol.totalDist;

    network2.setData({nodes: vertices, edges : sol.solutionEdges});
}

function solveData() { // this will return the solution graph to visJs
    const graph = createGraph(); // taking graph

    // creating to arrays to store
    const dist1 = dijkstra(graph, src); // min dist to each node from src
    const dist2 = dijkstra(graph, dest); // min dist to each node from dest

    let minRoadDist = dist1[dest][0];   // minDist when no flight is taken into consideration

    let p = planeTime(dist1, dist2); // taking one flight
    let planeEdge = p.ret, minAirCost = p.minCost;

    let solutionEdges, totalDist;
    if (minRoadDist <= minAirCost) {
        solutionEdges = formEdges(src, dest, dist1);
        totalDist = minRoadDist;
    } else {
        solutionEdges = formEdges(src, planeEdge.from, dist1);
        solutionEdges.push({arrows: {to : {enabled: true}}, color: 'orange', from : planeEdge.from, to: planeEdge.to, label : planeEdge.wt});
        solutionEdges.push(...formEdges(dest, planeEdge.to, dist2, true));
        totalDist = minAirCost;
    }
    return {solutionEdges, totalDist};
}

// creating graph from given edges
function createGraph() {
    let graph = [];
    for (let i=0; i<v; i++) graph.push([]);

    for (let i of edges) {
        if (i.type === 1) continue;

        graph[i.from].push([i.to, parseInt(i.label)]);
        graph[i.to].push([i.from, parseInt(i.label)]);
    }
    return graph;
}

function dijkstra(graph, src) {
    let dist = [];
    for (let i = 0; i < v; i++) // initialising dist array
        dist.push([1000, -1]);  // dist[i][0] -> minDist to reach i; dist[i][1] -> parent to reach here(used to form solution graph)
    dist[src][0] = 0;

    dfs(src, dist, graph); // running dfs to obtain minDistances to each node
    return dist;
}

function dfs(r, dist, graph) {
    for (let i of graph[r]) { // iterating over neighbours of current node
        if (dist[i[0]][0] > dist[r][0] + i[1]) { // if the dist to reach this neigh can be decreased-> update and recur
            dist[i[0]][0] = dist[r][0] + i[1];
            dist[i[0]][1] = r;
            dfs(i[0], dist, graph);
        }
    }
}

function planeTime(dist1, dist2) {
    let ret, minCost = 1000;
    for (const edge of edges) {
        if (edge.type === 0) continue;
        if (minCost > dist1[edge.from][0] + parseInt(edge.label) + dist2[edge.to][0]) {
            ret = {from : edge.from, to : edge.to, wt : edge.label};
            minCost = dist1[edge.from][0] + parseInt(edge.label) + dist2[edge.to][0];
        }
        // since flights are also bidirectional, the cost to reach dest from src of flight + to reach dest of flight from src could be minimum
        if (minCost > dist1[edge.to][0] + parseInt(edge.label) + dist2[edge.from][0]) {
            ret = {from : edge.to, to : edge.from, wt : edge.label};
            minCost = dist1[edge.to][0] + parseInt(edge.label) + dist2[edge.from][0];
        }
    }
    return {ret, minCost};
}

function formEdges(s, d, dist, toReverse = false) {
    let ret = [];
    while (s !== d) {
        let from = dist[d][1], to = d;
        if (toReverse) [from, to] = [to, from];
        ret.push({
            arrows: {to : {enabled: true}},
            from : from,
            to : to,
            color : 'green',
            label : String(dist[d][0] - dist[dist[d][1]][0])
        });
        d = dist[d][1];
    }
    return ret;
}
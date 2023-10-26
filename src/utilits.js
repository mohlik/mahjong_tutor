const objNeighbour = (obj, x, y, pool, depth) => {
    return pool.find((o) => { 
        const objX = (obj.x + x * 39.9 + depth.x),
              objY = (obj.y + y * 57.4 + depth.y);

        return (o.x - objX > -1 && o.x - objX < 1) && (o.y - objY > -1 && o.y - objY < 1)
    })
};

const leftTable = [
    {x: -1, y: -0.5},
    {x: -1, y: 0},
    {x: -1, y: 0.5}
];

const rightTable = [
    {x: 1, y: -0.5},
    {x: 1, y: 0},
    {x: 1, y: 0.5}
];

const topTable = [
    {x: -0.5, y: -0.5},
    {x: 0, y: -0.5},
    {x: 0.5, y: -0.5},
    {x: -0.5, y: 0},
    {x: 0, y: 0},
    {x: 0.5, y: 0},
    {x: -0.5, y: 0.5},
    {x: 0, y: 0.5},
    {x: 0.5, y: 0.5}
]; 

const bombTable = [
    {x: -1, y: 0},
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x: 0, y: -1},
    {x: 1, y: -0.5},
    {x: -1, y: -0.5},
    {x: -1, y: 0.5},
    {x: 1, y: 0.5},
    {x: -0.5, y: -1},
    {x: -0.5, y: 1},
    {x: 0.5, y: 1},
    {x: 0.5, y: -1},
]

const tablesNeighbours = {
    left: leftTable, 
    right: rightTable, 
    top: topTable,
    bomb: bombTable
}

const toLocal = (container, pt) => {
    var containers = [];
    var parent_contaiter = container;
    var holder;
    if (!pt) pt = {x: 0, y: 0};
    var new_pt = new Phaser.Geom.Point(pt.x, pt.y);
    while (parent_contaiter && parent_contaiter != this.scene) {
        containers.push(parent_contaiter);
        parent_contaiter = parent_contaiter.parentContainer;
    }
    while(containers.length > 0) {
        holder = containers.pop();
        new_pt.x = (new_pt.x - holder.x) / holder.scaleX;
        new_pt.y = (new_pt.y - holder.y) / holder.scaleY;
    }
     return new_pt;
}

const toGlobal = (container, pt = {x:0, y:0}) => {
    if (!pt) pt = {x:0, y:0}
    let new_pt = new Phaser.Geom.Point(pt.x, pt.y);
    var parent_contaiter = container;
    while (parent_contaiter && parent_contaiter != this.scene) {
            new_pt.x = new_pt.x * parent_contaiter.scaleX + parent_contaiter.x;
            new_pt.y = new_pt.y * parent_contaiter.scaleY + parent_contaiter.y;
            parent_contaiter = parent_contaiter.parentContainer;
    }
    return new_pt;
}

export {objNeighbour, tablesNeighbours, toLocal, toGlobal}
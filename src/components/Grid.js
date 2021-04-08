import React, { useState, useEffect, useCallback, useRef } from 'react';
import produce from 'immer';
import axios from 'axios';

const initialSize = {};

const Grid = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [gridSize, setGridSize] = useState(initialSize)
    const [myGrid, setMyGrid] = useState([]);
    const [counter, setCounter] = useState(0);
    const [allGrids, setAllGrids] = useState([]);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const createSound = () => {
        const osc = audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, audioContext.currentTime);
        osc.connect(audioContext.destination);
        console.log(osc);
        osc.releaseTime = 0.5;
        osc.start();
        osc.stop(1);
        // osc.disconnect(audioContext.destination);
    }

    const firstGridLoad = () => {
        
        axios.get("http://localhost:3001/gridsAPI")
            .then(resp => {
                const {gridWidth, gridHeight, myGrid} = resp.data[0];
                const tempGrid = convertGrid(myGrid);          
                const tempGridSize = returnGridSize(gridWidth, gridHeight);

                setAllGrids(resp.data);
                setGridSize(tempGridSize);
                setMyGrid(tempGrid);
            })
    }

    const returnGridSize = (gridWidth, gridHeight) => {
        const tempGridSize = {
            gridWidth: gridWidth,
            gridHeight: gridHeight
        }
        return tempGridSize;
    }

    const convertGrid = (inputGrid) => {
        let gridParsed = JSON.parse(inputGrid).split("|");

        const tempGrid = [];
        gridParsed.forEach((row) => {
            let convertedRow = row.split("-");
            let eachNum = convertedRow.map((num) => {
                return parseInt(num);
            })
            tempGrid.push(eachNum);
        })
        return tempGrid;
    }

    useEffect(() =>{
        firstGridLoad();
        console.log(gridSize);
        setupGrid();
    }, [])

    const checkNeighbors = [
        [0, 1], //right
        [0, -1],//left
        [1, -1],//top left
        [-1, 1],//bottom right
        [1, 1],//top right
        [-1, -1],//bottom left
        [1, 0],//top
        [-1, 0]//bottom
    ]


    const runningRef = useRef();
    runningRef.current = isRunning;

    const runGameOfLife = useCallback(() => {
        if(!runningRef.current){
            return;
        }
        console.log("on");

        setMyGrid(myGrid => { 
            //get width & height length of current Grid
            let width = myGrid.length;
            let height = myGrid[0].length;

            return produce(myGrid, gridCopy => {
                //Iterate through the width of the grid
                for(let i =0; i < width;i++){
                    //Iterate through the height, which would be each element
                    for(let j=0; j < height; j++){
                        //keep track of the number of neighbors for the current element
                        let neighbors = 0;
                        
                        for(let n in checkNeighbors){
                            //using the checkNeighbors checker object
                            //add 
                            const newI = i + checkNeighbors[n][0];
                            const newJ = j + checkNeighbors[n][1];

                            if((newI >= 0) && (newI < width) && (newJ >= 0) && (newJ < height)){
                                neighbors += myGrid[newI][newJ];
                            }
                        }
                        
                        //If there are less than 2 neighbors
                        //or more than 3 neighbors, delete cell
                        if(neighbors < 2 || neighbors > 3) {
                            gridCopy[i][j] = 0; 
                        }

                        //If cell is empty and there are exactly 3 neighbors
                        //fill in new cell
                        if((myGrid[i][j] === 0) && neighbors === 3){
                            gridCopy[i][j] = 1;
                        }
                    }
                }
            }

            )
            }
        )

        setTimeout(runGameOfLife, 100);
    }, [])

    const showGrid =() => {
        return myGrid.map((item, i) => {
            return item.map((spot, k) => {
                return Draw(i, k);
            })        
        })
    }

    const setupGrid = () => {
        let width = parseInt(gridSize.gridWidth, 10);
        let height = parseInt(gridSize.gridHeight, 10);
        const newGrid = [];

        for(let i = 0; i < width; i++){
            newGrid.push(Array.from(Array(height), () => 0))
        }

        setGridSize({
            gridSize: {
                gridWidth: width,
                gridHeight: height
            }
        })
        console.log(gridSize);
        setMyGrid(newGrid);
    }

    const changeBox = (i, key) => {
        // createSound();
        let updateGrid = [...myGrid];
        updateGrid[i][key] = updateGrid[i][key] ? 0: 1;
        setMyGrid(updateGrid);
    }

    const Draw = (i, key) => {
        return(
            <div key={`${i}-${key}`} 
            onClick={() => changeBox(i, key)}
            style={{width: 10, 
            height: 10, 
            backgroundColor: myGrid[i][key] ? 'green' :'lightblue',
            border: "solid 1px black"
        }}></div>
        )

    }

    const convertGridToString = (gridCopy) =>{
        return gridCopy.map((g) => {
            return g.join("-");
        }).join("|");
    }

    const saveGrid = () => {
        console.log(myGrid);
        let width = myGrid.length;
        let height = myGrid[0].length;

        let gridCopy = [...myGrid];
        const gridString = convertGridToString(gridCopy);

        const gridObject = {
            gridWidth: width,
            gridHeight: height,
            myGrid: JSON.stringify(gridString)
        }

        axios.post('http://localhost:3001/gridsAPI/new', gridObject)
            .then((res) => {
                console.log(res.data)
            }).catch((error) => {
                console.log(error);
            })
    }

    const loadNextGrid = () => {
        console.log(allGrids[counter]);
        console.log(counter);
        let tempCounter = counter;
        tempCounter+=1;
        if(tempCounter >= allGrids.length){
            tempCounter = 0;
        }

        const { gridWidth, gridHeight, myGrid } = allGrids[tempCounter];
        console.log("width: ", gridWidth)
        console.log("height: ", gridHeight)
        console.log("grid: ", myGrid)
        const tempGrid = convertGrid(myGrid);          
        const tempGridSize = returnGridSize(gridWidth, gridHeight);

        setGridSize(tempGridSize);
        setMyGrid(tempGrid);

        // setMyGrid(allGrids[tempCounter]);
        setCounter(tempCounter);
    }

    const handleChange = (e) => {
        setGridSize({
            ...gridSize, [e.target.name]: parseInt(e.target.value)
        })
        console.log(gridSize);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(gridSize);
        setGridSize({
            gridSize: {
                gridWidth: gridSize.gridWidth,
                gridHeight: gridSize.gridHeight
            } 
        })
        console.log(gridSize);
        setupGrid();
    }

    return(
        <div>
            <button className="btn" onClick={() => {setIsRunning(!isRunning);runGameOfLife()}}>{isRunning ? "Stop" : "Start"}</button>
            <button className="btn" onClick={() => saveGrid()}>Save</button>
            <button className="btn" onClick={() => loadNextGrid()}>Load</button>
        
            <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Grid Size</legend>
                <label htmlFor="gridWidth">Grid Width:</label>
                <input type="number" id="gridWidth" name="gridWidth" value={gridSize.gridWidth} onChange={handleChange}/>
                <label htmlFor="gridHeight">Grid Height:</label>
                <input type="number" id="gridHeight" name="gridHeight" value={gridSize.gridHeight} onChange={handleChange}/>
                <input className="btn" type="submit" value="Submit"/>
            </fieldset>
            </form>
            <div style={{paddingTop: 50, justifyContent: 'center', display: 'grid', gridTemplateColumns: `repeat(${gridSize.gridWidth}, 10px)`}}>
                {showGrid()}
            </div>
        </div>
    )
}

export default Grid;
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
    const gainNode = audioContext.createGain();

    const playSound = () => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';

        let randomNote = Math.floor(Math.random() * (500 - 200) + 200);
        osc.frequency.setValueAtTime(randomNote, audioContext.currentTime);
        osc.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.value = 0.1;
        
        gainNode.connect(audioContext.destination);
        osc.start();
        osc.stop(1);
    }

    const runSound = () => {
        const osc = audioContext.createOscillator();
        osc.type = "square";

        if(isRunning){
            osc.frequency.value = 108;
        } else {
            osc.frequency.value = 100;
        }

        osc.connect(gainNode);
        gainNode.gain.value = 0.1;
        gainNode.connect(audioContext.destination);
        osc.start();
        osc.stop(1);
        
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
        setMyGrid(newGrid);
    }

    const changeBox = (i, key) => {
        playSound();
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
        let tempCounter = counter;
        tempCounter+=1;
        if(tempCounter >= allGrids.length){
            tempCounter = 0;
        }

        const { gridWidth, gridHeight, myGrid } = allGrids[tempCounter];
        const tempGrid = convertGrid(myGrid);          
        const tempGridSize = returnGridSize(gridWidth, gridHeight);

        setGridSize(tempGridSize);
        setMyGrid(tempGrid);
        setCounter(tempCounter);
    }

    const handleChange = (e) => {
        setGridSize({
            ...gridSize, [e.target.name]: parseInt(e.target.value)
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setGridSize({
            gridSize: {
                gridWidth: gridSize.gridWidth,
                gridHeight: gridSize.gridHeight
            } 
        })
        setupGrid();
    }

    return(
        <div>
            <button className="btn" onClick={() => {setIsRunning(!isRunning);runGameOfLife(); runSound()}}>{isRunning ? "Stop" : "Start"}</button>
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
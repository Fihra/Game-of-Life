import React, { useState, useEffect, useCallback, useRef } from 'react';
import produce from 'immer';

const Grid = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [gridSize, setGridSize] = useState({
        gridWidth: 64,
        gridHeight: 64
    })
    const [myGrid, setMyGrid] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() =>{
        setupGrid();
    }, [])


    const checkNeighbors = [
        [0, 1],
        [0, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, 0],
        [-1, 0]
    ]


    const runningRef = useRef();
    runningRef.current = isRunning;

    const runGameOfLife = useCallback(() => {
        if(!runningRef.current){
            return;
        }
        console.log("on");

        let width = parseInt(gridSize.gridWidth);
        let height = parseInt(gridSize.gridHeight);

        setMyGrid(myGrid => { 
            return produce(myGrid, gridCopy => {
                for(let i =0; i < width;i++){
                    for(let j=0; j < height; j++){
                        let neighbors = 0;

                        for(let n in checkNeighbors){
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
        console.log(myGrid);
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

        setMyGrid(newGrid);
    }

    const changeBox = (i, key) => {
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

    const handleChange = (e) => {
        // setSubmitted(false);
        setGridSize({
            ...gridSize, [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(gridSize);
        // setSubmitted(true);
        setupGrid();
    }

    return(
        <div>
            <button onClick={() => {setIsRunning(!isRunning);runGameOfLife()}}>{isRunning ? "Stop" : "Start"}</button>
        
            <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Grid Size</legend>
                <label htmlFor="gridWidth">Grid Width:</label>
                <input type="number" id="gridWidth" name="gridWidth" value={gridSize.gridWidth} onChange={handleChange}/>
                <label htmlFor="gridHeight">Grid Height:</label>
                <input type="number" id="gridHeight" name="gridHeight" value={gridSize.gridHeight} onChange={handleChange}/>
                <input type="submit" value="Submit"/>
            </fieldset>
            </form>
            <div style={{paddingTop: 50, justifyContent: 'center', display: 'grid', gridTemplateColumns: `repeat(${gridSize.gridWidth}, 10px)`}}>
                {/* {submitted ? showGrid() : null} */}
                {showGrid()}
            </div>
        </div>
    )
}

export default Grid;
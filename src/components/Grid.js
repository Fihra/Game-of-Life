import React, { useState, useEffect } from 'react';

const Grid = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [gridSize, setGridSize] = useState({
        gridWidth: 64,
        gridHeight: 64
    })
    const [myGrid, setMyGrid] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    // const [gridArray, setGridArray] = useState();

    useEffect(() =>{
        setupGrid();
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
        console.log("here")
        updateGrid[i][key] = updateGrid[i][key] ? 0: 1;
        setMyGrid(updateGrid);
    }

    const Draw = (i, key) => {
        console.log("Drawing")
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
            <button onClick={() =>setIsRunning(!isRunning)}>{isRunning ? "Stop" : "Start"}</button>
        
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
import React, { useState } from 'react';

const Grid = () => {
    const [isRunning, setIsRunning] = useState(false);

    const [gridSize, setGridSize] = useState({
        gridWidth: 64,
        gridHeight: 64
    })

    const showGrid = () => {

    }

    const handleChange = (e) => {
        setGridSize({
            ...gridSize, [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e.target.value);
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
            {showGrid()}
        </div>
    )
}

export default Grid;
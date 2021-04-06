import React, { useState } from 'react';

const Grid = () => {
    const [isRunning, setIsRunning] = useState(false);

    return(
        <div>
            <button onClick={() =>setIsRunning(!isRunning)}>{isRunning ? "Stop" : "Start"}</button>
        </div>
    )
}

export default Grid;
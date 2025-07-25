import React from "react";
import Home from "./Section/Home";
import PatchPlayer from "./components/patchplayer/PatchPlayer";

const App: React.FC = () => {
    return (
        <div>
            <Home />
            <PatchPlayer patchFilePath={`${import.meta.env.BASE_URL}pd-patch/AudioTest.pd`} />
        </div>
    );
};

export default App;

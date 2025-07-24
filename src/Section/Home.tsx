import React from "react";
import "./Home.css";

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <main>
                <h1>Pure Data on Web</h1>
                <p>このサイトでは、ブラウザ上で動作するPureDataパッチを体験できます。</p>
            </main>
        </div>
    );
};

export default Home;
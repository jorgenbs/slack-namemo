import React, { useState, useEffect } from "react";

import { fetchMembers, shuffle } from "../slack";

const Styles = () => (
  <style jsx global>
    {`
      html,
      body {
        height: 100%;
      }
      body {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
      img {
        border-radius: 15px;
      }
      p {
        color: #2c2c2c;
      }
    `}
  </style>
);

const hotKeys = ({ reveal, next }) => {
  const [initiated, setInitiated] = useState(false);

  function handleKeyDown({ keyCode: key }) {
    const KEY_RIGHT = 39;
    const KEY_UP = 38;

    if (key === KEY_RIGHT) {
      next();
    } else if (key === KEY_UP) reveal();
  }

  useEffect(() => {
    if (!initiated) {
      document.addEventListener("keydown", handleKeyDown);
      setInitiated(true);
    }
  });
};

const Home = ({ members }) => {
  const [page, setPage] = useState(0);
  const [reveal, setReveal] = useState(false);

  const next = () => {
    setReveal(false);
    setPage(prevPage => {
      if (prevPage >= members.length - 1) {
        members = shuffle(members);
        return 0;
      } else {
        return prevPage + 1;
      }
    });
  };

  hotKeys({ reveal: () => setReveal(true), next });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: 1
      }}
    >
      <Styles />
      <div style={{ height: "80px" }}>
        {reveal && (
          <>
            <p style={{ fontSize: "30px", display: "inline-block" }}>
              {members[page].name}
            </p>
            <div
              style={{
                backgroundColor: "#32715d",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                marginBottom: "4px",
                marginLeft: "10px",
                display: "inline-block"
              }}
            />
          </>
        )}
      </div>
      <div>
        {members.map((m, i) => (
          <img
            alt="profile"
            key={i}
            style={{
              width: "400px",
              display: i === page ? "block" : "none"
            }}
            src={m.image}
          />
        ))}
      </div>
      <p>
        {page + 1}/{members.length}
      </p>
      <div>
        <div onClick={() => setReveal(true)}>⬆️ to reveal</div>
        <div onClick={() => next()}>➡️ to go next</div>
      </div>
    </div>
  );
};

Home.getInitialProps = async () => {
  const members = await fetchMembers();
  return { members: shuffle(members) };
};

export default Home;

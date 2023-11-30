import React, { useState } from "react";

const Cascader = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <div
      className="cascader"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="cursor-pointer border px-2 py-1">Select an option</span>
      {isDropdownVisible && (
        <ul>
          <li>
            Option 1{" "}
            <ul>
              <li>Option 1.1</li>
              <li>Option 1.2</li>
            </ul>{" "}
          </li>{" "}
          <li>
            Option 2{" "}
            <ul>
              <li>Option 2.1</li>
              <li>Option 2.2</li>{" "}
            </ul>
          </li>{" "}
          <li>
            Option 3{" "}
            <ul>
              {" "}
              <li>Option 3.1</li> <li>Option 3.2</li>{" "}
            </ul>{" "}
          </li>{" "}
        </ul>
      )}{" "}
    </div>
  );
};

export default Cascader;

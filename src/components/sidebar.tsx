import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./sidebar.css";
import SideBarNav from "./sidebarNav";
import SidebarNavToggle from "./sidebarNavToggle";
import { appNavs } from "../config/sidebar";

const SideBar = () => {
  const [expand, setExpand] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setExpand(false);
  }, [location]);

  return (
    <>
      <div className="btn-sidebar-nav">
        <SidebarNavToggle expand={expand} onChange={() => setExpand(!expand)} />
      </div>
      <div className={"sidebar " + (expand ? "visible" : "")}>
        <SideBarNav navs={appNavs} />
      </div>
    </>
  );
};

export default SideBar;

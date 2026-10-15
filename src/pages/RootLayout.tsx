import { Outlet } from "react-router";
import Sidebar from "../components/base/Sidebar";

const RootLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
import { Menu } from "antd";

export const GroupMenu = ({ regionStore }) => {
  return (
    <Menu selectedKeys={[regionStore.view]}>
      <Menu.Item key="regions">
        <div
          onClick={ev => {
            regionStore.setView("regions");
            ev.preventDefault();
            return false;
          }}
          style={{ width: "135px", display: "flex", justifyContent: "space-between" }}
        >
          <div>标注区域</div>
        </div>
      </Menu.Item>
      <Menu.Item key="labels">
        <div
          onClick={ev => {
            regionStore.setView("labels");
            ev.preventDefault();
            return false;
          }}
          style={{ width: "135px", display: "flex", justifyContent: "space-between" }}
        >
          <div>标签</div>
        </div>
      </Menu.Item>
    </Menu>
  );
};

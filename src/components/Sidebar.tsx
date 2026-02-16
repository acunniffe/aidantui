import React from "react";
import type { Screen } from "../hooks/useRouter";

interface SidebarProps {
  current: Screen;
}

const NAV_ITEMS: { key: string; label: string; screen: Screen["name"] }[] = [
  { key: "c", label: "Calendar", screen: "calendar" },
  { key: "p", label: "Pipeline", screen: "pipeline" },
  { key: "o", label: "Contacts", screen: "contacts" },
];

export function Sidebar({ current }: SidebarProps) {
  return (
    <box
      width={14}
      height="100%"
      backgroundColor="#0f3460"
      paddingTop={1}
      paddingLeft={1}
      paddingRight={1}
    >
      {NAV_ITEMS.map((item) => {
        const active = current.name === item.screen;
        const prefix = active ? "▸ " : "  ";
        const color = active ? "#64ffda" : "#8892b0";
        return (
          <box key={item.key} height={1}>
            <text content={`${prefix}${item.label}`} fg={color} />
          </box>
        );
      })}
    </box>
  );
}

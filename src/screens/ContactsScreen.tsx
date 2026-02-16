import React, { useState } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { Router } from "../hooks/useRouter";
import { useContacts } from "../hooks/useContacts";
import { truncate } from "../utils/format";

interface ContactsScreenProps {
  router: Router;
  inputFocused: boolean;
}

export function ContactsScreen({ router, inputFocused }: ContactsScreenProps) {
  const { contacts } = useContacts();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { width } = useTerminalDimensions();

  useKeyboard((key) => {
    if (inputFocused) return;

    switch (key.name) {
      case "up":
      case "k":
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
      case "j":
        setSelectedIndex((prev) =>
          Math.min(contacts.length - 1, prev + 1)
        );
        break;
      case "return":
        if (contacts[selectedIndex]) {
          router.navigate({
            name: "contact-detail",
            contactId: contacts[selectedIndex].id,
          });
        }
        break;
    }
  });

  if (contacts.length === 0) {
    return (
      <box paddingTop={1}>
        <text fg="#495670" content="  No contacts yet." />
        <text fg="#495670" content="  Contacts are auto-created from calendar attendees." />
      </box>
    );
  }

  const contentWidth = Math.max(width - 16, 30);

  return (
    <box width="100%">
      <box height={1}>
        <text fg="#8892b0" content={`  ${contacts.length} contacts  │  ↑/↓ navigate  Enter=details`} />
      </box>
      <scrollbox>
        {contacts.map((contact, i) => {
          const selected = i === selectedIndex;
          const prefix = selected ? "▸ " : "  ";
          const color = selected ? "#64ffda" : "#ccd6f6";
          const bg = selected ? "#1a1a2e" : undefined;
          const emailStr = contact.email ? ` <${contact.email}>` : "";
          const companyStr = contact.company ? ` │ ${contact.company}` : "";
          const line = `${prefix}${truncate(contact.name, 30)}${emailStr}${companyStr}`;

          return (
            <box
              key={contact.id}
              height={1}
              width="100%"
              backgroundColor={bg}
            >
              <text fg={color} content={truncate(line, contentWidth)} />
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}

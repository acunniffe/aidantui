import { useState, useEffect, useCallback } from "react";
import type { Contact } from "../types";
import { getDb } from "../db/connection";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const refresh = useCallback(() => {
    const db = getDb();
    const rows = db
      .query(
        `SELECT * FROM contacts
         WHERE merged_into IS NULL
         ORDER BY name ASC`
      )
      .all() as Contact[];
    setContacts(rows);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contacts, refresh };
}
